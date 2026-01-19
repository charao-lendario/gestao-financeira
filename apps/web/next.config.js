/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@gestao-financeira/shared'],
};

module.exports = nextConfig;
