// app/locations/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { locations } from '@/lib/data/locations';

// Update the interface to match your actual data structure
interface Location {
  id: number; // Changed from string to number
  name: string;
  href: string;
  region?: string;
  province?: string;
  address?: string;
}

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Group locations by region
  const groupedLocations = useMemo(() => {
    let filtered = locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(location => 
        (location.region || location.province) === selectedRegion
      );
    }

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
  }, [searchTerm, selectedRegion]);

  // Get unique regions for filter
  const regions = useMemo(() => {
    const allRegions = locations.map(location => location.region || location.province || 'Other');
    return Array.from(new Set(allRegions)).sort();
  }, []);

  const totalLocations = Object.values(groupedLocations).reduce((sum, regionLocations) => sum + regionLocations.length, 0);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Our Service Locations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide driving test services across Ontario. Find a location near you and book your test today.
            </p>
            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{locations.length} locations available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Locations
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by city name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Region
              </label>
              <select
                id="region-filter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent bg-white"
              >
                <option value="all">All Regions ({locations.length})</option>
                {regions.map(region => {
                  const count = locations.filter(loc => (loc.region || loc.province || 'Other') === region).length;
                  return (
                    <option key={region} value={region}>
                      {region} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{totalLocations}</span> location{totalLocations !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedRegion !== 'all' && ` in ${selectedRegion}`}
            </p>
          </div>
        </div>

        {/* Locations Grid */}
        {Object.keys(groupedLocations).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or region filter.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLocations).map(([region, regionLocations]) => (
              <div key={region} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Region Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {region}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({regionLocations.length} location{regionLocations.length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                </div>

                {/* Locations Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {regionLocations.map((location) => (
                      <Link
                        key={location.id}
                        href={location.href}
                        className="group block p-4 border border-gray-200 rounded-lg hover:border-[#0C8B44] hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-400 group-hover:text-[#0C8B44] mt-0.5 mr-3 flex-shrink-0 transition-colors" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#0C8B44] transition-colors truncate">
                              {location.name}
                            </h3>
                            {location.address && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {location.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-[#0C8B44] to-[#0a7e3d] rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Book Your Test?</h2>
          <p className="text-lg mb-6 opacity-90">
            Choose your location and get started with your driving test booking.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-[#0C8B44] font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Book Your Test Now
          </Link>
        </div>
      </div>
    </div>
  );
}