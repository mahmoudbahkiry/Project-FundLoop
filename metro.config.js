const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// Firebase/Expo SDK 53 workaround metro.config.js
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

return config;
})();