// lib/hooks/useFileUpload.ts - Updated to remove documentsApi dependency
import { useState } from 'react';
import { fileUploadService, FileType, UploadProgress, FileUploadResponse } from '@/lib/services/fileUpload.service';
import { ApiResponse } from '../types/auth.types';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const uploadFile = async (file: File, fileType: FileType, description?: string): Promise<ApiResponse<FileUploadResponse>> => {
    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadedFile(null);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      const result = await fileUploadService.uploadFile(
        { file, fileType, description },
        (progressData) => {
          setProgress(progressData);
        }
      );
      
      if (result.success) {
        setSuccess(true);
        setUploadedFile(result.data);
        return result;
      } else {
        const errorMessage = result.error?.message || 'Upload failed';
        setError(errorMessage);
        return result;
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: { 
          status_code: 500, 
          message: errorMessage 
        } 
      };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<ApiResponse<FileUploadResponse>> => {
    return uploadFile(file, 'profile');
  };

  const uploadG2License = async (file: File, description?: string): Promise<ApiResponse<FileUploadResponse>> => {
    return uploadFile(file, 'g2', description);
  };

  const uploadDrivingLicense = async (file: File, description?: string): Promise<ApiResponse<FileUploadResponse>> => {
    return uploadFile(file, 'license', description);
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setUploadedFile(null);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
  };

  return {
    uploadFile,
    uploadProfilePicture,
    uploadG2License,
    uploadDrivingLicense,
    isUploading,
    progress,
    error,
    success,
    uploadedFile,
    resetState
  };
};