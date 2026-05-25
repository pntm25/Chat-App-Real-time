import { X, Phone, Video, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useState } from "react";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, searchQuery, setSearchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { initiateCall } = useCallStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isOnline = onlineUsers.includes(selectedUser?._id);

  const handleStartCall = (type) => {
    if (!isOnline) {
      toast.error(`${selectedUser.fullName} is offline. Call cannot be established.`);
      return;
    }
    initiateCall(selectedUser, type);
  };

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      setSearchQuery(""); // Clear search when closing
    }
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="border-b border-base-300">
      {/* Top Main Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt={selectedUser?.fullName}
                className="rounded-full object-cover"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium text-sm sm:text-base leading-none mb-1">
              {selectedUser?.fullName}
            </h3>
            <p className="text-xs text-base-content/60">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action Buttons: Calling & Searching */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button */}
          <button
            onClick={handleToggleSearch}
            className={`p-2 rounded-full cursor-pointer hover:bg-base-200 transition-colors ${
              isSearchOpen ? "text-primary" : "text-base-content/70"
            }`}
            title="Search Messages"
          >
            <Search size={18} />
          </button>

          {/* Voice Call Button */}
          <button
            onClick={() => handleStartCall("voice")}
            className="p-2 rounded-full text-base-content/70 hover:text-green-500 cursor-pointer hover:bg-green-500/10 transition-colors"
            title="Start Audio Call"
            disabled={!isOnline}
          >
            <Phone size={18} className={!isOnline ? "opacity-40" : ""} />
          </button>

          {/* Video Call Button */}
          <button
            onClick={() => handleStartCall("video")}
            className="p-2 rounded-full text-base-content/70 hover:text-blue-500 cursor-pointer hover:bg-blue-500/10 transition-colors"
            title="Start Video Call"
            disabled={!isOnline}
          >
            <Video size={18} className={!isOnline ? "opacity-40" : ""} />
          </button>

          <div className="w-[1px] h-6 bg-base-300 mx-1"></div>

          {/* Close Chat Button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 rounded-full text-base-content/70 hover:bg-base-200 transition-colors cursor-pointer"
            title="Close Chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Sliding Message Search Panel */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-base-200/50 border-t border-base-300 flex items-center gap-3 animate-slide-down">
          <Search size={16} className="text-base-content/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm placeholder-base-content/40"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-base-content/50 hover:text-base-content font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleToggleSearch}
            className="p-1 rounded hover:bg-base-300 text-base-content/60 transition-colors cursor-pointer"
            title="Close Search"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;