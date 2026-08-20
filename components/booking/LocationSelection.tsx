// components/booking/LocationSelection.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, AlertTriangle, MapPin, Navigation, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/context/BookingContext";
import { useAppConfig } from "@/lib/context/ConfigContext";
import { useAddressSearch } from "@/lib/hooks/useBooking";
import { AddressSearchResult, formatPrice } from "@/lib/types/booking.types";
import { bookingUtils } from "@/lib/utils/booking.utils";
import { findThirtyMinuteLesson, previewPickupPrice } from "@/lib/pricing/calculate";

export type LocationOption = "test-centre" | "pickup";

interface LocationOptionProps {
  option: LocationOption;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const LocationOptionItem: React.FC<LocationOptionProps> = ({
  selected,
  title,
  description,
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all duration-200 mb-4 hover:shadow-sm",
        selected ? "border-[#0C8B44] bg-[#0C8B44]/5 ring-1 ring-[#0C8B44]/20" : "border-gray-200 hover:border-gray-300",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          selected 
            ? "border-[#0C8B44] bg-[#0C8B44]" 
            : "border-gray-300"
        )}>
          {selected && (
            <Check size={14} className="text-white" />
          )}
        </div>
      </div>
    </div>
  );
};

interface LocationSelectionProps {
  selectedOption: LocationOption;
  onOptionChange: (option: LocationOption) => void;
  className?: string;
  onPickupLocationSelect?: (address: string, coordinates: { lat: number; lng: number }, distance?: number) => void;
  testCenterCoordinates?: { lat: number; lng: number }; // For distance calculation
}

