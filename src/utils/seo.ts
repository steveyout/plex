import { useEffect } from 'react';
import { getBrandConfig } from './brand';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const brand = getBrandConfig(window.location.hostname);
    
    // Set page title
    if (title === 'Home') {
      document.title = brand.title;
    } else {
      document.title = `${title} | ${brand.name}`;
    }
    
    const pageDesc = title === 'Home' ? brand.description : (description || brand.description);

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageDesc);

    // Meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', brand.keywords);

    // Theme color
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', brand.accentColor);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', brand.canonicalUrl);

    // OpenGraph tags
    const ogTags: Record<string, string> = {
      'og:title': title === 'Home' ? brand.title : `${title} | ${brand.name}`,
      'og:description': pageDesc,
      'og:url': brand.canonicalUrl,
      'og:site_name': brand.name,
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': title === 'Home' ? brand.title : `${title} | ${brand.name}`,
      'twitter:description': pageDesc,
    };

    Object.entries(ogTags).forEach(([prop, val]) => {
      const isProperty = prop.startsWith('og:');
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', val);
    });

    // Favicon & Apple Touch Icon
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

    // JSON-LD Structured Data
    let schemaScript = document.getElementById('brand-schema-jsonld') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'brand-schema-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: brand.name,
        alternateName: [brand.shortName, brand.domain],
        url: brand.canonicalUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${brand.canonicalUrl}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brand.name,
        url: brand.canonicalUrl,
        logo: `${brand.canonicalUrl}/favicon.svg`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: brand.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ];

    schemaScript.text = JSON.stringify(schemas);
  }, [title, description]);
}
