import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/books/*/edit'],
      },
    ],
    sitemap: 'https://memoryproject.com/sitemap.xml',
  };
}
