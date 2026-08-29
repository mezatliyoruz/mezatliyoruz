const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Stub file for native-only modules that can't run in the browser
const nativeOnlyStub = path.resolve(__dirname, 'src/mocks/native-only-stub.js');

// List of native-only modules to stub out on web
const WEB_NATIVE_STUBS = [
  'react-native-compressor',
  'expo-local-authentication',
];

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web platform, redirect native-only modules to the stub
  if (platform === 'web' && WEB_NATIVE_STUBS.includes(moduleName)) {
    return {
      type: 'sourceFile',
      filePath: nativeOnlyStub,
    };
  }

  // Fall through to default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
