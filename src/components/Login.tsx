/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { LoginRequest } from '../types';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-4">
            <Lock className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  className="w-full text-black pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                  placeholder="Enter your email or username"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full text-black pl-10 pr-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={navigateToRegister}
            className="text-gray-900 font-medium hover:text-yellow-600 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
