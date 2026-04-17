import { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import SidebarSkeleton from './Skeletons/SidebarSkeleton'
import { Users } from 'lucide-react'

const Sidebar = () => {
  const { theme } = useThemeStore()
  const { authUser, onlineUsers } = useAuthStore()
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const filteredUsers = showOnlineOnly
    ? users.filter(user => onlineUsers.includes(user._id) && user._id !== authUser._id)
    : users.filter(user => user._id !== authUser._id)

  useEffect(() => {
    getUsers()
  }, [getUsers])

  if (isUsersLoading) {
    return <SidebarSkeleton />
  }
  return (
    <aside className={`h-full w-20 lg:w-72 border-r flex flex-col transition-all duration-200 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
    }`}>
        <div className={`border-b w-full p-5 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
        }`}>
            <div className="flex items-center gap-2">
                <Users className={`size-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                <span className={`font-medium hidden lg:block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contacts</span>
            </div>
            {/* TO-DO ONLINE LISTS */}
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
              <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
            </div>
        </div>
        <div className="overflow-y-auto w-full py-3 flex-1">
            {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3 transition-colors
              ${theme === 'dark' 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-200'
              }
              ${selectedUser?._id === user._id 
                ? theme === 'dark' 
                  ? "bg-gray-700 ring-1 ring-gray-600" 
                  : "bg-gray-200 ring-1 ring-gray-300"
                : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user.fullName}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            No users found
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar