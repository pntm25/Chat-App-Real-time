import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"
import { io } from "socket.io-client";

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser:res.data })
            get().connectSocket();

        } catch (error) {
            console.log("Error in useAuthStore", error)
            set({ authUser: null })

        }finally{
            set({ isCheckingAuth: false })
        }
    },

    signUp: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data })
            toast.success("Account created successfully")

        } catch (error) {
            toast.error(error.response.data.message)

        }finally{
            set({ isSigningUp: false })
        }
        get().connectSocket();
    },

    logIn: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();

    } catch (error) {
      toast.error(error.response.data.message);

    } finally {
      set({ isLoggingIn: false });
    }
  },

    logOut: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")
            get().disconnectSocket();

        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      
      toast.success("Profile updated successfully! 🎉", {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: 'white',
          fontSize: '16px'
        }
      });
      
    } catch (error) {
      console.log("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Something went wrong");

    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const {authUser} = get();
    if (!authUser || get().socket?.connected){
      return;
    }

    const socket = io(baseURL, {
      query: { userId: authUser._id }
    });
    socket.connect();
    set({ socket : socket });

    socket.on("onlineUsers", (userIds) => {
      set({ onlineUsers : userIds });
    });

    // WebRTC call signaling listeners
    socket.on("incoming-call", ({ from, offer, callType, callerInfo }) => {
      import("./useCallStore.js").then(({ useCallStore }) => {
        useCallStore.getState().handleIncomingCall({ from, offer, callType, callerInfo });
      });
    });

    socket.on("call-accepted", ({ answer }) => {
      import("./useCallStore.js").then(({ useCallStore }) => {
        useCallStore.getState().handleCallAccepted({ answer });
      });
    });

    socket.on("ice-candidate", ({ candidate }) => {
      import("./useCallStore.js").then(({ useCallStore }) => {
        useCallStore.getState().handleNewIceCandidate({ candidate });
      });
    });

    socket.on("end-call", () => {
      import("./useCallStore.js").then(({ useCallStore }) => {
        useCallStore.getState().endCall(false);
      });
    });

    socket.on("reject-call", () => {
      import("./useCallStore.js").then(({ useCallStore }) => {
        useCallStore.getState().handleCallRejected();
      });
    });

    // Request Notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.permission !== "denied" && Notification.requestPermission();
    }

    // Typing socket event listener
    socket.on("typing", ({ from, isTyping }) => {
      import("./useChatStore.js").then(({ useChatStore }) => {
        useChatStore.getState().setTypingUsers(from, isTyping);
      });
    });

    // Background push notifications on new message
    socket.on("newMessage", (newMessage) => {
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        import("./useChatStore.js").then(({ useChatStore }) => {
          const sender = useChatStore.getState().users.find((u) => String(u._id) === String(newMessage.senderId));
          if (sender) {
            const senderName = sender.fullName;
            const content = newMessage.text || (newMessage.image ? "[Attachment]" : newMessage.voice ? "[Voice Message]" : "Sticker");
            new Notification(senderName, {
              body: content,
              icon: sender.profilePic || "/avatar.png"
            });
          }
        });
      }
    });
  },
  
  disconnectSocket: () => {
    if(get().socket?.connected){
      get().socket.disconnect();
    }
    // Clean up call states
    import("./useCallStore.js").then(({ useCallStore }) => {
      useCallStore.getState().endCall(false);
    });
  }
}))