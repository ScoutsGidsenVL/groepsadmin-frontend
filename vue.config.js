process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
  devServer: {
    port: 3000,
    proxy: "http://localhost:9090",
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? '/groepsadmin/frontend/'
      : '/'
};
