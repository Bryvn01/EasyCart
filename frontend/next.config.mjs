import { withBundleAnalyzer } from '@next/bundle-analyzer';
import nextConfig from './next.config.js';

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
