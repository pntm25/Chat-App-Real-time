import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            console.log('Fetching users from /messages/users...');
            const res = await axiosInstance.get("/messages/users");
            console.log('Users API response:', res.data);
            set({ users: res.data });
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error("Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            console.log('getMessages called with userId:', userId);
            console.log('API URL will be:', `/messages/${userId}`);
            
            if (!userId) {
                throw new Error('userId is required for getMessages');
            }
            
            const res = await axiosInstance.get(`/messages/${userId}`);
            console.log('Messages response:', res.data);
            set({ messages: res.data });
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error("Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser} = get()
        try {
            console.log('Sending message to:', `/messages/send/${selectedUser._id}`);
            console.log('Message data:', messageData);
            
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            console.log('Message sent successfully:', res.data);
            // Only save to database, don't add to interface yet
            toast.success("Message sent!")
        }catch (error) {
            console.error('Error sending message:', error);
            toast.error("Failed to send message")
        }
    },

    subscribeToNewMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        const { socket, authUser } = useAuthStore.getState();
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            const senderId = String(newMessage.senderId);
            const receiverId = String(newMessage.receiverId);
            const selectedId = String(selectedUser._id);
            const myId = String(authUser?._id);
            const isForThisChat =
                (senderId === selectedId && receiverId === myId) ||
                (senderId === myId && receiverId === selectedId);
            if (!isForThisChat) return;
            set({ messages: [...get().messages, newMessage] });
        });
    },

    unsubscribeFromNewMessages: () => {
        const socket = useAuthStore.getState().socket;
        if(!socket) return;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));