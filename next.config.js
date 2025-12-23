/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow images from common book/TV metadata sources
    domains: [
      'image.tmdb.org',
      'books.google.com',
      'covers.openlibrary.org',
      'm.media-amazon.com'
    ],
  },
}

module.exports = nextConfig
