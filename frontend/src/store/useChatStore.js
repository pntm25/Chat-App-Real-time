import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    groups: [],
    selectedUser: null,
    isUsersLoading: false,
    isGroupsLoading: false,
    isMessagesLoading: false,
    typingUsers: {},
    setTypingUsers: (userId, isTyping) => {
        set((state) => ({
            typingUsers: { ...state.typingUsers, [userId]: isTyping }
        }));
    },

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

    getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups");
            set({ groups: res.data });
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error("Failed to load groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    createGroup: async (groupData) => {
        try {
            const res = await axiosInstance.post("/groups/create", groupData);
            set((state) => ({ groups: [res.data, ...state.groups] }));
            toast.success("Group created successfully!");
            return res.data;
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error(error.response?.data?.message || "Failed to create group");
            throw error;
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

            // Clear unread counts in database for direct chats
            const { selectedUser } = get();
            if (selectedUser && !selectedUser.isGroup) {
                await axiosInstance.put(`/messages/read/${userId}`);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error("Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    markAsRead: async (userId) => {
        const { selectedUser } = get();
        if (selectedUser && selectedUser.isGroup) return; // Skip read receipts for groups
        try {
            await axiosInstance.put(`/messages/read/${userId}`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
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
            const senderIdObj = newMessage.senderId;
            const senderId = String(senderIdObj?._id || senderIdObj);
            const receiverId = String(newMessage.receiverId || "");
            const selectedId = String(selectedUser._id);
            const myId = String(authUser?._id);

            const isForThisChat = selectedUser.isGroup
                ? String(newMessage.groupId) === selectedId
                : (senderId === selectedId && receiverId === myId) ||
                  (senderId === myId && receiverId === selectedId);

            if (!isForThisChat) return;
            set({ messages: [...get().messages, newMessage] });

            // If we are currently in this direct chat and receive a message from the partner, mark it as read immediately
            if (!selectedUser.isGroup && senderId === selectedId) {
                get().markAsRead(selectedId);
            }
        });

        // Listen for messagesRead event
        socket.on("messagesRead", ({ readerId }) => {
            if (selectedUser.isGroup) return;
            if (String(readerId) === String(selectedUser._id)) {
                const updatedMessages = get().messages.map((msg) => {
                    const msgSenderId = String(msg.senderId?._id || msg.senderId);
                    if (msgSenderId === String(authUser?._id)) {
                        return { ...msg, isRead: true };
                    }
                    return msg;
                });
                set({ messages: updatedMessages });
            }
        });
    },

    unsubscribeFromNewMessages: () => {
        const socket = useAuthStore.getState().socket;
        if(!socket) return;
        socket.off("newMessage");
        socket.off("messagesRead");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
    searchQuery: "",
    setSearchQuery: (searchQuery) => set({ searchQuery }),
}));