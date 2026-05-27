process.env.VUE_APP_VERSION = require("./package.json").version;

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  transpileDependencies: ["keycloak-js"],
  devServer: {
    port: 3000,
    proxy: "http://localhost:8080",
  },
  publicPath:
    process.env.NODE_ENV === "production" ? "/groepsadmin/frontend/" : "/",
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, "node_modules/tinymce"),
          to: "js",
        },
      ]),
    ],
  },
};
