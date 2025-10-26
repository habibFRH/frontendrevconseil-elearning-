import React, { useState, useEffect } from "react";
import {
  Upload,
  Video,
  FileText,
  Link,
  Headphones,
  Image,
  Youtube,
  Download,
  X,
  Edit
} from "lucide-react";
import fileUploadService from "../../services/fileUploadService";

interface LessonContentEditDialogProps {
  isOpen: boolean;
  contentData: LessonContentData | null;
  onSave: (contentData: LessonContentData) => Promise<void>;
  onCancel: () => void;
}

export interface LessonContentData {
  id?: string;
  title: string;
  description: string;
  order: number;
  type:
    | "youtube"
    | "upload_video"
    | "upload_document"
    | "external_link"
    | "upload_audio"
    | "upload_image";
  url?: string;
  file?: File;
  existingFileUrl?: string;
  existingFileName?: string;
  isDownloadable?: boolean;
  uploadedFileUrl?: string;
}

const LessonContentEditDialog: React.FC<LessonContentEditDialogProps> = ({
  isOpen,
  contentData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<LessonContentData>({
    title: "",
    description: "",
    order: 1,
    type: "youtube",
    url: "",
    isDownloadable: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileChanged, setFileChanged] = useState(false);

  useEffect(() => {
    if (isOpen && contentData) {
      setFormData({
        ...contentData,
        file: undefined // Clear file since we're editing
      });
      setErrors({});
      setFileChanged(false);

      // Set initial preview for existing content
      if (contentData.existingFileUrl) {
        setFilePreview(contentData.existingFileUrl);
      } else if (contentData.type === "youtube" && contentData.url) {
        setFilePreview(contentData.url);
      } else {
        setFilePreview(null);
      }
    }
  }, [isOpen, contentData]);

  if (!isOpen || !contentData) return null;

  const contentTypes = [
    { value: "youtube", label: "YouTube Video", icon: Youtube },
    { value: "upload_video", label: "Upload Video", icon: Video },
    { value: "upload_document", label: "Upload Document", icon: FileText },
    { value: "external_link", label: "External Link", icon: Link },
    { value: "upload_audio", label: "Upload Audio", icon: Headphones },
    { value: "upload_image", label: "Upload Image", icon: Image }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? parseInt(value) || 0
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear file preview if content type changed to something that needs upload
    if (
      name === "type" &&
      [
        "upload_video",
        "upload_document",
        "upload_audio",
        "upload_image"
      ].includes(value as string)
    ) {
      if (formData.type !== value) {
        setFilePreview(null);
        setFileChanged(true);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileUpload = async (file: File) => {
    const uploadTypes = ["upload_video", "upload_document", "upload_audio", "upload_image"];
    
    if (!uploadTypes.includes(formData.type)) {
      return;
    }

    // Validate file type
    const expectedType = formData.type.replace('upload_', '');
    if (!fileUploadService.validateFileType(file, expectedType)) {
      setErrors(prev => ({
        ...prev,
        file: `Please select a valid ${expectedType} file`
      }));
      return;
    }

    setUploading(true);
    setErrors(prev => ({ ...prev, file: "" }));

    try {
      const response = await fileUploadService.uploadFile(file);
      
      setFormData(prev => ({
        ...prev,
        file,
        uploadedFileUrl: response.url,
        url: response.url
      }));

      setFileChanged(true);

      // Create preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
      } else if (file.type.startsWith("audio/")) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
      } else {
        setFilePreview("document");
      }

    } catch (error) {
      console.error("File upload error:", error);
      setErrors(prev => ({
        ...prev,
        file: "Failed to upload file. Please try again."
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.type === "youtube" && !formData.url?.trim()) {
      newErrors.url = "YouTube URL is required";
    }

    if (formData.type === "external_link" && !formData.url?.trim()) {
      newErrors.url = "URL is required";
    }

    // For upload types, require either uploaded file or URL
    if (["upload_video", "upload_document", "upload_audio", "upload_image"].includes(formData.type)) {
      if (!formData.file && !formData.url?.trim()) {
        newErrors.file = "Please upload a file or provide a URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error updating lesson content:", error);
    } finally {
      setSaving(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const renderContentTypeSection = () => {
    const needsUrl = ["youtube", "external_link"].includes(formData.type);
    const needsFileUpload = ["upload_video", "upload_document", "upload_audio", "upload_image"].includes(formData.type);
    const needsDownloadable = [
      "upload_video",
      "upload_document",
      "upload_audio",
      "upload_image"
    ].includes(formData.type);

    return (
      <div className="space-y-4">
        {needsUrl && (
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {formData.type === "youtube" ? "YouTube URL" : "URL"} *
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url || ""}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.url
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-300"
              }`}
              placeholder={
                formData.type === "youtube"
                  ? "https://www.youtube.com/watch?v=..."
                  : "https://example.com"
              }
            />
            {errors.url && (
              <p className="mt-1 text-xs text-red-600">{errors.url}</p>
            )}
          </div>
        )}

        {needsFileUpload && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File *
            </label>

            {formData.existingFileUrl && !fileChanged && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Current: {formData.existingFileName || "Existing file"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFileChanged(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
              } ${errors.file ? "border-red-300" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 mb-2">
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  ) : (
                    <>
                      Drop your file here or{" "}
                      <label className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileInputChange}
                          accept={
                            formData.type === "upload_video"
                              ? "video/*"
                              : formData.type === "upload_audio"
                              ? "audio/*"
                              : formData.type === "upload_image"
                              ? "image/*"
                              : ".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          }
                        />
                      </label>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.type === "upload_video" && "MP4, WebM, MOV up to 100MB"}
                  {formData.type === "upload_audio" && "MP3, WAV, OGG up to 50MB"}
                  {formData.type === "upload_image" && "PNG, JPG, GIF up to 10MB"}
                  {formData.type === "upload_document" && "PDF, DOC, TXT up to 25MB"}
                </p>
                {formData.file && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {formData.file.name} ({fileUploadService.formatFileSize(formData.file.size)})
                  </div>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-xs text-red-600">{errors.file}</p>
            )}
          </div>
        )}

        {needsDownloadable && (
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isDownloadable"
                checked={formData.isDownloadable || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Download className="w-4 h-4 mr-1" />
                Allow download
              </span>
            </label>
          </div>
        )}

        {/* Preview Section */}
        {renderPreview()}
      </div>
    );
  };

  const renderPreview = () => {
    if (formData.type === "youtube" && formData.url) {
      const videoId = getYouTubeVideoId(formData.url);
      if (videoId) {
        return (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video preview"
                frameBorder="0"
                allowFullScreen
                className="rounded"
              ></iframe>
            </div>
          </div>
        );
      }
    }

    // Show preview for uploaded files
    if (filePreview && formData.file) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">New File Preview</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            {formData.type === "upload_image" && (
              <img
                src={filePreview}
                alt="Preview"
                className="max-h-48 rounded mx-auto"
              />
            )}

            {formData.type === "upload_video" && (
              <video
                src={filePreview}
                controls
                className="max-h-48 w-full rounded"
              />
            )}

            {formData.type === "upload_audio" && (
              <audio src={filePreview} controls className="w-full" />
            )}

            {formData.type === "upload_document" && (
              <div className="flex items-center space-x-2 text-gray-600">
                <FileText className="w-6 h-6" />
                <div>
                  <p className="font-medium">{formData.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {fileUploadService.formatFileSize(formData.file.size)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Show preview for existing files or URL-based content
    if (
      (filePreview && formData.existingFileUrl && !fileChanged) ||
      (formData.url && ["upload_image", "upload_video", "upload_audio", "upload_document", "external_link"].includes(formData.type))
    ) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {formData.existingFileUrl && !fileChanged ? "Current File Preview" : "URL Preview"}
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            {formData.type === "upload_image" && (
              <img
                src={filePreview || formData.url}
                alt="Preview"
                className="max-h-48 rounded mx-auto"
                onError={() => setFilePreview(null)}
              />
            )}

            {formData.type === "upload_video" && (
              <video
                src={filePreview || formData.url}
                controls
                className="max-h-48 w-full rounded"
                onError={() => setFilePreview(null)}
              />
            )}

            {formData.type === "upload_audio" && (
              <audio
                src={filePreview || formData.url}
                controls
                className="w-full"
                onError={() => setFilePreview(null)}
              />
            )}

            {formData.type === "upload_document" && (
              <div className="flex items-center space-x-2 text-gray-600">
                <FileText className="w-6 h-6" />
                <div>
                  <p className="font-medium">
                    {formData.existingFileName || "Document file"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <a 
                      href={formData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Open document
                    </a>
                  </p>
                </div>
              </div>
            )}

            {formData.type === "external_link" && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Link className="w-6 h-6" />
                <div>
                  <p className="font-medium">External Link</p>
                  <p className="text-sm text-gray-500">
                    <a 
                      href={formData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {formData.url}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="text-black fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black opacity-70 transition-opacity"
          onClick={onCancel}
        />

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 max-h-[90vh] overflow-y-auto">
          <div>
            {/* Header */}
            <div className="sm:flex sm:items-start mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  Edit Lesson Content
                </h3>
                <p className="text-sm text-gray-500">
                  Modify your lesson content and update media files.
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter content title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter content description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="order"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Content Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {contentTypes.map((type) => {
                    // const Icon = type.icon;
                      return (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Right Column - Content Specific */}
              <div>{renderContentTypeSection()}</div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || uploading}
                className={`px-4 py-2 border border-transparent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  saving || uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Content"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContentEditDialog;