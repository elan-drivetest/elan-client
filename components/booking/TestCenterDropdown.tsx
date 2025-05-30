"use client"

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, MapPin } from "lucide-react";

export type TestCenter = {
  id: string;
  name: string;
  address: string;
};

interface TestCenterDropdownProps {
  testCenters: TestCenter[];
  selectedCenter: TestCenter | null;
  onSelect: (center: TestCenter) => void;
}

export default function TestCenterDropdown({
  testCenters,
  selectedCenter,
  onSelect
}: TestCenterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter test centers based on search term
  const filteredCenters = useMemo(() => {
    return testCenters.filter(center =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [testCenters, searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleSelect = (center: TestCenter) => {
    onSelect(center);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:border-[#0C8B44] transition-colors"
        onClick={toggleDropdown}
      >
        {selectedCenter ? (
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">{selectedCenter.name}</div>
            <div className="text-sm text-gray-500 truncate">{selectedCenter.address}</div>
          </div>
        ) : (
          <div className="text-gray-500 flex-1">Select a test center</div>
        )}
        <div className="flex items-center ml-3">
          {selectedCenter && (
            <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center mr-2">
              <Check size={16} className="text-white" />
            </div>
          )}
          <ChevronDown 
            size={20} 
            className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
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

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCenters.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {`No test centers found matching "${searchTerm}"`}
              </div>
            ) : (
              <>
                {/* Results count */}
                {searchTerm && (
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs text-gray-600">
                      {filteredCenters.length} center{filteredCenters.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                )}
                
                {/* Center list */}
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedCenter?.id === center.id ? 'bg-[#0C8B44]/5 border-l-4 border-l-[#0C8B44]' : ''
                    }`}
                    onClick={() => handleSelect(center)}
                  >
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${selectedCenter?.id === center.id ? 'text-[#0C8B44]' : 'text-gray-900'}`}>
                          {center.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {center.address}
                        </div>
                      </div>
                      {selectedCenter?.id === center.id && (
                        <div className="ml-2">
                          <div className="w-5 h-5 bg-[#0C8B44] rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {"Can't find your test center?"} <a href="/contact-us" className="text-[#0C8B44] hover:underline">Contact us</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}