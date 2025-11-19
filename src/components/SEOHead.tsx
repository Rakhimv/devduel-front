import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  noindex = false,
}) => {
  const baseTitle = 'DevDuel - Соревнуйся в программировании с другими разработчиками';
  const baseDescription = 'DevDuel - платформа для соревнований по программированию. Решай задачи на время, повышай уровень, общайся с другими разработчиками в реальном времени.';
  const baseUrl = 'https://devduel.ru';
  const defaultImage = `${baseUrl}/icon.png`;

  useEffect(() => {
    if (title) {
      document.title = `${title} | DevDuel`;
    }

    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    if (title) {
      updateMetaTag('title', title);
    }
    if (description) {
      updateMetaTag('description', description);
    }
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (title) {
      updateMetaTag('og:title', title, true);
    }
    if (description) {
      updateMetaTag('og:description', description, true);
    }
    updateMetaTag('og:image', ogImage || defaultImage, true);
    updateMetaTag('og:url', ogUrl || window.location.href, true);

    if (title) {
      updateMetaTag('twitter:title', title);
    }
    if (description) {
      updateMetaTag('twitter:description', description);
    }
    updateMetaTag('twitter:image', ogImage || defaultImage);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', ogUrl || window.location.href);

    return () => {
    };
  }, [title, description, keywords, ogImage, ogUrl, noindex, defaultImage]);

  return null;
};

