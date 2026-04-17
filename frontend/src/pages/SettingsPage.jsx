import React from 'react'
import { useThemeStore } from '../store/useThemeStore'
import { Sun, Moon, MessageSquare, User } from 'lucide-react'

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Theme Selection
          </h2>
          
          {/* Theme Options */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium">Light Theme</span>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-900 text-blue-400'
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium">Dark Theme</span>
            </button>
          </div>

          {/* Preview Box */}
          <div className="mb-4">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Preview
            </h3>
            
            <div className={`rounded-lg p-6 border-2 ${
              theme === 'dark' 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Mock Chat Interface */}
              <div className="space-y-4">
                {/* Header */}
                <div className={`flex items-center gap-3 pb-3 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Chat App
                  </h4>
                </div>

                {/* Mock Messages */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className={`rounded-lg px-3 py-2 max-w-xs ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">Hey there! How are you?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="rounded-lg px-3 py-2 max-w-xs bg-blue-500 text-white">
                      <p className="text-sm">I'm doing great, thanks for asking!</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                    }`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Mock Input */}
                <div className={`flex gap-2 pt-3 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    readOnly
                  />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Theme Info */}
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-medium">Current theme:</span> {theme === 'dark' ? 'Dark' : 'Light'}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Theme changes are applied instantly and saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage