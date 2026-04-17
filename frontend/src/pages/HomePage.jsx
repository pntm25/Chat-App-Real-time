import { useChatStore } from "../store/useChatStore"
import { useThemeStore } from "../store/useThemeStore"
import ChatContainer from "../components/ChatContainer"
import NoChatSelected from "../components/NoChatSelected"
import Sidebar from "../components/Sidebar"


const HomePage = () => {
  const { selectedUser } = useChatStore()
  const { theme } = useThemeStore()
  
  return (
    <div className={`h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-center pt-20 px-4">
        <div className={`rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage