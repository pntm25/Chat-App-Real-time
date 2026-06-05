import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Loader2, ArrowLeft, KeyRound } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState("");
  const { forgotPassword, isSendingResetEmail } = useAuthStore();
  const { theme } = useThemeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    const result = await forgotPassword(email);
    if (result) {
      setSubmitted(true);
      if (result.isDev && result.resetLink) {
        setDevResetLink(result.resetLink);
      }
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
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Forgot Password</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Enter your email to reset your password</p>
            </div>
          </div>

          {/* Form Card */}
          <div className={`rounded-xl p-8 shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className={`label-text font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Email Address</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      type="email"
                      required
                      className={`w-full pl-10 px-4 py-2.5 rounded-lg border focus:outline-none transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                          : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50" 
                  disabled={isSendingResetEmail}
                >
                  {isSendingResetEmail ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-green-500 font-medium text-lg">
                  Request Sent Successfully!
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Check your email for instructions to reset your password.
                </p>

                {devResetLink && (
                  <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-left">
                    <span className="block font-bold text-yellow-500 text-xs uppercase tracking-wider mb-2">
                      Developer Testing Helper
                    </span>
                    <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      SMTP email sending is not configured. You can use the link below to test the reset flow directly:
                    </p>
                    <a 
                      href={devResetLink} 
                      className="text-xs text-blue-400 hover:text-blue-300 break-all underline font-medium block"
                    >
                      {devResetLink}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Don't worry!"}
        subtitle={"It happens to the best of us. Just enter your email and we'll help you get back on track."}
      />
    </div>
  );
};

export default ForgotPasswordPage;
