import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import courseService from "../../services/courseService";
import enrollmentService from "../../services/enrollmentService";
import type { Course } from "../../types";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AcademicCapIcon,
  UsersIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const AllCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAllCourses();
  }, []);

  // Sync searchTerm with `search` query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || "";
    setSearchTerm(q);
  }, [location.search]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);

      // Fetch all available courses and user's enrolled courses
      const [allCourses, enrolledCourses] = await Promise.all([
        courseService.getAvailableCourses(),
        enrollmentService.getMyEnrolledCourses()
      ]);

      setCourses(allCourses);
      setEnrolledCourseIds(enrolledCourses.map((course) => course.id));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrolling((prev) => [...prev, courseId]);

      await enrollmentService.enrollInCourse({ courseId });

      // Update enrolled courses list
      setEnrolledCourseIds((prev) => [...prev, courseId]);

      // Show success message (you can implement toast notifications)
      console.log("Successfully enrolled in course");
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setError("Failed to enroll in course. Please try again.");
      // Handle error (show toast notification)
    } finally {
      setEnrolling((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const isEnrolled = (courseId: number) => enrolledCourseIds.includes(courseId);
  const isEnrolling = (courseId: number) => enrolling.includes(courseId);

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "popular":
          return (b.currentStudents || 0) - (a.currentStudents || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading courses...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-indigo-500 to-purple-700 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">All Courses</h1>
          <p className="text-indigo-100">
            Discover and enroll in courses that interest you.
          </p>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2" />
              {courses.length} courses available
            </div>
            <div className="flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              {enrolledCourseIds.length} enrolled
            </div>
          </div>
        </div> */}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label
                htmlFor="search-courses"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Courses
              </label>
              <input
                id="search-courses"
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label
                htmlFor="filter-category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="all">All Categories</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label
                htmlFor="sort-by"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const enrollingInProgress = isEnrolling(course.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Course Image or Icon */}
                <div className="h-48 bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center relative">
                  <AcademicCapIcon className="w-16 h-16 text-white" />

                  {/* Enrolled Badge */}
                  {enrolled && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Enrolled
                    </div>
                  )}

                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description || "No description available"}
                  </p>

                  {/* Course Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {course.currentStudents || 0} students
                      </div>
                      {course.durationHours && (
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {course.durationHours}h
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        by{" "}
                        {`${course.teacher?.firstName || ""} ${
                          course.teacher?.lastName || ""
                        }`.trim() || "Instructor"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {enrolled ? (
                      <button
                        onClick={() =>
                          navigate(`/student/courses/${course.id}/play`)
                        }
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <BookOpenIcon className="w-4 h-4 mr-2" />
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingInProgress}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {enrollingInProgress ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Enroll Now
                          </>
                        )}
                      </button>
                    )}

                    {/* Preview/Details Button */}
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedCourses.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filters"
                : "No courses are available at the moment"}
            </p>
            {(searchTerm || filterCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllCourses;
