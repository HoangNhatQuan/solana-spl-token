const {
  CracoAppLessPlugin,
  CracoCompatibility,
  CracoSilence,
} = require('@sentre/craco-plugins')

module.exports = {
  plugins: [
    {
      plugin: CracoAppLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
    {
      plugin: CracoCompatibility,
    },
    {
      plugin: CracoSilence,
    },
  ],
}
