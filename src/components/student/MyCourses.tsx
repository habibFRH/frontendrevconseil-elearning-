/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import enrollmentService from "../../services/enrollmentService";
import type { Course, Enrollment } from "../../types";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
//   UsersIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);

      // Get both enrolled courses + enrollment info (for progress, status, etc.)
      const [courseData, enrollmentData] = await Promise.all([
        enrollmentService.getMyEnrolledCourses(),
        enrollmentService.getMyEnrollments()
      ]);

      setCourses(courseData);
      setEnrollments(enrollmentData);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  // const getProgressForCourse = (courseId: number) => {
  //   const enrollment = enrollments.find((en) => en.courseId === courseId);
  //   return enrollment?.progressPercentage ?? undefined;
  // };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading your courses...</div>
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">My Courses</h1>
          <p className="text-blue-100">
            View and continue the courses you’re enrolled in.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label
            htmlFor="search-courses"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search Courses
          </label>
          <input
            id="search-courses"
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            // const progress = getProgressForCourse(course.id);
            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg cursor-pointer hover:scale-105 transition-transform"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/student/courses/${course.id}/play`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/student/courses/${course.id}/play`);
                  }
                }}
              >
                {/* Course Image or Icon */}
                <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <AcademicCapIcon className="w-16 h-16 text-white" />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {/* <div className="flex items-center text-sm text-gray-500">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      {course.currentStudents || 0} students enrolled
                    </div> */}

                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Progress Bar
                  {progress !== undefined && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {progress}% completed
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500">
              You haven’t enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
