import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword, isResettingPassword } = useAuthStore();
  const { theme } = useThemeStore();

  const validateForm = () => {
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await resetPassword(token, formData.password);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000); // Auto-redirect after 3 seconds
    }
  };

  return (
    <div className={`min-h-screen grid lg:grid-cols-2 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                theme === 'dark' ? 'bg-gray-700 group-hover:bg-gray-600 border border-gray-600' : 'bg-blue-500 group-hover:bg-blue-600 border border-blue-400'
              }`}>
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reset Password</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Enter your new password below</p>
            </div>
          </div>

          {/* Form Card */}
          <div className={`rounded-xl p-8 shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div className="form-control">
                  <label className="label">
                    <span className={`label-text font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>New Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full pl-10 pr-10 px-4 py-2.5 rounded-lg border focus:outline-none transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                          : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-control">
                  <label className="label">
                    <span className={`label-text font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className={`w-full pl-10 pr-10 px-4 py-2.5 rounded-lg border focus:outline-none transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                          : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50" 
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center text-green-500">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <h3 className="text-lg font-bold text-green-500">Password Reset Successful!</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your password has been changed. You will be redirected to the sign-in page shortly.
                </p>
                <div className="pt-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            )}

            {!isSuccess && (
              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Choose a strong password"}
        subtitle={"Make sure it's something secure that you can remember. We'll help you get right back into chatting."}
      />
    </div>
  );
};

export default ResetPasswordPage;
