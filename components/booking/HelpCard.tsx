import Image from 'next/image'
import React from 'react'

export default function HelpCard() {
  return (
    <div className="mb-8 border rounded-lg p-4">
      <h3 className="font-medium mb-2">Questions?</h3>
      <p className="text-sm text-gray-600 mb-4">Our friendly team is standing by to help</p>
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
          <Image
            src="/support-agent.png"
            alt="Support Agent"
            width={48}
            height={48}
          />
        </div>
        <div>
          <p className="text-sm font-medium">Support team</p>
          <div className="flex items-center gap-2 mt-1">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span className="text-xs text-gray-600">+1-647-606-4519</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span className="text-xs text-gray-600">help@elanroadrental.ca</span>
          </div>
        </div>
      </div>
    </div>
  )
}
