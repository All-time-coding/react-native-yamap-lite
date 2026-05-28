// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const SINGLETONS = ['react', 'react-native'];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = (async () => {
  const { withMetroConfig } = await import('react-native-monorepo-config');
  const config = withMetroConfig(getDefaultConfig(projectRoot), {
    root: workspaceRoot,
    dirname: projectRoot,
  });

  const upstreamResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    for (const name of SINGLETONS) {
      if (moduleName === name || moduleName.startsWith(`${name}/`)) {
        try {
          return {
            type: 'sourceFile',
            filePath: require.resolve(moduleName, { paths: [projectRoot] }),
          };
        } catch {
          // fall through to default resolution
        }
      }
    }

    if (upstreamResolveRequest) {
      return upstreamResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
})();
