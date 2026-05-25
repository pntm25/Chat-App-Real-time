import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import VoicePlayer from "./VoicePlayer";
import ImageLightbox from "./ImageLightbox";

const ChatContainer = () => {
  const { theme } = useThemeStore();
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
    searchQuery,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  
  const isPartnerTyping = selectedUser ? typingUsers[selectedUser._id] : false;
  
  // Lightbox state
  const [activeImage, setActiveImage] = useState(null);

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

  // Keyword highlighting function
  const highlightText = (text, search) => {
    if (!search || !search.trim()) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-500 text-black px-0.5 rounded font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Filter messages dynamically based on search query
  const filteredMessages = messages?.filter((message) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    return message.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
    <div className={`flex flex-col flex-1 h-full relative ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {filteredMessages?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchQuery ? "No matching messages found in history." : "No messages yet. Start the conversation!"}
          </div>
        ) : (
          filteredMessages?.map((message, index) => {
            const isFromMe = message.senderId === authUser?._id;
            const isLastFromMe = isFromMe && index === filteredMessages.length - 1;
            return (
              <div key={message._id} className={`flex ${isFromMe ? "justify-end" : "justify-start"}`} >
                <div className={`flex items-start space-x-2 max-w-xs sm:max-w-md ${isFromMe ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <img 
                    src={isFromMe ? (authUser?.profilePic || "/avatar.png") : (selectedUser?.profilePic || "/avatar.png")} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                  />
                  
                  {/* Message bubble */}
                  <div className="flex flex-col space-y-1">
                    {/* Name */}
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isFromMe ? 'You' : selectedUser?.fullName}
                    </div>
                    
                    {/* Message content */}
                    {message.text === "[Sticker]" && message.image ? (
                      <div className="p-0 bg-transparent shadow-none select-none">
                        <img
                          src={message.image}
                          alt="Sticker"
                          className="w-28 h-28 sm:w-32 sm:h-32 object-contain hover:scale-105 transition-transform duration-200 cursor-default"
                        />
                      </div>
                    ) : (
                      <div className={`p-3 rounded-2xl ${
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
                            className="max-w-[200px] sm:max-w-[280px] rounded-lg mb-2 cursor-zoom-in hover:opacity-95 transition-opacity duration-150"
                            onClick={() => setActiveImage(message.image)}
                          />
                        )}
                        
                        {message.voice && (
                          <VoicePlayer src={message.voice} />
                        )}

                        {message.text && <p className="leading-relaxed break-words">{highlightText(message.text, searchQuery)}</p>}
                      </div>
                    )}
                    
                    {/* Time & Read Status */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>

                      {isLastFromMe && (
                        message.isRead ? (
                          <img
                            src={selectedUser?.profilePic || "/avatar.png"}
                            alt="Seen"
                            className="w-3.5 h-3.5 rounded-full object-cover border border-base-100"
                            title="Seen"
                          />
                        ) : (
                          <span className="text-zinc-500 text-[10px] font-semibold select-none" title="Sent">✓</span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Real-time Partner Typing Indicator Bubble */}
        {isPartnerTyping && (
          <div className="flex items-start space-x-2 p-1 max-w-xs animate-pulse">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex flex-col space-y-1">
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedUser?.fullName}
              </div>
              <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {/* Image Lightbox Overlay */}
      {activeImage && (
        <ImageLightbox src={activeImage} onClose={() => setActiveImage(null)} />
      )}
    </div>
  );
};

export default ChatContainer;