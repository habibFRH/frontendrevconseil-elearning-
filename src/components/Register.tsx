/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterRequest } from '../types';
import { Role } from '../types';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: Role.STUDENT,
  });
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Full error response:', err.response);
      
      if (err.response?.status === 400 && err.response?.data) {
        const errorData = err.response.data;
        console.error('Error data:', errorData);
        
        // Handle backend validation errors - show exact messages
        if (typeof errorData === 'string') {
          // If error is just a string, show it as general error
          setError(errorData);
        } else if (errorData && typeof errorData === 'object') {
          // Check if we have structured validation errors from backend
          if (errorData.errors && typeof errorData.errors === 'object') {
            // Handle field-specific errors from backend
            const backendFieldErrors = errorData.errors;
            const newFieldErrors: {[key: string]: string} = {};
            
            // Map backend field errors directly
            Object.keys(backendFieldErrors).forEach(field => {
              newFieldErrors[field] = backendFieldErrors[field];
            });
            
            if (Object.keys(newFieldErrors).length > 0) {
              setFieldErrors(newFieldErrors);
              // Also show general message if available
              if (errorData.message) {
                setError(errorData.message);
              }
            } else {
              setError(errorData.message || 'Validation failed. Please check your input.');
            }
          } else if (errorData.error && typeof errorData.error === 'string') {
            // Parse the error string to extract field-specific messages (fallback)
            const errorMessage = errorData.error;
            const newFieldErrors: {[key: string]: string} = {};
            
            // Extract exact messages from backend validation errors
            if (errorMessage.includes('Username must be between 3 and 50 characters')) {
              newFieldErrors.username = 'Username must be between 3 and 50 characters';
            }
            if (errorMessage.includes('Email should be valid')) {
              newFieldErrors.email = 'Email should be valid';
            }
            if (errorMessage.includes('Password must be at least 6 characters')) {
              newFieldErrors.password = 'Password must be at least 6 characters';
            }
            if (errorMessage.includes('First name is required')) {
              newFieldErrors.firstName = 'First name is required';
            }
            if (errorMessage.includes('Last name is required')) {
              newFieldErrors.lastName = 'Last name is required';
            }
            
            // If we found field-specific errors, display them
            if (Object.keys(newFieldErrors).length > 0) {
              setFieldErrors(newFieldErrors);
            } else {
              // Show the full error message if we couldn't parse field errors
              setError(errorMessage);
            }
          } else {
            // Fallback: show any error message we can find
            setError(errorData.message || errorData.error || 'Registration failed. Please try again.');
          }
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-4">
            <UserPlus className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-600 text-sm">Join us and get started</p>
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
            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full text-black px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.firstName 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-yellow-400 focus:border-yellow-400'
                  }`}
                  placeholder="First name"
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full text-black px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.lastName 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-yellow-400 focus:border-yellow-400'
                  }`}
                  placeholder="Last name"
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full text-black pl-10 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.username 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-yellow-400 focus:border-yellow-400'
                  }`}
                  placeholder="Choose a username"
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full text-black pl-10 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.email 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-yellow-400 focus:border-yellow-400'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full text-black pr-10 py-2.5 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-yellow-400 focus:border-yellow-400'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full text-black px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors bg-white"
              >
                <option value="STUDENT">Student</option>
              </select>
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={navigateToLogin}
            className="text-gray-900 font-medium hover:text-yellow-600 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
