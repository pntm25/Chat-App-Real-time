import { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import SidebarSkeleton from './Skeletons/SidebarSkeleton'
import CreateGroupModal from './CreateGroupModal'
import { Users, Plus, MessageSquare, ChevronDown, ChevronRight, Hash } from 'lucide-react'

const Sidebar = () => {
  const { theme } = useThemeStore()
  const { authUser, onlineUsers } = useAuthStore()
  const { 
    getUsers, 
    users, 
    getGroups, 
    groups, 
    selectedUser, 
    setSelectedUser, 
    isUsersLoading,
    isGroupsLoading
  } = useChatStore()
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [isDmsOpen, setIsDmsOpen] = useState(true)
  const [isGroupsOpen, setIsGroupsOpen] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredUsers = showOnlineOnly
    ? users.filter(user => onlineUsers.includes(user._id) && user._id !== authUser._id)
    : users.filter(user => user._id !== authUser._id)

  useEffect(() => {
    getUsers()
    getGroups()
  }, [getUsers, getGroups])

  if (isUsersLoading || isGroupsLoading) {
    return <SidebarSkeleton />
  }

  const isDark = theme === 'dark'

  return (
    <aside className={`h-full w-20 lg:w-72 border-r flex flex-col transition-all duration-200 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
    }`}>
      {/* Sidebar Header */}
      <div className={`border-b w-full p-5 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`size-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            <span className={`font-medium hidden lg:block ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Chats
            </span>
          </div>
        </div>

        {/* Online Filter Toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({Math.max(0, onlineUsers.length - 1)} online)</span>
        </div>
      </div>

      {/* Sidebar Scroll Container */}
      <div className="overflow-y-auto w-full py-3 flex-1 space-y-4">
        
        {/* GROUPS CATEGORY */}
        <div className="px-3">
          <div className="flex items-center justify-between py-1.5 px-2 hover:bg-zinc-800/10 rounded-lg group text-zinc-400">
            <button
              onClick={() => setIsGroupsOpen(!isGroupsOpen)}
              className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-left flex-1"
            >
              {isGroupsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="hidden lg:inline">Groups</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="p-1 rounded hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
              title="Create Group"
            >
              <Plus size={14} className="stroke-[3px]" />
            </button>
          </div>

          {isGroupsOpen && (
            <div className="mt-1 space-y-1">
              {groups.map((group) => {
                const isSelected = selectedUser?._id === group._id;
                return (
                  <button
                    key={group._id}
                    onClick={() => setSelectedUser({ ...group, isGroup: true })}
                    className={`
                      w-full p-2.5 flex items-center gap-3 rounded-xl transition-all duration-150
                      ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                      ${isSelected 
                        ? isDark 
                          ? "bg-gray-700 ring-1 ring-gray-600 font-bold" 
                          : "bg-gray-200 ring-1 ring-gray-300 font-bold"
                        : ""
                      }
                    `}
                  >
                    <div className="relative mx-auto lg:mx-0">
                      <img
                        src={group.groupPic || "/avatar.png"}
                        alt={group.name}
                        className="size-10 object-cover rounded-full shadow-sm"
                      />
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-primary text-white border border-zinc-900">
                        <Hash size={8} />
                      </span>
                    </div>

                    <div className="hidden lg:block text-left min-w-0 flex-1">
                      <div className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {group.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </button>
                );
              })}
              {groups.length === 0 && (
                <div className="text-center py-3 text-xs text-zinc-500 hidden lg:block">
                  No groups joined yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* DIRECT MESSAGES CATEGORY */}
        <div className="px-3">
          <button
            onClick={() => setIsDmsOpen(!isDmsOpen)}
            className="w-full flex items-center gap-1.5 py-1.5 px-2 font-bold text-xs uppercase tracking-wider text-zinc-400 text-left hover:bg-zinc-800/10 rounded-lg"
          >
            {isDmsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="hidden lg:inline">Direct Messages</span>
          </button>

          {isDmsOpen && (
            <div className="mt-1 space-y-1">
              {filteredUsers.map((user) => {
                const isSelected = selectedUser?._id === user._id && !selectedUser?.isGroup;
                const isOnline = onlineUsers.includes(user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`
                      w-full p-2.5 flex items-center gap-3 rounded-xl transition-all duration-150
                      ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                      ${isSelected 
                        ? isDark 
                          ? "bg-gray-700 ring-1 ring-gray-600 font-bold" 
                          : "bg-gray-200 ring-1 ring-gray-300 font-bold"
                        : ""
                      }
                    `}
                  >
                    <div className="relative mx-auto lg:mx-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-10 object-cover rounded-full"
                      />
                      {isOnline && (
                        <span
                          className="absolute bottom-0 right-0 size-2.5 bg-green-500 
                          rounded-full ring-2 ring-zinc-900"
                        />
                      )}
                    </div>

                    <div className="hidden lg:block text-left min-w-0 flex-1">
                      <div className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.fullName}
                      </div>
                      <div className={`text-xs ${isOnline ? "text-green-500 font-medium" : "text-zinc-500"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-3 text-xs text-zinc-500 hidden lg:block">
                  No contacts online
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Creation Modal Portal */}
      {isCreateOpen && (
        <CreateGroupModal onClose={() => setIsCreateOpen(false)} />
      )}
    </aside>
  )
}

export default Sidebar