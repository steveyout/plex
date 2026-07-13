import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isPlex = hostname.includes('plexmovies');
    const isCinema = hostname.includes('cinemaos');
    
    let siteName = 'CinemaOS';
    let defaultDesc = 'Experience the future of entertainment with CinemaOS. Stream high-definition movies, original series, and customize your personal media dashboard.';
    
    if (isPlex) {
      siteName = 'PlexMovies';
      defaultDesc = 'Watch free movies, TV series, and live streaming streams in premium HD quality on PlexMovies. Your ultimate free media server library.';
    } else if (isCinema) {
      siteName = 'CinemaOS';
      defaultDesc = 'Experience the future of entertainment with CinemaOS. Stream high-definition movies, original series, and customize your personal media dashboard.';
    }

    // Set page title
    document.title = `${title} | ${siteName}`;
    
    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || defaultDesc);

    // Set keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    const keywords = isPlex 
      ? 'plexmovies, plex movies, free movies, watch tv series, free streaming, hd movies, media server'
      : 'cinemaos, cinema os, entertainment system, streaming media, cinematic dashboard, watch free movies, premium tv shows';
    metaKeywords.setAttribute('content', keywords);

    // Set theme-color meta tag dynamically to match the branding
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', isPlex ? '#E5A00D' : '#e11d48');
  }, [title, description]);
}
