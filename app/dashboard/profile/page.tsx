// app/dashboard/profile/page.tsx
"use client"

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, MapPin, Lock, Camera } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { authApi, handleApiError } from "@/lib/api";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { fileUploadService } from "@/lib/services/fileUpload.service";
import type { UpdateProfileRequest } from "@/lib/types/auth.types";
import Image from "next/image";

type TabType = "Profile" | "Password";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>("Profile");
  const { user, checkAuthStatus, isAuthenticated, isLoading } = useAuth();
  
  // File upload for profile picture
  const { uploadProfilePicture, isUploading: isUploadingProfile, progress: uploadProgress, error: uploadError, success: uploadSuccess, uploadedFile, resetState: resetUploadState } = useFileUpload();
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: ""
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Loading and error states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || ""
      });
    }
  }, [user]);

  // Handle profile picture upload with better error handling
  const handleProfilePictureSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check authentication before upload
    if (!isAuthenticated) {
      setProfileError("You must be logged in to upload files");
      return;
    }

    resetUploadState();
    setProfileError("");
    setProfileSuccess("");

    // Validate file
    const validation = fileUploadService.validateFile(file, 'profile');
    if (!validation.isValid) {
      setProfileError(validation.message || "Invalid file");
      return;
    }

    // Create preview
    try {
      const preview = await fileUploadService.fileToBase64(file);
      setProfilePreview(preview);
    } catch (error) {
      console.error('Error creating preview:', error);
    }

    // Upload file with enhanced error handling
    try {
      const result = await uploadProfilePicture(file);
      
      if (result.success && result.data) {
        // Update user profile with new photo URL
        if (result.data.url) {
          try {
            const updateResult = await authApi.updateProfile({ 
              photo_url: result.data.url 
            });
            
            if (updateResult.success) {
              // Refresh user data to get updated profile picture
              await checkAuthStatus();
              setProfileSuccess("Profile picture updated successfully!");
            } else {
              const errorMessage = handleApiError(updateResult.error);
              setProfileError(errorMessage);
              
              // If 401, try to refresh auth status
              if (updateResult.error?.status_code === 401) {
                console.log('🔄 401 error, checking auth status...');
                await checkAuthStatus();
                if (!isAuthenticated) {
                  window.location.href = '/login';
                }
              }
            }
          } catch (error) {
            console.error('Error updating profile with photo URL:', error);
            setProfileError("Failed to update profile with new photo.");
          }
        }
      } else {
        // Handle upload errors
        if (result.error?.status_code === 401) {
          setProfileError("Authentication expired. Please log in again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setProfileError(uploadError || "Failed to upload profile picture. Please try again.");
        }
      }
    } catch (error) {
      console.error('Upload exception:', error);
      setProfileError("Upload failed. Please check your connection and try again.");
    }
  };

  const handleProfilePictureClick = () => {
    if (!isAuthenticated) {
      setProfileError("Please log in to upload files");
      return;
    }
    profilePictureInputRef.current?.click();
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear success/error messages when user starts typing
    setProfileError("");
    setProfileSuccess("");
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear success/error messages when user starts typing
    setPasswordError("");
    setPasswordSuccess("");
  };

  // Update profile with enhanced authentication checks
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setProfileError("You must be logged in to update your profile");
      console.error('❌ Authentication check failed:', { isAuthenticated, hasUser: !!user });
      
      // Try to refresh auth status
      try {
        await checkAuthStatus();
        if (!isAuthenticated) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        window.location.href = '/login';
        return;
      }
    }

    setIsUpdatingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      // Prepare update data (only send changed fields)
      const updateData: UpdateProfileRequest = {};
      
      if (profileForm.full_name !== user?.full_name) {
        updateData.full_name = profileForm.full_name;
      }
      
      if (profileForm.phone_number !== user?.phone_number) {
        updateData.phone_number = profileForm.phone_number;
      }
      
      if (profileForm.address !== user?.address) {
        updateData.address = profileForm.address;
      }

      // Only send request if there are changes
      if (Object.keys(updateData).length === 0) {
        setProfileError("No changes detected");
        return;
      }

      console.log('🔄 Sending profile update:', updateData);
      const result = await authApi.updateProfile(updateData);
      
      if (result.success) {
        setProfileSuccess("Profile updated successfully!");
        // Refresh user data
        await checkAuthStatus();
      } else {
        const errorMessage = handleApiError(result.error);
        setProfileError(errorMessage);
        console.error('❌ Profile update error:', result.error);
        
        // Handle authentication errors
        if (result.error?.status_code === 401) {
          setProfileError("Session expired. Please log in again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Profile update exception:', error);
      setProfileError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Update password with enhanced authentication checks
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    if (!isAuthenticated || !user) {
      setPasswordError("You must be logged in to update your password");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      // Validate password fields
      if (!passwordForm.currentPassword) {
        setPasswordError("Current password is required");
        return;
      }

      if (!passwordForm.newPassword) {
        setPasswordError("New password is required");
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters long");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      const updateData: UpdateProfileRequest = {
        password: passwordForm.newPassword,
        oldPassword: passwordForm.currentPassword
      };

      console.log('🔄 Sending password update');
      const result = await authApi.updateProfile(updateData);
      
      if (result.success) {
        setPasswordSuccess("Password updated successfully!");
        // Clear form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        const errorMessage = handleApiError(result.error);
        setPasswordError(errorMessage);
        console.error('❌ Password update error:', result.error);
        
        // Handle authentication errors
        if (result.error?.status_code === 401) {
          setPasswordError("Session expired. Please log in again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Password update exception:', error);
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0C8B44]"></div>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-600 mb-4">Authentication Required</div>
            <div className="text-gray-500 mb-6">Please log in to access your profile.</div>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-[#0C8B44] hover:bg-[#0C8B44]/90"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get current profile picture (uploaded file, preview, or user's existing photo)
  const currentProfilePicture = uploadedFile?.url || profilePreview || user.photo_url;
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="flex-1 p-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-[#0C8B44] rounded-full flex items-center justify-center relative overflow-hidden">
              {currentProfilePicture ? (
                <Image 
                  src={currentProfilePicture} 
                  alt={user.full_name}
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
              
              {/* Upload Progress Overlay */}
              {isUploadingProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                    <div className="text-xs">{uploadProgress.percentage}%</div>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleProfilePictureClick}
              disabled={isUploadingProfile || !isAuthenticated}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-3 w-3 text-white" />
            </button>
            
            {/* Hidden file input */}
            <input
              ref={profilePictureInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleProfilePictureSelect}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.full_name}</h1>
            <p className="text-gray-600">{user.email}</p>
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400">
                Auth: {isAuthenticated ? '✅' : '❌'} | ID: {user.id}
              </p>
            )}
          </div>
        </div>

        {/* Upload Error/Success Messages */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-sm text-green-600">Profile picture uploaded successfully!</p>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={cn(
              "px-6 py-2 text-sm font-medium rounded-md flex items-center gap-2",
              activeTab === "Profile"
                ? "bg-green-100 text-[#0C8B44] border border-[#0C8B44]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setActiveTab("Profile")}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            className={cn(
              "px-6 py-2 text-sm font-medium rounded-md flex items-center gap-2",
              activeTab === "Password"
                ? "bg-green-100 text-[#0C8B44] border border-[#0C8B44]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setActiveTab("Password")}
          >
            <Lock className="h-4 w-4" />
            Password
          </button>
        </div>
        
        {activeTab === "Profile" ? (
          <>
            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="mb-10">
              {/* Success/Error Messages */}
              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-green-600">{profileSuccess}</p>
                </div>
              )}
              
              {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-red-600">{profileError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                    value={profileForm.full_name}
                    onChange={handleProfileChange}
                    required
                    disabled={!isAuthenticated}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    value={profileForm.email}
                    readOnly
                    title="Email cannot be changed"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email cannot be changed
                  </p>
                </div>
                
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                    value={profileForm.phone_number}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                    disabled={!isAuthenticated}
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Your Address
                    </div>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    placeholder="Enter your address"
                    disabled={!isAuthenticated}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="submit"
                  disabled={isUpdatingProfile || !isAuthenticated}
                  className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Password Tab */
          <div className="max-w-md">
            <form onSubmit={handleUpdatePassword}>
              {/* Success/Error Messages */}
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-green-600">{passwordSuccess}</p>
                </div>
              )}
              
              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mb-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Current Password
                    </div>
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={!isAuthenticated}
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      New Password
                    </div>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    minLength={8}
                    required
                    disabled={!isAuthenticated}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm New Password
                    </div>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={!isAuthenticated}
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={isUpdatingPassword || !isAuthenticated}
                className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}