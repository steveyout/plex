import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    // Dynamic tab-based state or media item selection updates browser headers transparently
    document.title = `${title} | Plex Stream`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || 'Stream high-quality movies and TV shows for free on Plex Stream, the ultimate web media portal.');
  }, [title, description]);
}
