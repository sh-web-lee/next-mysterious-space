/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  sassOptions: {
    includePaths: ["./src/assets/styles"],
  },
  webpack(config) {
    // Import GLSL/vert/frag shaders as raw strings (matching vite-plugin-glsl behavior)
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
