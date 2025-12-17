import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object | object[];
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const SEOHead = ({
  title = 'ContractIQ - AI Contract Analyzer | Understand Contracts in 60 Seconds',
  description = 'AI-powered contract analysis platform. Upload PDF or DOCX contracts and get instant analysis, risk detection, and plain English explanations. No lawyer needed.',
  keywords = 'contract analysis, AI contract review, legal document analysis, contract risk detection, contract summary, legal AI, contract analyzer, document analysis',
  image = 'https://contractiq-ivory.vercel.app/og-image.png',
  url = 'https://contractiq-ivory.vercel.app',
  type = 'website',
  structuredData,
  noindex = false,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOHeadProps) => {
  const fullTitle = title.includes('ContractIQ') ? title : `${title} | ContractIQ`;
  const fullUrl = url.startsWith('http') ? url : `https://contractiq-ivory.vercel.app${url}`;
  const siteName = 'ContractIQ';

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('title', fullTitle);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Robots
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Author
    if (author) {
      updateMetaTag('author', author);
    }
    
    // Language
    updateMetaTag('language', 'English');
    updateMetaTag('content-language', 'en');
    
    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', fullTitle, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', 'en_US', true);
    
    if (publishedTime) {
      updateMetaTag('og:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      updateMetaTag('og:updated_time', modifiedTime, true);
    }
    if (section) {
      updateMetaTag('article:section', section, true);
    }
    if (tags.length > 0) {
      tags.forEach((tag) => {
        updateMetaTag(`article:tag`, tag, true);
      });
    }
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:image:alt', fullTitle, true);
    updateMetaTag('twitter:site', '@ContractIQ', true);
    updateMetaTag('twitter:creator', '@ContractIQ', true);
    
    // Additional SEO tags
    updateMetaTag('theme-color', '#6366f1');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMetaTag('apple-mobile-web-app-title', siteName);
    updateMetaTag('application-name', siteName);
    updateMetaTag('msapplication-TileColor', '#6366f1');
    updateMetaTag('msapplication-config', '/browserconfig.xml');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
    
    // Add alternate language links if needed
    let alternate = document.querySelector('link[rel="alternate"][hreflang="en"]') as HTMLLinkElement;
    if (!alternate) {
      alternate = document.createElement('link');
      alternate.setAttribute('rel', 'alternate');
      alternate.setAttribute('hreflang', 'en');
      document.head.appendChild(alternate);
    }
    alternate.setAttribute('href', fullUrl);

    // Add structured data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => {
        // Only remove our structured data, not others
        const content = script.textContent || '';
        if (content.includes('ContractIQ') || content.includes('@context')) {
          script.remove();
        }
      });

      // Add new structured data
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `structured-data-${index}`;
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
      });
    }
  }, [fullTitle, description, keywords, image, fullUrl, type, structuredData, noindex, author, publishedTime, modifiedTime, section, tags]);

  return null;
};

export default SEOHead;