export default function LocationSelection({
  selectedOption,
  onOptionChange,
  className,
  onPickupLocationSelect,
  testCenterCoordinates,
}: LocationSelectionProps) {
  const { bookingState, updateBookingState, pricingConfig, addons } = useBooking();

  // Serviceability limit. `null` on a backend that predates the setting, in
  // which case we impose no constraint — the server still enforces it.
  const { config: appConfig } = useAppConfig();
  const maxPickupDistanceKm = appConfig?.maxPickupDistanceKm ?? null;

  /**
   * Reject a pickup the server would refuse, at the moment it is chosen.
   *
   * Without this the customer sailed through to Stripe on a fare built from an
   * implausible distance — a geocode that lands in the wrong province reads as a
   * perfectly ordinary address on screen, because the address and the distance
   * being priced are different numbers. Wording tracks the server's own 400 so
   * the two cannot say different things.
   */
  const rejectionReason = (distance: number | undefined): string | null => {
    if (distance === undefined || maxPickupDistanceKm === null) return null;
    if (distance <= maxPickupDistanceKm) return null;

    return `That address is ${Math.round(distance)} km from the test centre, which is outside our service area. Please check the address, or choose to meet at the test centre.`;
  };

  // The add-on whose price the server credits back on long pickups.
  const thirtyMinuteLesson = bookingState.testType
    ? findThirtyMinuteLesson(addons, bookingState.testType)
    : null;
  const [pickupLocation, setPickupLocation] = useState(bookingState.pickupAddress || "");
  const [pickupDistance, setPickupDistance] = useState<number | undefined>(bookingState.pickupDistance);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AddressSearchResult | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Use the address search hook
  const { results, loading: searchLoading, error: searchError, searchAddresses, clearResults } = useAddressSearch();

  // Create the search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length >= 3) {
      await searchAddresses(query);
      setShowSuggestions(true);
    } else {
      clearResults();
      setShowSuggestions(false);
    }
  }, [searchAddresses, clearResults]);

  // Use a ref to store the debounced function
  const debouncedSearchRef = useRef(debounce(performSearch, 300));

  // Update the debounced function when performSearch changes
  useEffect(() => {
    debouncedSearchRef.current = debounce(performSearch, 300);
  }, [performSearch]);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    debouncedSearchRef.current(query);
  }, []);

  // Handle input change with debounced search
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickupLocation(value);
    setSelectedResult(null);
    setLocationError(null); // Clear location errors when typing
    
    if (value.length >= 3) {
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      clearResults();
    }
  };

  // Reverse geocoding function to convert coordinates to address
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Try to find a nearby address using a coordinate-based search
      const searchQuery = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const results = await searchAddresses(searchQuery, 1);
      
      if (results && results.length > 0) {
        return results[0].formatted_address || results[0].address || null;
      }
      
      // If no results, return a formatted coordinate string
      return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Address suggestion component with enhanced display for new API fields
  const AddressSuggestion: React.FC<{ 
    result: AddressSearchResult; 
    onClick: () => void;
    isHighlighted?: boolean;
  }> = ({ result, onClick, isHighlighted = false }) => {
    // Use new API fields with fallbacks for backward compatibility
    const displayAddress = result.formatted_address || result.address || 'Unknown Address';
    const city = result.city || '';
    const province = result.province || '';
    const postalCode = result.postal_code || '';
    const country = result.country || '';
    
    return (
      <div
        className={cn(
          "px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors",
          isHighlighted ? "bg-[#0C8B44]/5 text-[#0C8B44]" : "hover:bg-gray-50 text-gray-900"
        )}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {displayAddress}
            </p>
            {/* Show structured address data if available */}
            {(city || province || postalCode) && (
              <p className="text-xs text-gray-500 mt-1">
                {[city, province, postalCode, country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle current location with improved error handling
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get a readable address for these coordinates
          const address = await reverseGeocode(latitude, longitude);
          
          if (address) {
            setPickupLocation(address);
            
            // Create a result object for consistency with new API format
            const currentLocationResult: AddressSearchResult = {
              formatted_address: address,
              latitude: latitude,
              longitude: longitude,
              postal_code: '', // Unknown for current location
              city: '', // Unknown for current location
              province: '', // Unknown for current location  
              country: 'Canada', // Assume Canada
              
              // Legacy compatibility
              address: address,
              lat: latitude,
              lng: longitude,
            };
            
            setSelectedResult(currentLocationResult);
            
            // Calculate distance if test center coordinates provided
            let distance: number | undefined;
            if (testCenterCoordinates) {
              try {
                console.log('🔄 Calculating distance for current location:', latitude, longitude, 'to', testCenterCoordinates);
                distance = await bookingUtils.calculateDistance(
                  { lat: latitude, lng: longitude },
                  testCenterCoordinates
                );
                console.log('✅ Current location distance calculated:', distance);
                setPickupDistance(distance);
              } catch (error) {
                console.error('Error calculating distance:', error);
              }
            }

            const rejection = rejectionReason(distance);
            if (rejection) {
              setLocationError(rejection);
              setPickupDistance(undefined);
              setSelectedResult(null);
              updateBookingState({
                pickupAddress: undefined,
                pickupCoordinates: undefined,
                pickupDistance: undefined
              });
              return;
            }

            // Update booking state
            updateBookingState({
              pickupAddress: address,
              pickupCoordinates: { lat: latitude, lng: longitude },
              pickupDistance: distance
            });

            // Call parent callback AFTER distance calculation
            if (distance !== undefined && onPickupLocationSelect) {
              console.log('📞 Calling parent callback with current location distance:', distance);
              onPickupLocationSelect(address, { lat: latitude, lng: longitude }, distance);
            }
          } else {
            setLocationError("Unable to determine your address. Please enter it manually.");
          }
        } catch (error) {
          console.error("Error processing location:", error);
          setLocationError("Unable to determine your address. Please enter it manually.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsGettingLocation(false);
        
        // Provide user-friendly error messages
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions and try again.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Please enter your address manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again or enter your address manually.");
            break;
          default:
            setLocationError("Unable to get your current location. Please enter your address manually.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Handle suggestion selection with improved compatibility
  const handleSuggestionSelect = async (result: AddressSearchResult) => {
    // Use the new field names with fallbacks for backward compatibility
    const address = result.formatted_address || result.address || '';
    const lat = result.latitude || result.lat || 0;
    const lng = result.longitude || result.lng || 0;
    
    setPickupLocation(address);
    setSelectedResult(result);
    setShowSuggestions(false);
    setLocationError(null);
    
    // Calculate distance if test center coordinates are provided
    let distance: number | undefined;
    if (testCenterCoordinates) {
      try {
        console.log('🔄 Calculating distance for:', lat, lng, 'to', testCenterCoordinates);
        distance = await bookingUtils.calculateDistance(
          { lat, lng },
          testCenterCoordinates
        );
        console.log('✅ Distance calculated:', distance);
        setPickupDistance(distance);
      } catch (error) {
        console.error('Error calculating distance:', error);
      }
    }

    const rejection = rejectionReason(distance);
    if (rejection) {
      setLocationError(rejection);
      setPickupDistance(undefined);
      setSelectedResult(null);
      updateBookingState({
        pickupAddress: undefined,
        pickupCoordinates: undefined,
        pickupDistance: undefined
      });
      return;
    }

    // Update booking state with pickup location, coordinates, and distance
    updateBookingState({
      pickupAddress: address,
      pickupCoordinates: { lat, lng },
      pickupDistance: distance
    });
    
    // Call parent callback with address, coordinates, and distance AFTER calculation
    if (distance !== undefined && onPickupLocationSelect) {
      console.log('📞 Calling parent callback with distance:', distance);
      onPickupLocationSelect(address, { lat, lng }, distance);
    }
  };

  // Handle option change
  const handleOptionChange = (option: LocationOption) => {
    onOptionChange(option);
    
    // Clear pickup location if switching to test-centre
    if (option === "test-centre") {
      setPickupLocation("");
      setPickupDistance(undefined);
      setSelectedResult(null);
      setLocationError(null);
      clearResults();
      setShowSuggestions(false);
      
      // Clear booking state
      updateBookingState({
        pickupAddress: undefined,
        pickupCoordinates: undefined,
        pickupDistance: undefined
      });
    } else if (option === "pickup" && inputRef.current) {
      // Focus input when switching to pickup option
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Format error messages for better UX
  const getDisplayError = () => {
    if (locationError) return locationError;
    if (searchError) {
      // Handle different types of API errors
      if (searchError.includes('400')) {
        return "Please enter a valid address with at least 3 characters.";
      } else if (searchError.includes('500')) {
        return "Address search service is temporarily unavailable. Please try again later.";
      } else if (searchError.includes('Network')) {
        return "Network error. Please check your connection and try again.";
      }
      return "Unable to search addresses. Please try again.";
    }
    return null;
  };

  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Pick up or Meet at Drive Test Centre</h2>
      
      {/* Location Options */}
      <LocationOptionItem
        option="pickup"
        selected={selectedOption === "pickup"}
        title="Pick me up from my location"
        description="Our instructor will pick you up from your location and drop you off after the test"
        onClick={() => handleOptionChange("pickup")}
      />
      
      <LocationOptionItem
        option="test-centre"
        selected={selectedOption === "test-centre"}
        title="I'll meet at the test centre"
        description="You'll meet our instructor directly at the test centre"
        onClick={() => handleOptionChange("test-centre")}
      />
      
      {/* Pickup Address Input */}
      {selectedOption === "pickup" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">Your Pickup Location</h3>
            <button
              onClick={handleCurrentLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-2 text-sm text-[#0C8B44] hover:text-[#0C8B44]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGettingLocation ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Navigation size={14} />
              )}
              {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {"Enter your pickup address. We'll calculate the distance and pricing automatically."}
          </p>
          
          <div className="relative">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={pickupLocation}
                onChange={handleLocationInputChange}
                placeholder="Enter your address (e.g., 123 Main St, Toronto, ON)"
                className={cn(
                  "w-full p-3 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C8B44]/20 focus:border-[#0C8B44] transition-all duration-200",
                  getDisplayError() ? "border-red-300" : "border-gray-300",
                  selectedResult ? "bg-green-50 border-green-300" : ""
                )}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {searchLoading || isGettingLocation ? (
                  <Loader2 size={18} className="text-gray-400 animate-spin" />
                ) : selectedResult ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <MapPin size={18} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Search Error */}
            {getDisplayError() && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertTriangle size={14} />
                <span className="text-sm">{getDisplayError()}</span>
              </div>
            )}

            {/* Address Suggestions */}
            {showSuggestions && (results.length > 0 || searchLoading) && (
              <div 
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {searchLoading && (
                  <div className="p-4 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Searching addresses...</p>
                  </div>
                )}
                
                {!searchLoading && results.map((result, index) => {
                  // Create unique key using multiple fields for better uniqueness
                  const uniqueKey = `${result.latitude || result.lat}-${result.longitude || result.lng}-${index}-${result.postal_code || ''}`;
                  
                  return (
                    <AddressSuggestion
                      key={uniqueKey}
                      result={result}
                      onClick={() => handleSuggestionSelect(result)}
                    />
                  );
                })}
                
                {!searchLoading && results.length === 0 && pickupLocation.length >= 3 && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">
                      No addresses found. Try a different search term.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Address Confirmation */}
          {selectedResult && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Address Selected</p>
                  <p className="text-sm text-green-700 mt-1">
                    {selectedResult.formatted_address || selectedResult.address}
                  </p>
                  {/* Show structured address data if available */}
                  {(selectedResult.city || selectedResult.province || selectedResult.postal_code) && (
                    <p className="text-xs text-green-600 mt-1">
                      {[selectedResult.city, selectedResult.province, selectedResult.postal_code].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedResult(null);
                    setPickupLocation("");
                    setPickupDistance(undefined);
                    setLocationError(null);
                    updateBookingState({
                      pickupAddress: undefined,
                      pickupCoordinates: undefined,
                      pickupDistance: undefined
                    });
                    inputRef.current?.focus();
                  }}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Distance and Pricing Info. The fee is shown only once the live fare
              tiers have loaded — quoting one from built-in constants is how a
              120 km pickup once previewed at $85 instead of $250. */}
          {pickupDistance !== undefined && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Distance & Pricing</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• Distance to test center: {pickupDistance?.toFixed(1) || '0'} km</p>
                <p>
                  • Pickup fee:{' '}
                  {pricingConfig
                    ? formatPrice(previewPickupPrice(pickupDistance || 0, pricingConfig))
                    : 'calculating…'}
                </p>
              </div>
            </div>
          )}

          {/* Long-trip credit. The threshold is the server's base_distance and
              the amount is the real 30-minute lesson price, so this cannot
              promise a benefit the backend does not grant. */}
          {pricingConfig &&
            pickupDistance !== undefined &&
            pickupDistance > pricingConfig.baseDistance &&
            thirtyMinuteLesson && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-green-900">
                    You qualify for a long-trip credit
                  </h4>
                  <p className="mt-1 text-xs text-green-800">
                    Your pickup is past {pricingConfig.baseDistance} km, so we&apos;ll take{' '}
                    {formatPrice(thirtyMinuteLesson.price)} off any lesson or mock
                    test you add.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Helper Text */}
          <div className="mt-3 text-xs text-gray-500">
            <p>💡 Tip: Include your postal code for better accuracy</p>
          </div>
        </div>
      )}

      {/* Test Centre Benefits Promotion */}
      {selectedOption === "test-centre" && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-amber-800">Prefer to be picked up?</h4>
              <p className="text-xs text-amber-700 mt-1">
                We&apos;ll pick you up from your address and bring you to the test
                centre.
              </p>
            </div>
          </div>

          {/* This block used to advertise a free dropoff and free 30-minute /
              1-hour lessons at 50 km and 100 km. None of that exists on the
              server — the only long-distance benefit is the credit below, whose
              threshold and amount both come from live config. */}
          {pricingConfig && thirtyMinuteLesson && (
            <ul className="mt-3 ml-7 space-y-1">
              <li className="flex items-center gap-1 text-xs text-amber-700">
                <Check size={14} className="text-[#0C8B44]" />
                <span>
                  Pickups past {pricingConfig.baseDistance} km earn{' '}
                  {formatPrice(thirtyMinuteLesson.price)} off any lesson or mock test
                </span>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}