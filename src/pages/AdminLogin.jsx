import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // ⚠️ TEMP: allowed admin emails
    const allowedAdmins = ["samyakajmera022@gmail.com"]

    setTimeout(() => {
      if (allowedAdmins.includes(email) && password) {
        // ✅ SUCCESS → go to admin dashboard
        navigate("/admin")
      } else if (!allowedAdmins.includes(email) && email && password) {
        setError("Access Denied: You do not have admin privileges.")
      } else {
        setError("Login failed. Please check your credentials.")
      }

      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Administrator Login
          </h1>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-2.5 rounded font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors mt-6"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
