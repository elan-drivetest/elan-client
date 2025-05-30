'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Location {
  id: string;
  name: string;
  href: string;
  region?: string;
  province?: string;
}

interface LocationsDropdownProps {
  locations: Location[];
}

const LocationsDropdown: React.FC<LocationsDropdownProps> = ({ locations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Group locations by region/province
  const groupedLocations = useMemo(() => {
    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc, location) => {
      const key = location.region || location.province || 'Other';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(location);
      return acc;
    }, {} as Record<string, Location[]>);

    // Sort regions and locations within each region
    const sortedGrouped: Record<string, Location[]> = {};
    Object.keys(grouped)
      .sort()
      .forEach(key => {
        sortedGrouped[key] = grouped[key].sort((a, b) => a.name.localeCompare(b.name));
      });

    return sortedGrouped;
  }, [locations, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleLocationClick = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center text-sm font-medium cursor-pointer hover:text-[#0C8B44] transition-colors">
        Our Locations <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        className="w-80 max-h-96 p-0 overflow-hidden"
        sideOffset={8}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Locations List */}
        <div className="max-h-80 overflow-y-auto">
          {Object.keys(groupedLocations).length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {`No locations found matching "${searchTerm}"`}
            </div>
          ) : (
            Object.entries(groupedLocations).map(([region, regionLocations]) => (
              <div key={region} className="py-2">
                {/* Region Header */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {region} ({regionLocations.length})
                  </h3>
                </div>
                
                {/* Region Locations */}
                <div className="py-1">
                  {regionLocations.map((location) => (
                    <Link
                      key={location.id}
                      href={location.href}
                      onClick={handleLocationClick}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0C8B44] transition-colors group"
                    >
                      <MapPin className="h-4 w-4 text-gray-400 group-hover:text-[#0C8B44] mr-3 flex-shrink-0" />
                      <span className="truncate">{location.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Link
              href="/locations"
              onClick={handleLocationClick}
              className="block w-full text-center text-sm font-medium text-[#0C8B44] hover:text-[#0C8B44]/80 transition-colors"
            >
              View All Locations →
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationsDropdown;