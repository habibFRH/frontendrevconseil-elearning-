import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white w-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#courses" className="text-gray-900 hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Courses
              </a>
              <a href="#teachers" className="text-gray-900 hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Teachers
              </a>
              <a href="#about" className="text-gray-900 hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </a>
            </div>

            {/* Center - Logo (Absolute positioning for perfect centering) */}
            <div className="absolute sm:fixed left-1/2 transform -translate-x-1/2 top-0 z-50 hover:s">
              <div className="relative bg-yellow-100 px-8 py-3 shadow-md rounded-b-full" style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 80% 140%, 20% 140%)',
                minWidth: '180px',
                textAlign: 'center'
              }}>
                {/* <h1 className="text-xl font-bold text-white">
                  Firstep Academy
                </h1> */}
                <img src={logo} alt="Firstep Academy" className="w-24 h-10" />
              </div>
            </div>

            {/* Right side - Auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="text-gray-900 hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDashboard}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-900 hover:text-yellow-500 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a 
                href="#courses" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-900 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Courses
              </a>
              <a 
                href="#teachers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-900 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Teachers
              </a>
              <a 
                href="#about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-900 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                About
              </a>
              {!isAuthenticated ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-900 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        handleGetStarted();
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleDashboard();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn Without{' '}
              <span className="text-yellow-500">Limits</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover thousands of courses from expert instructors. Build skills that matter with our comprehensive learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Start Learning Today
              </button>
              <button
                onClick={() => {
                  const coursesElement = document.getElementById('courses');
                  if (coursesElement) {
                    coursesElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Explore Courses
              </button>
            </div>
          </div>
          
          {/* Hero Features */}
          <div className="mt-16">
            <div className="relative">
              <div className="bg-yellow-100 rounded-2xl p-8 mx-auto max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert-Led Courses</h3>
                    <p className="text-gray-600">Learn from industry professionals</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Learning</h3>
                    <p className="text-gray-600">Study at your own pace</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificates</h3>
                    <p className="text-gray-600">Earn recognized certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular <span className="text-yellow-500">Courses</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular courses designed to help you achieve your learning goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Web Development</h3>
                <p className="text-gray-600 mb-4">Master modern web development with HTML, CSS, JavaScript, and React</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-500">$49</span>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Marketing</h3>
                <p className="text-gray-600 mb-4">Learn SEO, social media marketing, and digital advertising strategies</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-500">$39</span>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Science</h3>
                <p className="text-gray-600 mb-4">Analyze data, build models, and gain insights with Python and R</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-500">$59</span>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-yellow-500">Expert Teachers</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from industry professionals with years of experience in their fields
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Teacher Cards */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Johnson</h3>
              <p className="text-yellow-600 font-medium mb-2">Full Stack Developer</p>
              <p className="text-gray-600 text-sm mb-4">5+ years at Google, specializing in React and Node.js</p>
              <div className="flex justify-center space-x-2">
                <span className="text-yellow-500 text-sm">⭐ 4.9</span>
                <span className="text-gray-500 text-sm">(120 reviews)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Michael Chen</h3>
              <p className="text-yellow-600 font-medium mb-2">Data Scientist</p>
              <p className="text-gray-600 text-sm mb-4">PhD in Machine Learning, former Tesla AI researcher</p>
              <div className="flex justify-center space-x-2">
                <span className="text-yellow-500 text-sm">⭐ 4.8</span>
                <span className="text-gray-500 text-sm">(89 reviews)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emily Rodriguez</h3>
              <p className="text-yellow-600 font-medium mb-2">Marketing Expert</p>
              <p className="text-gray-600 text-sm mb-4">10+ years growing startups, former VP at HubSpot</p>
              <div className="flex justify-center space-x-2">
                <span className="text-yellow-500 text-sm">⭐ 5.0</span>
                <span className="text-gray-500 text-sm">(156 reviews)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">David Kim</h3>
              <p className="text-yellow-600 font-medium mb-2">UX Designer</p>
              <p className="text-gray-600 text-sm mb-4">Lead Designer at Airbnb, 8+ years in design</p>
              <div className="flex justify-center space-x-2">
                <span className="text-yellow-500 text-sm">⭐ 4.9</span>
                <span className="text-gray-500 text-sm">(203 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Learn<span className="text-yellow-500">Hub</span>
              </h3>
              <p className="text-gray-400 mb-4">
                Empowering learners worldwide with high-quality education and practical skills for the digital age.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><button onClick={handleGetStarted} className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Browse Courses</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">For Businesses</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Become a Teacher</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Mobile App</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Help Center</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Contact Us</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Community</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">System Status</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">About Us</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Careers</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Press</button></li>
                <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Privacy Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 LearnHub. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button className="text-gray-400 hover:text-yellow-500 text-sm transition-colors">Terms of Service</button>
                <button className="text-gray-400 hover:text-yellow-500 text-sm transition-colors">Privacy Policy</button>
                <button className="text-gray-400 hover:text-yellow-500 text-sm transition-colors">Cookie Policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    );
};

export default LandingPage;