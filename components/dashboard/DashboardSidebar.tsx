// components/dashboard/DashboardSidebar.tsx
"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, text, isActive }) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-[#0C8B44]/10 text-[#0C8B44]" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      {text}
    </Link>
  );
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  
  const routes = [
    { 
      href: "/dashboard", 
      icon: <LayoutGrid className="h-5 w-5" />, 
      text: "Dashboard" 
    },
    { 
      href: "/dashboard/bookings", 
      icon: <Calendar className="h-5 w-5" />, 
      text: "Bookings" 
    },
    { 
      href: "/dashboard/profile", 
      icon: <User className="h-5 w-5" />, 
      text: "Profile" 
    }
  ];

  return (
    <div className="w-52 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {routes.map((route) => (
          <SidebarLink 
            key={route.href}
            href={route.href} 
            icon={route.icon} 
            text={route.text} 
            isActive={
              route.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname.startsWith(route.href)
            } 
          />
        ))}
      </nav>
    </div>
  );
}