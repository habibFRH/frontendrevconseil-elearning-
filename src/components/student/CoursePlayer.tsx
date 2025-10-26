/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Menu,
  X,
  AlertCircle
} from "lucide-react";
import lessonService from "../../services/lessonService";
import enrollmentService from "../../services/enrollmentService";
import { type Course, type LessonContent, type Lesson } from "../../types/auth";
import { ContentType } from "../../types/auth";

const PlayCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonContents, setLessonContents] = useState<{
    [key: number]: LessonContent[];
  }>({});
  const [currentContent, setCurrentContent] = useState<LessonContent | null>(
    null
  );
  const [expandedLessons, setExpandedLessons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoError, setVideoError] = useState<string>("");
  const [pdfError, setPdfError] = useState<boolean>(false);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData(parseInt(courseId));
    }
  }, [courseId]);

  const fetchCourseData = async (id: number) => {
    try {
      setLoading(true);
      setError("");

      // Fetch published lessons for the course (includes contents for each lesson)
      const lessonsData = await lessonService.getPublishedLessons(id);
      setLessons(lessonsData);

      // Build content map from the lessons' embedded contents
      const contentsMap: { [key: number]: LessonContent[] } = {};
      lessonsData.forEach((lesson) => {
        contentsMap[lesson.id] = lesson.contents || [];
      });
      setLessonContents(contentsMap);

      // Derive course details from student's enrolled courses (student-safe)
      try {
        const myCourses = await enrollmentService.getMyEnrolledCourses();
        const found = myCourses.find((c) => c.id === id) || null;
        if (found) {
          setCourse(found as unknown as Course);
        } else if (lessonsData.length > 0) {
          // Fallback minimal course shape using lessons data
          setCourse({
            id,
            title: lessonsData[0].courseTitle,
            description: undefined,
            teacher: {
              id: 0,
              username: "",
              firstName: "",
              lastName: "",
              email: ""
            },
            durationHours: undefined,
            maxStudents: undefined,
            currentStudents: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Course);
        }
      } catch (e) {
        // Non-fatal: still show lessons even if course metadata fails
        console.warn("Could not load enrolled course details", e);
      }

      // Set initial content (first content of first lesson)
      if (lessonsData.length > 0) {
        const firstLessonContents = contentsMap[lessonsData[0].id];
        if (firstLessonContents && firstLessonContents.length > 0) {
          setCurrentContent(firstLessonContents[0]);
          setExpandedLessons([lessonsData[0].id]);
        }
      }
    } catch (err) {
      console.error("Error fetching course data:", err);
      setError("Failed to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLessonExpansion = (lessonId: number) => {
    setExpandedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const selectContent = (content: LessonContent) => {
    setCurrentContent(content);
    setVideoError(""); // Reset video error when selecting new content
    setPdfError(false); // Reset PDF error when selecting new content
    setPdfLoading(content.contentType === "DOCUMENT" && content.contentUrl?.toLowerCase().endsWith('.pdf')); // Set loading for PDFs
    
    // Set timeout for PDF loading
    if (content.contentType === "DOCUMENT" && content.contentUrl?.toLowerCase().endsWith('.pdf')) {
      setTimeout(() => {
        if (pdfLoading) {
          setPdfError(true);
          setPdfLoading(false);
        }
      }, 10000); // 10 second timeout
    }
    
    // Close sidebar on mobile when content is selected
    setSidebarOpen(false);
    // You can add progress tracking logic here if needed
    // For example: markContentAsViewed(content.id);
  };

  // Enhanced YouTube URL processing
  const getYouTubeEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      let videoId = "";

      // Handle different YouTube URL formats
      if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          videoId = urlObj.searchParams.get("v") || "";
        } else if (urlObj.pathname.startsWith("/embed/")) {
          videoId = urlObj.pathname.replace("/embed/", "");
        } else if (urlObj.pathname.startsWith("/v/")) {
          videoId = urlObj.pathname.replace("/v/", "");
        }
      }

      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Create embed URL with additional parameters for better compatibility
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

      // Add parameters to improve embedding success
      embedUrl.searchParams.set("rel", "0"); // Don't show related videos
      embedUrl.searchParams.set("modestbranding", "1"); // Reduce YouTube branding
      embedUrl.searchParams.set("enablejsapi", "1"); // Enable JavaScript API
      embedUrl.searchParams.set("origin", window.location.origin); // Set origin for security

      return embedUrl.toString();
    } catch (error) {
      console.error("Error processing YouTube URL:", error);
      return url; // Return original URL if processing fails
    }
  };

  const handleVideoError = () => {
    setVideoError(
      "This video cannot be played. It may be restricted or unavailable."
    );
  };

  const handlePdfError = () => {
    setPdfError(true);
    setPdfLoading(false);
  };

  const handlePdfLoad = () => {
    setPdfLoading(false);
    setPdfError(false);
  };

  const renderCurrentContent = () => {
    if (!currentContent) {
      return (
        <div className="flex items-center justify-center h-full text-white">
          <Play className="w-16 h-16 text-gray-400" />
          <span className="ml-4 text-xl text-gray-400">
            Select content to play
          </span>
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white bg-red-900">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <span className="text-xl text-red-400 mb-4">{videoError}</span>
          <div className="text-center text-red-300">
            <p className="mb-2">Possible solutions:</p>
            <ul className="text-sm space-y-1">
              <li>• The video may be private or restricted</li>
              <li>• Try opening the video directly on YouTube</li>
              <li>• Check if the video URL is correct</li>
            </ul>
          </div>
          <button
            onClick={() => window.open(currentContent.contentUrl, "_blank")}
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Open on YouTube
          </button>
        </div>
      );
    }

    const url = currentContent.contentUrl;
    switch (currentContent.contentType) {
      case ContentType.YOUTUBE_VIDEO: {
        const embedUrl = getYouTubeEmbedUrl(url);
        return (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={currentContent.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onError={handleVideoError}
            onLoad={(e) => {
              // Check if iframe loaded successfully
              const iframe = e.target as HTMLIFrameElement;
              iframe.onload = () => {
                try {
                  // This will throw an error if the iframe content is restricted
                  
                } catch (err) {
                  // This might indicate embedding restrictions
                  console.warn("Potential embedding restriction detected");
                }
              };
            }}
          />
        );
      }
      case ContentType.UPLOADED_VIDEO:
        return (
          <video
            controls
            className="w-full h-full"
            src={url}
            poster="/api/placeholder/800/450"
            onError={handleVideoError}
          >
            <track
              kind="captions"
              label="English"
              srcLang="en"
              src=""
              default
            />
            Your browser does not support the video tag.
          </video>
        );
      case ContentType.EXTERNAL_LINK:
        return (
          <iframe
            className="w-full h-full bg-white"
            src={url}
            title={currentContent.title}
            onError={handleVideoError}
          />
        );
      case ContentType.AUDIO:
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <audio
              controls
              className="w-full max-w-3xl"
              onError={handleVideoError}
            >
              <source src={url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case ContentType.IMAGE:
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <img
              src={url}
              alt={currentContent.title}
              className="max-h-full max-w-full object-contain"
              onError={handleVideoError}
            />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-white">
            <FileText className="w-5 h-5 mr-2" />
            <span>Unsupported content type</span>
          </div>
        );
    }
  };

  const renderDocumentContent = () => {
    if (!currentContent || currentContent.contentType !== ContentType.DOCUMENT) {
      return null;
    }

    const url = currentContent.contentUrl;
    const isPdf = url.toLowerCase().endsWith(".pdf");
    console.log("Document URL:", url, "Type:", isPdf ? "PDF" : "Other"); // Debug log

    if (isPdf) {
      return (
        <div className="w-full h-full bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">{currentContent.title}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = currentContent.title + '.pdf';
                  link.click();
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            {pdfLoading && !pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}
            <iframe
              className="w-full h-full border-0"
              src={`${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={currentContent.title}
              onError={handlePdfError}
              onLoad={handlePdfLoad}
              style={{
                minHeight: '600px',
                height: '100%'
              }}
            />
            {pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    PDF Loading Failed
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The PDF cannot be displayed inline. Please try downloading it.
                  </p>
                  <button
                    onClick={() => {
                      setPdfError(false);
                      setPdfLoading(true);
                      // Force iframe reload
                      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                      if (iframe) {
                        const currentSrc = iframe.src;
                        iframe.src = '';
                        setTimeout(() => {
                          iframe.src = currentSrc;
                        }, 100);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Handle other document types
      return (
        <div className="w-full h-full bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">{currentContent.title}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = currentContent.title;
                  link.click();
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="flex-1 w-full p-4">
            <iframe
              className="w-full h-full border-0"
              src={url}
              title={currentContent.title}
              onError={handleVideoError}
            />
          </div>
        </div>
      );
    }
  };

  const getContentIcon = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.UPLOADED_VIDEO:
        return <Play className="w-4 h-4" />;
      case ContentType.DOCUMENT:
        return <CheckCircle className="w-4 h-4" />;
      case ContentType.EXTERNAL_LINK:
      case ContentType.AUDIO:
      case ContentType.IMAGE:
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate("/student/my-courses")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <button
              onClick={() => navigate("/student/my-courses")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="border-l border-gray-300 pl-2 sm:pl-4 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate">
                by{" "}
                {`${course.teacher?.firstName ?? ""} ${
                  course.teacher?.lastName ?? ""
                }`.trim() || "Instructor"}
              </p>
            </div>
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Section - Content Area */}
        <div className="flex-1 bg-white lg:border-r border-gray-200 order-2 lg:order-1">
          <div className="p-4 sm:p-6 min-h-full">
            {/* Check if current content is a document */}
            {currentContent && currentContent.contentType === ContentType.DOCUMENT ? (
              // Document Viewer - Full Height
              <>
                <div className="h-[calc(100vh-200px)] rounded-lg overflow-hidden border border-gray-200">
                  {renderDocumentContent()}
                </div>
                
                {/* Document Info */}
                <div className="mt-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-left text-gray-900 mb-3">
                    {currentContent.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 text-left leading-relaxed">
                    {currentContent.description ||
                      "No description available for this document."}
                  </p>
                </div>
              </>
            ) : (
              // Video Player - 16:9 Aspect Ratio
              <>
                <div
                  className="relative bg-black rounded-lg overflow-hidden mb-4 sm:mb-6 w-full max-w-none lg:max-w-[1000px]"
                  style={{ aspectRatio: "16/9" }}
                >
                  {renderCurrentContent()}
                </div>

                {/* Content Info */}
                <div className="pb-4 sm:pb-8">
                  {currentContent ? (
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-left text-gray-900 mb-3">
                        {currentContent.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-700 text-left leading-relaxed">
                        {currentContent.description ||
                          "No description available for this content."}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                        Welcome to {course.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {course.description}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Lessons Accordion */}
        <div
          className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-80 lg:w-96 bg-white transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          order-1 lg:order-2
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="relative z-50 h-full overflow-y-auto bg-white lg:min-h-full">
            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Course Content
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">
                Course Content
              </h3>

              <div className="space-y-2">
                {lessons.map((lesson) => {
                  const contents = lessonContents[lesson.id] || [];

                  return (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg"
                    >
                      {/* Lesson Header */}
                      <button
                        onClick={() => toggleLessonExpansion(lesson.id)}
                        className="w-full px-3 sm:px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 flex-shrink-0">
                            <span className="text-xs font-medium">
                              {lesson.lessonOrder ?? lesson.id}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {contents.length} items
                              {lesson.durationMinutes &&
                                ` • ${lesson.durationMinutes} min`}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedLessons.includes(lesson.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Lesson Contents */}
                      {expandedLessons.includes(lesson.id) && (
                        <div className="border-t border-gray-100">
                          {contents.length > 0 ? (
                            contents.map((content) => (
                              <button
                                key={content.id}
                                onClick={() => selectContent(content)}
                                className={`w-full px-3 sm:px-4 py-3 text-left flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 transition-colors border-l-4 ${
                                  currentContent &&
                                  currentContent.id === content.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-transparent"
                                }`}
                              >
                                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 flex-shrink-0">
                                  {getContentIcon(content.contentType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium truncate ${
                                      currentContent &&
                                      currentContent.id === content.id
                                        ? "text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {content.title}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {content.durationSeconds ||
                                      "No duration specified"}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 sm:px-4 py-3 text-sm text-gray-500 text-center">
                              No content available for this lesson
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Show course content button on mobile when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayCourse;
