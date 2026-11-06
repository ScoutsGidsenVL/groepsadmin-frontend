/*
 * Mockserver voor lokale ontwikkeling zonder backend en zonder Keycloak.
 * Start met `npm run serve:mock`. vue.config.js koppelt deze router aan de
 * webpack-dev-server in plaats van de proxy naar localhost:8080.
 *
 * Elke file in ./routes exporteert `function (router, db)` en registreert
 * Express-handlers relatief ten opzichte van /groepsadmin/rest-ga.
 * De data leeft in het geheugen: een herstart van de devserver zet alles terug.
 */
const express = require("express");
const fs = require("fs");
const path = require("path");

const BASE = "/groepsadmin/rest-ga";

module.exports = function registerMock(app) {
  const router = express.Router();
  router.use(express.json({ limit: "5mb" }));
  router.use(express.urlencoded({ extended: true }));

  // Kleine vertraging zodat laadindicatoren zichtbaar blijven
  router.use((req, res, next) => setTimeout(next, 150));

  const db = {};
  const routesDir = path.join(__dirname, "routes");
  fs.readdirSync(routesDir)
    .filter((f) => f.endsWith(".js"))
    // lid.js als laatste: `/lid/:id` mag `/lid/aanvraag` niet wegvangen
    .sort((a, b) => (a === "lid.js") - (b === "lid.js") || a.localeCompare(b))
    .forEach((f) => {
      // Cache leegmaken zodat een herstart wijzigingen oppikt
      delete require.cache[require.resolve(path.join(routesDir, f))];
      require(path.join(routesDir, f))(router, db);
    });

  // Alles wat niet gemockt is: loggen en een lege maar geldige respons geven
  router.all("*", (req, res) => {
    console.warn(`[mock] niet gemockt: ${req.method} ${BASE}${req.path}`);
    if (req.method === "GET") {
      res.json({});
    } else {
      res.json(req.body || {});
    }
  });

  app.use(BASE, router);
  console.log(`[mock] mockserver actief op ${BASE}`);
};
