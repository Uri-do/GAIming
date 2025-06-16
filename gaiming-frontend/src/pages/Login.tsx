import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Brain, Gamepad2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-toastify'

import Button from '@/components/UI/Button'
import { Card, CardContent } from '@/components/UI/Card'

interface LoginForm {
  username: string
  password: string
  rememberMe: boolean
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/50 animate-pulse-glow">
                <Brain className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-success-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-success-500/50">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                GAIming
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                AI-Powered Gaming Recommendations
              </p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to your account
          </h2>
          <p className="text-gray-400">
            Access your gaming recommendation dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card variant="gaming" className="relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
          <CardContent className="relative z-10 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username or Email
              </label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
                type="text"
                className="w-full px-4 py-3 border border-primary-500/30 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your username or email"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-error-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-primary-500/30 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-primary-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-500/30 bg-gray-800/50 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-900/20 border border-error-500/30 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-error-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gaming"
              size="lg"
              fullWidth
              loading={isLoading}
              className="font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-lg backdrop-blur-sm">
            <h4 className="text-sm font-medium text-primary-400 mb-2 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Demo Credentials
            </h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><strong className="text-primary-400">Username:</strong> testuser</p>
              <p><strong className="text-primary-400">Password:</strong> testpass</p>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            © 2024 <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent font-medium">GAIming</span>. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
