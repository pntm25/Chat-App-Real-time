import React from "react";
import { useThemeStore } from "../../store/useThemeStore";

const SidebarSkeleton = () => {
  const { theme } = useThemeStore();

  return (
    <aside className={`h-full w-20 lg:w-72 border-r flex flex-col transition-all duration-200 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
    }`}>
      {/* Header skeleton */}
      <div className={`border-b w-full p-5 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded animate-pulse ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className={`h-4 w-20 rounded animate-pulse hidden lg:block ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
        </div>
      </div>

      {/* Users list skeleton */}
      <div className="overflow-y-auto w-full py-3 flex-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className={`w-12 h-12 rounded-full animate-pulse mx-auto lg:mx-0 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            }`}></div>
            
            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className={`h-4 w-24 rounded animate-pulse mb-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
              <div className={`h-3 w-16 rounded animate-pulse ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;