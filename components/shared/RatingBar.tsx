import React from 'react'

export default function RatingBar() {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <div className="flex items-center gap-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FFBB00" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0L10.3511 5.18237L16 5.87336L11.768 9.77641L12.7023 16L8 12.8824L3.29772 16L4.23204 9.77641L0 5.87336L5.64886 5.18237L8 0Z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        ELAN is rated 4.9 stars on Google and trusted by thousands of successful drivers.
      </p>
    </div>
  )
}
