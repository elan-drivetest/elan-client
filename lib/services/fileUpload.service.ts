/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/services/fileUpload.service.ts - Updated to remove DocumentType dependency
import axios, { AxiosInstance, AxiosProgressEvent } from 'axios';

export type FileType = 'profile' | 'g2' | 'license';

export interface FileUploadRequest {
  file: File;
  fileType: FileType;
  description?: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  fileType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    status_code: number;
    message: string;
    errors?: Record<string, string | string[]>;
  };
}

class FileUploadService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api-dev.elanroadtestrental.ca/v1',
      withCredentials: true,
    });

    // Request interceptor to ensure cookies are sent
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('File Upload Request:', config.method?.toUpperCase(), config.url);
        
        // For file uploads, don't manually set Content-Type
        // axios will set it automatically with proper boundary for FormData
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        // Ensure withCredentials is set for cookie authentication
        config.withCredentials = true;
        
        // Log cookies being sent (for debugging)
        if (typeof window !== 'undefined') {
          const cookies = document.cookie;
          const hasAuthCookie = cookies.includes('_elanAuth');
          const hasRefreshCookie = cookies.includes('_elanAuthR');
          
          console.log('🍪 File upload cookie check:', {
            hasAuthCookie,
            hasRefreshCookie,
            cookieString: cookies
          });
          
          if (!hasAuthCookie || !hasRefreshCookie) {
            console.warn('⚠️ Missing authentication cookies for file upload');
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log('File Upload Success:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('File Upload API Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadFile(
    uploadData: FileUploadRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    try {
      // Validate file first
      const validation = this.validateFile(uploadData.file, uploadData.fileType);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            status_code: 400,
            message: validation.message || 'Invalid file'
          }
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('fileType', uploadData.fileType);
      
      if (uploadData.description) {
        formData.append('description', uploadData.description);
      }

      // Upload with progress tracking
      const response = await this.apiClient.post('/files/upload', formData, {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            onProgress(progress);
          }
        }
      });

      return {
        success: true,
        message: this.getSuccessMessage(uploadData.fileType),
        data: response.data
      };

    } catch (error: any) {
      console.error('File upload error:', error);
      
      // Handle axios errors
      if (error.response) {
        const errorData = this.processErrorResponse(error.response.data, uploadData.fileType);
        return {
          success: false,
          error: errorData
        };
      }
      
      // Handle network errors
      return {
        success: false,
        error: {
          status_code: 500,
          message: 'Network error occurred. Please check your connection and try again.'
        }
      };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, fileType: FileType): { isValid: boolean; message?: string } {
    if (!file) {
      return { isValid: false, message: 'Please select a file to upload' };
    }

    // Check file size
    const maxSize = this.getMaxFileSize(fileType);
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { 
        isValid: false, 
        message: `File is too large. Maximum size is ${maxSizeMB}MB.` 
      };
    }

    // Check file type
    const allowedTypes = this.getAllowedFileTypes(fileType);
    if (!allowedTypes.includes(file.type)) {
      const typeNames = this.getFileTypeNames(fileType);
      return { 
        isValid: false, 
        message: `Invalid file type. Please upload a ${typeNames} file.` 
      };
    }

    return { isValid: true };
  }

  /**
   * Get allowed file types for each file type
   */
  private getAllowedFileTypes(fileType: FileType): string[] {
    switch (fileType) {
      case 'profile':
        return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      case 'g2':
      case 'license':
        return ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      default:
        return ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    }
  }

  /**
   * Get maximum file size for each file type
   */
  private getMaxFileSize(fileType: FileType): number {
    switch (fileType) {
      case 'profile':
        return 5 * 1024 * 1024; // 5MB
      case 'g2':
      case 'license':
        return 10 * 1024 * 1024; // 10MB
      default:
        return 10 * 1024 * 1024; // 10MB
    }
  }

  /**
   * Get human-readable file type names
   */
  private getFileTypeNames(fileType: FileType): string {
    switch (fileType) {
      case 'profile':
        return 'JPEG, PNG, or WebP';
      case 'g2':
      case 'license':
        return 'PDF, JPEG, JPG, or PNG';
      default:
        return 'PDF, JPEG, JPG, or PNG';
    }
  }

  /**
   * Process error response from API
   */
  private processErrorResponse(errorData: any, fileType: FileType): any {
    // Default error structure
    if (!errorData || typeof errorData !== 'object') {
      return {
        status_code: 500,
        message: 'Upload failed. Please try again.',
        errors: {}
      };
    }

    // Handle specific error cases
    if (errorData.errors) {
      const errors = errorData.errors;
      
      if (errors.file?.includes('File too large')) {
        const maxSizeMB = Math.round(this.getMaxFileSize(fileType) / (1024 * 1024));
        return {
          ...errorData,
          message: `File is too large. Maximum size is ${maxSizeMB}MB.`
        };
      }
      
      if (errors.fileType?.includes('Invalid file type')) {
        const typeNames = this.getFileTypeNames(fileType);
        return {
          ...errorData,
          message: `Invalid file type. Please upload a ${typeNames} file.`
        };
      }
    }

    return errorData;
  }

  /**
   * Generate success message based on file type
   */
  private getSuccessMessage(fileType: FileType): string {
    switch (fileType) {
      case 'profile':
        return 'Profile picture uploaded successfully!';
      case 'g2':
        return 'G2 license document uploaded successfully!';
      case 'license':
        return 'Driver\'s license document uploaded successfully!';
      default:
        return 'Document uploaded successfully!';
    }
  }

  /**
   * Convert file to base64 for preview
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;