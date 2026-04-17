import { MessageSquare } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const NoChatSelected = () => {
  const { theme } = useThemeStore();
  
  return (
    <div className={`w-full flex flex-1 flex-col items-center justify-center p-16 ${
      theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'
    }`}>
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-500/10'
              }`}
            >
              <MessageSquare className={`w-8 h-8 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Welcome to Chatty!
        </h2>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;