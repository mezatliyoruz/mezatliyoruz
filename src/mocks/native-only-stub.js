// Web stubs for native-only modules
// This file is returned by Metro when native-only packages
// are imported on the web platform.

function noop() { return null; }
function asyncNoop() { return Promise.resolve(null); }

const proxyHandler = {
  get: (_, prop) => {
    if (prop === '__esModule') return true;
    if (prop === 'default') return new Proxy({}, proxyHandler);
    // Return async no-op for any function call
    return new Proxy(asyncNoop, proxyHandler);
  },
  apply: () => Promise.resolve(null),
};

module.exports = new Proxy({}, proxyHandler);
