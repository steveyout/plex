import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isPlex = hostname.includes('plexmovies');
    const isHexa = hostname.includes('hexa');
    const isCinema = hostname.includes('cinemaos') || (!isPlex && !isHexa);
    
    let siteName = 'CinemaOS';
    let defaultDesc = 'Experience the future of entertainment with CinemaOS. Stream high-definition movies, original series, and customize your personal media dashboard.';
    let themeColor = '#e11d48';
    
    if (isPlex) {
      siteName = 'PlexMovies';
      defaultDesc = 'Watch free movies, TV series, and live streaming streams in premium HD quality on PlexMovies. Your ultimate free media server library.';
      themeColor = '#E5A00D';
    } else if (isHexa) {
      siteName = 'HexaVideo';
      defaultDesc = 'Step into the next generation of cinematic media with HexaVideo. Watch premium films, high-fidelity streams, and customize your ultra-modern immersive playback terminal.';
      themeColor = '#4f46e5';
    } else {
      siteName = 'CinemaOS';
      defaultDesc = 'Experience the future of entertainment with CinemaOS. Stream high-definition movies, original series, and customize your personal media dashboard.';
      themeColor = '#e11d48';
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
      : isHexa
      ? 'hexavideo, hexa video, video streaming, futuristic media player, premium cinema, next-gen streams, ai video hub'
      : 'cinemaos, cinema os, entertainment system, streaming media, cinematic dashboard, watch free movies, premium tv shows';
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
