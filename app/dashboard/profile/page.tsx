// app/dashboard/profile/page.tsx
"use client"

import React, { useState } from "react";
import { FileText } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { profileData } from "@/lib/data/profile";

type TabType = "Profile" | "Password";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>("Profile");
  const { user, documents } = profileData;
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={cn(
              "px-6 py-2 text-sm font-medium rounded-md",
              activeTab === "Profile"
                ? "bg-green-100 text-[#0C8B44] border border-[#0C8B44]"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setActiveTab("Profile")}
          >
            Profile
          </button>
          <button
            className={cn(
              "px-6 py-2 text-sm font-medium rounded-md",
              activeTab === "Password"
                ? "bg-green-100 text-[#0C8B44] border border-[#0C8B44]"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setActiveTab("Password")}
          >
            Password
          </button>
        </div>
        
        {activeTab === "Profile" ? (
          <>
            {/* Profile Form */}
            <div className="mb-10">
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue={user.fullName}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue={user.email}
                    readOnly
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">
                    Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue={user.phone}
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm text-gray-600 mb-1">
                    Your Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue={user.address}
                    placeholder="Your Address"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue={user.country}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button className="bg-[#0C8B44] hover:bg-[#0C8B44]/90">
                  Update
                </Button>
                <Button className="bg-[#0C8B44] hover:bg-[#0C8B44]/90">
                  Change Email
                </Button>
              </div>
            </div>
            
            {/* Documents Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Documents</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* G2/G Road Test Documents */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="mb-4 flex gap-2">
                    <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Upload Your G2/G Road Test Documents</div>
                      <div className="text-xs text-gray-600">PNG, JPG, JPEG or PDF file</div>
                    </div>
                  </div>
                  
                  {documents.roadTest ? (
                    <div className="bg-gray-100 p-4 rounded-md flex items-start mb-4">
                      <div className="bg-gray-300 p-2 rounded-md mr-3">
                        <FileText size={18} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{documents.roadTest.name}</div>
                        <div className="text-xs text-gray-500">{documents.roadTest.size}</div>
                      </div>
                    </div>
                  ) : null}
                  
                  <Button variant="outline" className="w-full text-[#0C8B44] border-[#0C8B44]">
                    Update Document +
                  </Button>
                </div>
                
                {/* G1 License */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="mb-4 flex gap-2">
                    <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center text-white text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Upload Your G1 License</div>
                      <div className="text-xs text-gray-600">PNG, JPG, JPEG or PDF file</div>
                    </div>
                  </div>
                  
                  {documents.license ? (
                    <div className="bg-gray-100 p-4 rounded-md flex items-start mb-4">
                      <div className="bg-gray-300 p-2 rounded-md mr-3">
                        <FileText size={18} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{documents.license.name}</div>
                        <div className="text-xs text-gray-500">{documents.license.size}</div>
                      </div>
                    </div>
                  ) : null}
                  
                  <Button variant="outline" className="w-full text-[#0C8B44] border-[#0C8B44]">
                    Update Document +
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Password Tab */
          <div className="max-w-md">
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label htmlFor="current-password" className="block text-sm text-gray-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm text-gray-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <Button className="bg-[#0C8B44] hover:bg-[#0C8B44]/90">
              Update Password
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}