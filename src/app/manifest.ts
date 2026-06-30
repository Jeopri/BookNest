import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Book Inventory',
    short_name: 'BookInv',
    description: 'Book inventory management system',
    start_url: '/signin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e293b',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}
