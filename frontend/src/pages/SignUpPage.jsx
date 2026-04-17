import { useState } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useThemeStore } from "../store/useThemeStore"
import { MessageSquare, User, Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import AuthImagePattern from "../components/AuthImagePattern"
import toast from "react-hot-toast"

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  })
  
  const { signUp, isSigningUp } = useAuthStore()
  const { theme } = useThemeStore()

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = validateForm()
    if(success === true){
      signUp(formData)
    }
  }

  return (
    <div className={`min-h-screen grid lg:grid-cols-2 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors border border-slate-500">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold mt-2 text-white">Create Account</h1>
              <p className="text-slate-300">Get started with your free account</p>
            </div>
          </div>

          <div className="bg-slate-700 rounded-xl p-8 shadow-lg border border-slate-600">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control relative">
                <label className="label">
                  <span className="label-text font-medium text-slate-200">Full Name</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 z-10">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 px-4 py-2.5 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control relative">
                <label className="label">
                  <span className="label-text font-medium text-slate-200">Email</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 z-10">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 px-4 py-2.5 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control relative">
                <label className="label">
                  <span className="label-text font-medium text-slate-200">Password</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 z-10">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    className="w-full pl-10 pr-10 px-4 py-2.5 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50" disabled={isSigningUp}>
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-slate-300">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthImagePattern 
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  )
}

export default SignUpPage
