process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
  devServer: {
    port: 3000,
    proxy: "http://localhost:8080",
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? '/frontend/dist'
      : '/'
};
