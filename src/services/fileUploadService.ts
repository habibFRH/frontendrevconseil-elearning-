import api from './api';

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: string;
  contentType: string;
}

export interface FileDeleteResponse {
  message: string;
}

class FileUploadService {
  /**
   * Upload a file to the server
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('File upload response:', response.data); // Debug log
    return response.data;
  }

  /**
   * Delete a file from the server
   */
  async deleteFile(fileUrl: string): Promise<FileDeleteResponse> {
    const response = await api.delete('/files/delete', {
      params: { url: fileUrl },
    });

    return response.data;
  }

  /**
   * Get the full URL for a file
   */
  getFileUrl(filename: string): string {
    return `${api.defaults.baseURL}/files/serve/${filename}`;
  }

  /**
   * Validate file type based on content type
   */
  validateFileType(file: File, expectedType: string): boolean {
    const fileType = file.type.toLowerCase();
    
    switch (expectedType) {
      case 'image':
        return fileType.startsWith('image/');
      case 'video':
        return fileType.startsWith('video/');
      case 'audio':
        return fileType.startsWith('audio/');
      case 'document':
        return fileType.includes('pdf') || 
               fileType.includes('document') || 
               fileType.includes('text') ||
               fileType.includes('presentation');
      default:
        return true;
    }
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }
}

const fileUploadService = new FileUploadService();
export default fileUploadService;
