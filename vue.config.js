process.env.VUE_APP_VERSION = require("./package.json").version;

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// `npm run serve:mock` draait zonder backend: de mockserver vervangt de proxy
const useMock = process.env.VUE_APP_MOCK === "true";

module.exports = {
  transpileDependencies: ["keycloak-js"],
  devServer: {
    port: 3000,
    ...(useMock
      ? { before: require("./mock/server") }
      : { proxy: "http://localhost:8080" }),
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
