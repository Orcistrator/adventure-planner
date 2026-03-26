import nextConfig from 'eslint-config-next';

const eslintConfig = [
  { ignores: ['.next/**', 'convex/_generated/**', 'next-env.d.ts'] },
  ...nextConfig,
];

export default eslintConfig;
