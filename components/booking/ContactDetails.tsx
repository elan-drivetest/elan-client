"use client"

import React from "react";
import { cn } from "@/lib/utils";

interface ContactDetailsProps {
  fullName: string;
  email: string;
  phone: string;
  className?: string;
}

export default function ContactDetails({
  fullName,
  email,
  phone,
  className
}: ContactDetailsProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-lg font-medium mb-1">Contact Details</h2>
      <div className="text-sm text-gray-600">
        <p>{fullName}</p>
        <p>{email}</p>
        <p>{phone}</p>
      </div>
    </div>
  );
}