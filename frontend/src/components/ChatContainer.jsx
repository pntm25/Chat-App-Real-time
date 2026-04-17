import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const { theme } = useThemeStore();
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToNewMessages();
    }
    return () => {
      unsubscribeFromNewMessages();
    };
  }, [selectedUser?._id, getMessages, subscribeToNewMessages, unsubscribeFromNewMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className={`flex flex-col flex-1 justify-center items-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">Welcome to CHAT APP!</h3>
          <p className="text-gray-500">Select a user from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className={`flex flex-col flex-1 h-full ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <ChatHeader />
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-1 h-full ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages?.length === 0 ? (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages?.map((message) => {
            const isFromMe = message.senderId === authUser?._id;
            return (
              <div key={message._id} className={`flex ${isFromMe ? "justify-end" : "justify-start"}`} >
                <div className={`flex items-start space-x-2 max-w-xs ${isFromMe ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <img 
                    src={isFromMe ? (authUser?.profilePic || "/avatar.png") : (selectedUser?.profilePic || "/avatar.png")} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  
                  {/* Message bubble */}
                  <div className="flex flex-col space-y-1">
                    {/* Name */}
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isFromMe ? 'You' : selectedUser?.fullName}
                    </div>
                    
                    {/* Message */}
                    <div className={`p-3 rounded-lg ${
                      isFromMe 
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : theme === 'dark' 
                          ? "bg-gray-700 text-white rounded-tl-none" 
                          : "bg-gray-200 text-gray-900 rounded-tl-none"
                    }`}>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[200px] rounded-md mb-2"
                        />
                      )}
                      {message.text && <p>{message.text}</p>}
                    </div>
                    
                    {/* Time */}
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;