
import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saahbusiness.com';
  
  // Get all products
  const products = await getProducts();
  const productEntries: MetadataRoute.Sitemap = products.map(({ id, createdAt }) => ({
    url: `${siteUrl}/products/${id}`,
    lastModified: new Date(createdAt).toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Static pages
  const routes = ['', '/products', '/import', '/support', '/cart'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : (route === '/products' ? 0.9 : 0.7),
  }));

  return [...routes, ...productEntries];
}
