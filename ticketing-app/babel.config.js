module.exports = function (api) {
  api.cache.never();
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        test: (fileName) => fileName.includes('ethers'),
        plugins: [[require('@babel/plugin-transform-private-methods'), { loose: true }]],
      },
    ],
  };
};
