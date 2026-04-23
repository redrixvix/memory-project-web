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
    sitemap: 'https://web-redrixvixs-projects.vercel.app/sitemap.xml',
  };
}
