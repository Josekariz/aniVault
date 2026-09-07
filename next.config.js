/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // AniList CDN for coverImage / bannerImage (e.g. …/file/anilistcdn/media/anime/…)
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/**",
      },
      // Occasional short/CDN alias used by some AniList media URLs
      {
        protocol: "https",
        hostname: "img.anili.st",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
