import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, User, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../utils/supabaseClient';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password || (!isLogin && !name)) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isLogin) {
        // Handle login
        const { data, error } = await signIn(email, password);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.user) {
          // Login successful
          navigate('/recommendations');
        }
      } else {
        // Handle signup
        const { data, error } = await signUp(email, password, name);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.user) {
          // Signup successful, navigate to preferences page
          navigate('/preferences');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Compass className="w-8 h-8 text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-white">GeoGuide AI</h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/70">
              {isLogin
                ? 'Sign in to continue your journey'
                : 'Join GeoGuide AI to start exploring'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-white/70 text-sm mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pl-10"
                    placeholder="John Doe"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white/70 text-sm mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pl-10"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-white/70 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pl-10"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}