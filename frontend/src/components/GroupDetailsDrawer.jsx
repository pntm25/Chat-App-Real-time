import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Users, Crown, Info, Mail } from "lucide-react";

const GroupDetailsDrawer = ({ group, onClose }) => {
  const { theme } = useThemeStore();
  const { onlineUsers } = useAuthStore();
  const isDark = theme === "dark";

  const activeMembers = group.members || [];
  const onlineCount = activeMembers.filter(m => onlineUsers.includes(m._id)).length;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full h-full shadow-2xl flex flex-col border-l transform transition-transform duration-300 translate-x-0 ${
          isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <Info className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Group Info</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${
              isDark ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Group Avatar and Identity */}
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src={group.groupPic || "/avatar.png"}
              alt={group.name}
              className={`w-24 h-24 rounded-full object-cover border-2 shadow-md ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            />
            <h4 className="text-xl font-extrabold mt-3.5 tracking-tight">{group.name}</h4>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full mt-2 bg-primary/10 text-primary border border-primary/20">
              {activeMembers.length} Members • {onlineCount} Online
            </span>
          </div>

          {/* Group Description */}
          {group.description && (
            <div className={`p-4 rounded-2xl border ${
              isDark ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"
            }`}>
              <span className="text-xs font-semibold text-zinc-500 block mb-1 uppercase tracking-wider">Description</span>
              <p className="text-sm leading-relaxed text-zinc-400 dark:text-zinc-300">{group.description}</p>
            </div>
          )}

          {/* Group Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b dark:border-gray-800 border-gray-100">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Members List</span>
              <Users className="size-4 text-zinc-400" />
            </div>

            <div className="space-y-2.5">
              {activeMembers.map((member) => {
                const isCreator = group.creator?._id === member._id || group.creator === member._id;
                const isOnline = onlineUsers.includes(member._id);

                return (
                  <div
                    key={member._id}
                    className={`flex items-center justify-between p-2 rounded-xl border border-transparent transition-all ${
                      isDark ? "hover:bg-gray-800/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.profilePic || "/avatar.png"}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700/20"
                        />
                        <span
                          className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ${
                            isDark ? "ring-gray-900" : "ring-white"
                          } ${isOnline ? "bg-green-500" : "bg-zinc-400"}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate block">{member.fullName}</span>
                          {isCreator && (
                            <span className="tooltip tooltip-bottom" data-tip="Group Creator">
                              <Crown className="size-3.5 text-amber-500 fill-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 truncate flex items-center gap-1">
                          <Mail className="size-3" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isOnline
                        ? "bg-green-500/10 text-green-500"
                        : "bg-zinc-500/10 text-zinc-500"
                    }`}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsDrawer;
