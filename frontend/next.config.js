/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    images: {
        // Prefer remotePatterns for finer control (replaces deprecated `images.domains`)
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: 'placehold.co' },
            { protocol: 'https', hostname: 'cdn.pixabay.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'unsplash.com' }
        ]
    },


    // Explicitly set Turbopack root to this frontend project directory
    // This avoids Turbopack scanning parent lockfiles in monorepos
    turbopack: {
        root: __dirname
    }
}

module.exports = nextConfig
