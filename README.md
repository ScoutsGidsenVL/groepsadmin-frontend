# groepsadmin-frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

De devserver draait op http://localhost:3000 en stuurt API-calls door naar een backend op http://localhost:8080.

### Lokaal draaien zonder backend (mockmodus)
```
npm run serve:mock
```
Open http://localhost:3000/groepsadmin/frontend/dashboard. De app slaat de Keycloak-login over en logt je in als "Robin Mock", groepsleiding (VGA) van de nepgroep X9999G. Een mockserver in `mock/` vervangt de backend en levert nepdata voor de hoofdschermen: ledenlijst, leden, steekkaart, groep, ledenaantallen, aanvragen, activiteiten, mail en etiketten.

- De data leeft in het geheugen. Herstart je de devserver, dan staat alles terug zoals bij de start.
- Een tweede groep, X9999M, is alleen leesbaar. Zo zie je ook uitgeschakelde velden.
- Roept de app een endpoint aan dat niet gemockt is, dan krijgt ze een lege respons en zie je `[mock] niet gemockt: ...` in de terminal. Voeg zo'n endpoint toe in het passende bestand in `mock/routes/`.
- Gedeelde id's (groepen, functies, leden) staan in `mock/shared.js`.
- Straten zoeken (`geo.api.vlaanderen.be`) en Google Maps blijven externe diensten en werken alleen online.

De nepdata volgt uit hoe de frontend de antwoorden leest, niet uit de echte backend. Veldnamen kunnen dus afwijken. Test wijzigingen aan de data altijd ook tegen een echte backend.

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
