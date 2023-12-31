'use strict';

const os = require('os');
const fetch = require('node-fetch');
const isInChina = require('@serverless/utils/is-in-china');

const platform = (() => {
  switch (process.platform) {
    case 'darwin':
      return 'macos';
    default:
      return process.platform;
  }
})();
const arch = (() => {
  switch (process.arch) {
    case 'x32':
      return 'x86';
    case 'arm':
      return 'armv6';
    case 'arm64':
      if (process.platform === 'darwin') {
        // Handle case of M1 Macs that are using x64 binary via Rosetta
        return 'x64';
      }
      return 'armv6';
    default:
      return process.arch;
  }
})();

module.exports = {
  resolveLatestTag: async () => {
    const response = await fetch(
      isInChina
        ? 'https://sls-standalone-sv-1300963013.cos.na-siliconvalley.myqcloud.com/latest-tag'
        : 'https://api.github.com/repos/serverless/serverless/releases/latest'
    );
    if (isInChina) {
      return await response.text();
    }
    const data = await response.json();
    return data.tag_name;
  },
  resolveUrl: (tagName) => {
    return isInChina
      ? `https://sls-standalone-sv-1300963013.cos.na-siliconvalley.myqcloud.com/${tagName}/` +
          `serverless-${platform}-${arch}`
      : `https://github.com/serverless/serverless/releases/download/${tagName}/` +
          `serverless-${platform}-${arch}`;
  },
  path: `${os.homedir()}/.serverless/bin/serverless`,
};
