const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves React (and related packages) from the mobile workspace
config.resolver.nodeModulesPaths = [
  path.join(__dirname, 'node_modules'),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.join(__dirname, 'node_modules/react'),
  'react-dom': path.join(__dirname, 'node_modules/react-dom'),
  'react-native-web': path.join(__dirname, 'node_modules/react-native-web'),
};

// Watch the shared workspace so imports continue to work
config.watchFolders = [
  path.resolve(__dirname, '..', 'shared'),
];

module.exports = config;
