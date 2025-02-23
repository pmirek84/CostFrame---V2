import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LocationPickerProps {
  label: string;
  address: string;
  coordinates: { lat: number; lng: number };
  onChange: (address: string, coordinates: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ label, address, coordinates, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && searchBoxRef.current) {
      // Inicjalizacja mapy
      const map = new google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      mapInstanceRef.current = map;

      // Dodanie markera
      const marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        draggable: true,
        title: address
      });
      markerRef.current = marker;

      // Obsługa przeciągania markera
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          const newCoordinates = { lat: position.lat(), lng: position.lng() };
          // Konwersja współrzędnych na adres
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: newCoordinates }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              onChange(results[0].formatted_address, newCoordinates);
            }
          });
        }
      });

      // Inicjalizacja wyszukiwarki
      const searchBox = new google.maps.places.SearchBox(searchBoxRef.current);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBoxRef.current);

      // Obsługa wyboru miejsca
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places?.length) {
          const place = places[0];
          if (place.geometry?.location) {
            const newCoordinates = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            map.setCenter(newCoordinates);
            marker.setPosition(newCoordinates);
            onChange(place.formatted_address || '', newCoordinates);
          }
        }
      });
    }
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchBoxRef}
          type="text"
          defaultValue={address}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Wyszukaj adres..."
        />
      </div>
      <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden"></div>
    </div>
  );
}