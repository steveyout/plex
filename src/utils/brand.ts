import { useState, useEffect } from 'react';

export interface BrandConfig {
  name: string;
  accentColor: string; // Hex color for inline styles if needed
  textAccent: string; // Tailwind class
  bgAccent: string; // Tailwind class
  borderAccent: string; // Tailwind class
  hoverTextAccent: string; // Tailwind class
  hoverBgAccent: string; // Tailwind class
  hoverBorderAccent: string; // Tailwind class
  fillAccent: string; // Tailwind class
  shadowAccent: string; // Tailwind class
  focusRingAccent: string; // Tailwind class
  loaderBorderColor: string; // Tailwind class
  badgeBg: string; // Tailwind class
}

export function getBrandConfig(hostname: string): BrandConfig {
  if (hostname.includes('plexmovies')) {
    return {
      name: 'PlexMovies',
      accentColor: '#E5A00D',
      textAccent: 'text-[#E5A00D]',
      bgAccent: 'bg-[#E5A00D]',
      borderAccent: 'border-[#E5A00D]',
      hoverTextAccent: 'hover:text-[#E5A00D]',
      hoverBgAccent: 'hover:bg-[#E5A00D]',
      hoverBorderAccent: 'hover:border-[#E5A00D]',
      fillAccent: 'fill-[#E5A00D]',
      shadowAccent: 'shadow-[#E5A00D]/50',
      focusRingAccent: 'focus:ring-[#E5A00D]',
      loaderBorderColor: 'border-[#E5A00D]',
      badgeBg: 'bg-[#E5A00D]/10 text-[#E5A00D] border-[#E5A00D]/30',
    };
  } else if (hostname.includes('hexa')) {
    return {
      name: 'Hexa Watch',
      accentColor: '#4f46e5',
      textAccent: 'text-[#4f46e5]',
      bgAccent: 'bg-[#4f46e5]',
      borderAccent: 'border-[#4f46e5]',
      hoverTextAccent: 'hover:text-[#4f46e5]',
      hoverBgAccent: 'hover:bg-[#4f46e5]',
      hoverBorderAccent: 'hover:border-[#4f46e5]',
      fillAccent: 'fill-[#4f46e5]',
      shadowAccent: 'shadow-[#4f46e5]/50',
      focusRingAccent: 'focus:ring-[#4f46e5]',
      loaderBorderColor: 'border-[#4f46e5]',
      badgeBg: 'bg-[#4f46e5]/10 text-[#4f46e5] border-[#4f46e5]/30',
    };
  } else if (hostname.includes('flixer')) {
    return {
      name: 'Flixer',
      accentColor: '#ef4444',
      textAccent: 'text-[#ef4444]',
      bgAccent: 'bg-[#ef4444]',
      borderAccent: 'border-[#ef4444]',
      hoverTextAccent: 'hover:text-[#ef4444]',
      hoverBgAccent: 'hover:bg-[#ef4444]',
      hoverBorderAccent: 'hover:border-[#ef4444]',
      fillAccent: 'fill-[#ef4444]',
      shadowAccent: 'shadow-[#ef4444]/50',
      focusRingAccent: 'focus:ring-[#ef4444]',
      loaderBorderColor: 'border-[#ef4444]',
      badgeBg: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30',
    };
  } else {
    return {
      name: 'CinemaOS',
      accentColor: '#e11d48',
      textAccent: 'text-[#e11d48]',
      bgAccent: 'bg-[#e11d48]',
      borderAccent: 'border-[#e11d48]',
      hoverTextAccent: 'hover:text-[#e11d48]',
      hoverBgAccent: 'hover:bg-[#e11d48]',
      hoverBorderAccent: 'hover:border-[#e11d48]',
      fillAccent: 'fill-[#e11d48]',
      shadowAccent: 'shadow-[#e11d48]/50',
      focusRingAccent: 'focus:ring-[#e11d48]',
      loaderBorderColor: 'border-[#e11d48]',
      badgeBg: 'bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/30',
    };
  }
}

export function useBrand() {
  const [brand, setBrand] = useState<BrandConfig>(() => {
    if (typeof window !== 'undefined') {
      return getBrandConfig(window.location.hostname);
    }
    return {
      name: 'CinemaOS',
      accentColor: '#e11d48',
      textAccent: 'text-[#e11d48]',
      bgAccent: 'bg-[#e11d48]',
      borderAccent: 'border-[#e11d48]',
      hoverTextAccent: 'hover:text-[#e11d48]',
      hoverBgAccent: 'hover:bg-[#e11d48]',
      hoverBorderAccent: 'hover:border-[#e11d48]',
      fillAccent: 'fill-[#e11d48]',
      shadowAccent: 'shadow-[#e11d48]/50',
      focusRingAccent: 'focus:ring-[#e11d48]',
      loaderBorderColor: 'border-[#e11d48]',
      badgeBg: 'bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/30',
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrand(getBrandConfig(window.location.hostname));
    }
  }, []);

  return brand;
}
