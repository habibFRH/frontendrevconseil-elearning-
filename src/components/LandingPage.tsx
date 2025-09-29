import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { Role } from '../types/auth';
import courseService from '../services/courseService';
import api from '../services/api';
import type { Course, User } from '../types';
import { ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teachersError, setTeachersError] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === Role.ADMIN || user?.role === Role.TEACHER) {
        navigate("/dashboard");
      } else if (user?.role === Role.STUDENT) {
        navigate("/student/all-courses");
      }
    } else {
      navigate("/register");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setTeachersError("");
        const [coursesRes, teachersRes] = await Promise.allSettled([
          courseService.getAvailableCourses(),
          api.get("/student/teachers")
        ]);

        if (coursesRes.status === "fulfilled") {
          setCourses(coursesRes.value);
        } else {
          setError("Failed to load courses");
        }

        if (teachersRes.status === "fulfilled") {
          setTeachers(teachersRes.value.data as User[]);
        } else {
          setTeachersError("Failed to load teachers");
        }
      } catch (e) {
        setError("Failed to load content");
        console.error("Landing load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Responsive cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 768) {
        setCardsPerView(2);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(3);
      } else {
        setCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || teachers.length <= cardsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, teachers.length - cardsPerView);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, teachers.length, cardsPerView]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, teachers.length - cardsPerView);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, teachers.length - cardsPerView);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const maxIndex = Math.max(0, teachers.length - cardsPerView);
  const showNavigation = teachers.length > cardsPerView;

  return (
    <div className="min-h-screen bg-white w-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#courses"
                className="text-gray-900 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Courses
              </a>
              <a
                href="#teachers"
                className="text-gray-900 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Teachers
              </a>
            </div>

            {/* Center - Logo (Absolute positioning for perfect centering) */}
            <div className="absolute sm:fixed left-1/2 transform -translate-x-1/2 top-0 z-50 hover:s">
              <div
                className="relative bg-blue-100 px-8 py-3 shadow-md rounded-b-full"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 80% 140%, 20% 140%)",
                  minWidth: "180px",
                  textAlign: "center"
                }}
              >
                {/* <h1 className="text-xl font-bold text-white">
                  Firstep Academy
                </h1> */}
                <img src={logo} alt="Firstep Academy" className="w-24 h-10" />
              </div>
            </div>

            {/* Right side - Auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-gray-900 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-900 hover:text-blue-500 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
                className="text-gray-900 hover:text-blue-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Courses
              </a>
              <a
                href="#teachers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-900 hover:text-blue-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Teachers
              </a>
              <a
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-900 hover:text-blue-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                About
              </a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-900 hover:text-blue-500 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      handleGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn Without <span className="text-blue-500">Limits</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover thousands of courses from expert instructors. Build
              skills that matter with our comprehensive learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Start Learning Today
              </button>
              <button
                onClick={() => {
                  const coursesElement = document.getElementById("courses");
                  if (coursesElement) {
                    coursesElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Explore Courses
              </button>
            </div>
          </div>

          {/* Hero Features */}
          <div className="mt-16">
            <div className="relative">
              <div className="bg-blue-100 rounded-2xl p-8 mx-auto max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Expert-Led Courses
                    </h3>
                    <p className="text-gray-600">
                      Learn from industry professionals
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Flexible Learning
                    </h3>
                    <p className="text-gray-600">Study at your own pace</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Certificates
                    </h3>
                    <p className="text-gray-600">
                      Earn recognized certifications
                    </p>
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
              Popular <span className="text-blue-500">Courses</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular courses designed to help you achieve
              your learning goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && (
              <div className="col-span-3 text-center text-gray-500">
                Loading courses...
              </div>
            )}
            {!loading && error && (
              <div className="col-span-3 text-center text-red-600">{error}</div>
            )}
            {!loading &&
              !error &&
              courses.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {c.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {c.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        by{" "}
                        {`${c.teacher?.firstName || ""} ${
                          c.teacher?.lastName || ""
                        }`.trim() || "Instructor"}
                      </span>
                      {c.durationHours ? (
                        <span>{c.durationHours}h</span>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-blue-500">Expert Teachers</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from industry professionals with years of experience in
              their fields
            </p>
          </div>

          {teachersError && (
            <div className="text-center text-red-600 mb-8">{teachersError}</div>
          )}

          {!teachersError && teachers.length === 0 && (
            <div className="text-center text-gray-500">
              No teachers to display
            </div>
          )}

          {!teachersError && teachers.length > 0 && (
            <div className="relative">
              {/* Carousel Container */}
              <div
                className="overflow-hidden"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${
                      currentIndex * (100 / cardsPerView)
                    }%)`
                  }}
                >
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex-none px-2"
                      style={{ width: `${100 / cardsPerView}%` }}
                    >
                      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group hover:-translate-y-1">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <UserIcon className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium mb-2">
                          {teacher.email}
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                          @{teacher.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {showNavigation && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-blue-50 text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
                    aria-label="Previous teachers"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-blue-50 text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
                    aria-label="Next teachers"
                  >
                    <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {showNavigation && (
                <div className="flex justify-center space-x-2 mt-8">
                  {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "bg-blue-600 scale-125"
                          : "bg-gray-300 hover:bg-blue-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Auto-play indicator */}
              {showNavigation && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {isAutoPlaying ? "⏸️ Pause" : "▶️ Play"} Auto-scroll
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Learn<span className="text-blue-500">Hub</span>
              </h3>
              <p className="text-gray-400 mb-4">
                Empowering learners worldwide with high-quality education and
                practical skills for the digital age.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleGetStarted}
                    className="text-gray-400 hover:text-blue-500 transition-colors text-left"
                  >
                    Browse Courses
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    For Businesses
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Become a Teacher
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Mobile App
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Community
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    System Status
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Careers
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Press
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-left">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 LearnHub. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
                  Terms of Service
                </button>
                <button className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
                  Privacy Policy
                </button>
                <button className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;