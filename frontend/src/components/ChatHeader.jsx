import { X, Phone, Video, Search, Info } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useState } from "react";
import toast from "react-hot-toast";
import GroupDetailsDrawer from "./GroupDetailsDrawer";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, searchQuery, setSearchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { initiateCall } = useCallStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isGroup = selectedUser?.isGroup;
  const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id);

  const handleStartCall = (type) => {
    if (isGroup) return;
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

  // Group Details Drawer online count calculation
  const onlineMembersCount = isGroup
    ? (selectedUser.members || []).filter((m) => onlineUsers.includes(m._id)).length
    : 0;

  return (
    <div className="border-b border-base-300">
      {/* Top Main Header */}
      <div className="p-3 flex items-center justify-between">
        <div 
          className={`flex items-center gap-3 ${isGroup ? "cursor-pointer hover:opacity-90 select-none" : ""}`}
          onClick={() => isGroup && setIsDrawerOpen(true)}
        >
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={isGroup ? (selectedUser?.groupPic || "/avatar.png") : (selectedUser?.profilePic || "/avatar.png")}
                alt={isGroup ? selectedUser?.name : selectedUser?.fullName}
                className="rounded-full object-cover w-10 h-10"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
            </div>
          </div>

          {/* User / Group info */}
          <div>
            <h3 className="font-medium text-sm sm:text-base leading-none mb-1 flex items-center gap-1.5">
              {isGroup ? selectedUser?.name : selectedUser?.fullName}
              {isGroup && <Info size={14} className="text-zinc-500 hover:text-primary transition-colors" />}
            </h3>
            <p className="text-xs text-base-content/60">
              {isGroup ? (
                <span>
                  {selectedUser.members?.length || 0} members • {onlineMembersCount} online
                </span>
              ) : isOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
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

          {!isGroup && (
            <>
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
            </>
          )}

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

      {/* Group Details Drawer Portal */}
      {isDrawerOpen && isGroup && (
        <GroupDetailsDrawer group={selectedUser} onClose={() => setIsDrawerOpen(false)} />
      )}
    </div>
  );
};

export default ChatHeader;