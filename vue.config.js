process.env.VUE_APP_VERSION = require("./package.json").version;

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// `npm run serve:mock` draait zonder backend: de mockserver vervangt de proxy
const useMock = process.env.VUE_APP_MOCK === "true";
// Altijd een waarde meegeven, zodat webpack de mockcode in main.js
// wegfiltert uit een gewone build
process.env.VUE_APP_MOCK = useMock ? "true" : "false";

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
        // PrimeVue-thema's als losse bestanden, zodat ThemaService ze kan wisselen
        ...["saga-blue", "arya-green"].map((thema) => ({
          from: path.resolve(
            __dirname,
            `node_modules/primevue/resources/themes/${thema}/theme.css`
          ),
          to: `themes/${thema}/theme.css`,
        })),
      ]),
    ],
  },
};
