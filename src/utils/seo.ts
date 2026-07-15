import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isPlex = hostname.includes('plexmovies');
    const isHexa = hostname.includes('hexa');
    const isCinema = hostname.includes('cinemaos') || (!isPlex && !isHexa);
    
    let siteName = 'Cinemaos';
    let defaultDesc = 'Beautifully designed website where you can watch anime, drama, movies and read mangas for free. CinemaOS operates as a content aggregator';
    let themeColor = '#e11d48';
    
    if (isPlex) {
      siteName = 'PlexMovies';
      defaultDesc = 'Watch free movies, TV series, and live streaming streams in premium HD quality on PlexMovies. Your ultimate free media server library.';
      themeColor = '#E5A00D';
    } else if (isHexa) {
      siteName = 'Hexa Watch';
      defaultDesc = 'Watch your favorite movies and TV shows on Hexa Watch. Stream the latest releases and classic titles.';
      themeColor = '#4f46e5';
    } else {
      siteName = 'Cinemaos';
      defaultDesc = 'Beautifully designed website where you can watch anime, drama, movies and read mangas for free. CinemaOS operates as a content aggregator';
      themeColor = '#e11d48';
    }

    // Set page title
    if (title === 'Home') {
      if (isPlex) {
        document.title = 'PlexMovies - Stream Free Movies & TV Shows Online';
      } else if (isHexa) {
        document.title = 'Hexa Watch - Stream Movies & TV Shows Online';
      } else {
        document.title = 'Cinemaos - Stream Movies & TV Shows Online';
      }
    } else {
      document.title = `${title} | ${siteName}`;
    }
    
    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    // Use the specific brand description for home page to ensure it matches user request
    metaDesc.setAttribute('content', title === 'Home' ? defaultDesc : (description || defaultDesc));

    // Set keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    const keywords = isPlex 
      ? 'plexmovies, plex movies, free movies, watch tv series, free streaming, hd movies, media server, cineby, yflix, flixhq'
      : isHexa
      ? 'hexa, hexa watch, movie, series, free movies, watch tv series, free streaming, hd movies, watch series online, cinematic player, premium streams, cineby, yflix, flixhq'
      : 'cinemaos, cinema os, cineby, yflix, flixhq, anime, watch anime, read manga, watch drama, free movies, watch tv series, entertainment system, streaming media, content aggregator';
    metaKeywords.setAttribute('content', keywords);

    // Set theme-color meta tag dynamically to match the branding
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', themeColor);

    // Inject favicon dynamically
    let favLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favLink) {
      favLink = document.createElement('link');
      favLink.setAttribute('rel', 'icon');
      document.head.appendChild(favLink);
    }
    favLink.setAttribute('type', 'image/svg+xml');
    favLink.setAttribute('href', '/favicon.svg');

    let appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleLink);
    }
    appleLink.setAttribute('href', '/apple-touch-icon.png');
  }, [title, description]);
}
