/* eslint-disable @typescript-eslint/no-explicit-any */
/* LessonContents.tsx */
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import type { LessonContent } from "../../types";
import { ContentType } from "../../types";
import lessonService from "../../services/lessonService";
import { useToast } from "../../hooks/useToast";
import ConfirmDialog from "../common/ConfirmDialog";
import LessonContentAddDialog from "../common/LessonContentAddDialog";
import LessonContentEditDialog from "../common/LessonContentEditDialog";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const LessonContents: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { addToast } = useToast();

  const [contents, setContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<LessonContent | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<LessonContent | null>(null);

  const fetchContents = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const data = await lessonService.getLessonContent(id);
      setContents(data);
    } catch (error) {
      console.error("Error fetching lesson contents:", error);
      addToast("Failed to fetch lesson contents", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (lessonId) {
      fetchContents(Number(lessonId));
    }
  }, [lessonId, fetchContents]);

  const handleDelete = async () => {
    if (!selectedContent) return;
    try {
      await lessonService.deleteContent(selectedContent.id);
      setContents(contents.filter((c) => c.id !== selectedContent.id));
      addToast("Content deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting content:", error);
      addToast("Failed to delete content", "error");
    } finally {
      setConfirmOpen(false);
      setSelectedContent(null);
    }
  };

  const handleAddContent = async (data: any) => {
    if (!lessonId) return;
    try {
      // Map dialog data to backend LessonContentRequest
      let contentType: ContentType;
      let contentUrl: string;

      switch (data.type) {
        case 'youtube':
          contentType = ContentType.YOUTUBE_VIDEO;
          contentUrl = data.url as string;
          break;
        case 'external_link':
          contentType = ContentType.EXTERNAL_LINK;
          contentUrl = data.url as string;
          break;
        case 'upload_video':
          contentType = ContentType.UPLOADED_VIDEO;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        case 'upload_document':
          contentType = ContentType.DOCUMENT;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        case 'upload_audio':
          contentType = ContentType.AUDIO;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        case 'upload_image':
          contentType = ContentType.IMAGE;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        default:
          contentType = ContentType.EXTERNAL_LINK;
          contentUrl = data.url as string;
      }

      if (!contentUrl) {
        addToast('Please upload a file or provide a URL.', 'error');
        return;
      }

      const payload = {
        title: data.title,
        description: data.description,
        contentType,
        contentUrl,
        contentOrder: Number(data.order) || 1,
        isDownloadable: !!data.isDownloadable,
      };

      await lessonService.addContent(Number(lessonId), payload);
      await fetchContents(Number(lessonId));
      addToast('Content added successfully', 'success');
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Add content error:', error);
      addToast('Failed to add content', 'error');
    }
  };

  const handleEditContent = async (data: any) => {
    if (!lessonId || !editingContent) return;
    try {
      // Map dialog data to backend LessonContentRequest
      let contentType: ContentType;
      let contentUrl: string;

      switch (data.type) {
        case 'youtube':
          contentType = ContentType.YOUTUBE_VIDEO;
          contentUrl = data.url as string;
          break;
        case 'external_link':
          contentType = ContentType.EXTERNAL_LINK;
          contentUrl = data.url as string;
          break;
        case 'upload_video':
          contentType = ContentType.UPLOADED_VIDEO;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        case 'upload_document':
          contentType = ContentType.DOCUMENT;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        case 'upload_audio':
          contentType = ContentType.AUDIO;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        case 'upload_image':
          contentType = ContentType.IMAGE;
          contentUrl = data.uploadedFileUrl || data.url;
          break;
        default:
          contentType = ContentType.EXTERNAL_LINK;
          contentUrl = data.url as string;
      }

      if (!contentUrl) {
        addToast('Please upload a file or provide a URL.', 'error');
        return;
      }

      const payload = {
        title: data.title,
        description: data.description,
        contentType,
        contentUrl,
        contentOrder: Number(data.order) || 1,
        isDownloadable: !!data.isDownloadable,
      };

      await lessonService.updateContent(editingContent.id, payload);
      await fetchContents(Number(lessonId));
      addToast('Content updated successfully', 'success');
      setEditDialogOpen(false);
      setEditingContent(null);
    } catch (error) {
      console.error('Update content error:', error);
      addToast('Failed to update content', 'error');
    }
  };

  const handleEditClick = (content: LessonContent) => {
    setEditingContent(content);
    setEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">
            Content for Lesson {lessonId}
          </h1>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setAddDialogOpen(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Content
          </button>
        </div>

        {/* Content Table / States */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            Loading contents...
          </div>
        ) : contents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            No contents found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Downloadable
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700 text-left">
                        {content.contentOrder}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-left">
                        {content.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-left">
                        {content.contentType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-left">
                        {content.isDownloadable ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4 text-sm text-right flex justify-end gap-2">
                        <Link
                          to={content.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-md"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleEditClick(content)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-md"
                          title="Edit Content"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContent(content);
                            setConfirmOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-2 rounded-md"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmOpen && !!selectedContent}
          onConfirm={handleDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setSelectedContent(null);
          }}
          title="Delete Content"
          message={`Are you sure you want to delete "${selectedContent?.title || 'this content'}"? This action cannot be undone.`}
          confirmText="Delete Content"
          type="danger"
        />

        {/* Add Content Dialog */}
        <LessonContentAddDialog
          isOpen={addDialogOpen}
          onSave={handleAddContent}
          onCancel={() => setAddDialogOpen(false)}
        />

        {/* Edit Content Dialog */}
        {editingContent && (
          <LessonContentEditDialog
            isOpen={editDialogOpen}
            contentData={{
              id: editingContent.id.toString(),
              title: editingContent.title,
              description: editingContent.description || "",
              order: editingContent.contentOrder,
              type: (() => {
                switch (editingContent.contentType) {
                  case "YOUTUBE_VIDEO":
                    return "youtube";
                  case "UPLOADED_VIDEO":
                    return "upload_video";
                  case "DOCUMENT":
                    return "upload_document";
                  case "AUDIO":
                    return "upload_audio";
                  case "IMAGE":
                    return "upload_image";
                  case "EXTERNAL_LINK":
                  default:
                    return "external_link";
                }
              })(),
              url: editingContent.contentUrl,
              isDownloadable: editingContent.isDownloadable,
              existingFileUrl: editingContent.contentUrl,
              existingFileName: editingContent.title
            }}
            onSave={handleEditContent}
            onCancel={() => {
              setEditDialogOpen(false);
              setEditingContent(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default LessonContents;
