import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { Camera, Mail, User } from 'lucide-react'
import { useState } from 'react'

const ProfilePage = () => {
  const {authUser, isUpdatingProfile, updateProfile} = useAuthStore()
  const { theme } = useThemeStore()
  const [selectedImage, setSelectedImage] = useState(null)
  
  // Debug log to see authUser data
  console.log('ProfilePage - authUser:', authUser)
  
  const compressImage = (file, maxWidth = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if(!file) return;
    
    try {
      // Compress image before upload
      const compressedImage = await compressImage(file)
      setSelectedImage(compressedImage)
      await updateProfile({ profilePic: compressedImage })
    } catch (error) {
      console.error('Error processing image:', error)
    }
  }

  return (
    <div className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className={`rounded-xl p-6 space-y-8 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className='text-center'>
            <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Your profile information</p>
          </div>

          {/* AVATAR UPLOAD SECTION */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={ selectedImage || authUser.profilePic || "/avatar.png" }
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className={`px-4 py-2.5 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              }`}>{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className={`px-4 py-2.5 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              }`}>{authUser?.email}</p>
            </div>
          </div>

          <div className={`mt-6 rounded-xl p-6 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h2 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className={`flex items-center justify-between py-2 border-b ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Member Since</span>
                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage