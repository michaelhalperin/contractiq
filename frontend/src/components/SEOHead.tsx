import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = 'ContractIQ - AI Contract Analyzer | Understand Contracts in 60 Seconds',
  description = 'AI-powered contract analysis platform. Upload PDF or DOCX contracts and get instant analysis, risk detection, and plain English explanations. No lawyer needed.',
  keywords = 'contract analysis, AI contract review, legal document analysis, contract risk detection, contract summary, legal AI, contract analyzer, document analysis',
  image = 'https://contractiq-ivory.vercel.app/og-image.png',
  url = 'https://contractiq-ivory.vercel.app',
  type = 'website',
}: SEOHeadProps) => {
  const fullTitle = title.includes('ContractIQ') ? title : `${title} | ContractIQ`;
  const fullUrl = url.startsWith('http') ? url : `https://contractiq-ivory.vercel.app${url}`;

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

    // Update or create meta tags
    updateMetaTag('title', fullTitle);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [fullTitle, description, keywords, image, fullUrl, type]);

  return null;
};

export default SEOHead;

