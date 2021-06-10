export default function getClient() {
  let returnClient = {
    url: "https://login-dev.scoutsengidsenvlaanderen.be/auth",
    realm: "scouts",
    clientId: null,
    onLoad: "login-required",
    redirectUri: window.location.href,
  };

  switch (window.location.origin) {
    case "http://localhost:8000":
      returnClient.clientId = "groepsadmin-localhost-8000-client";
      break;
    case "http://localhost:3000":
      returnClient.clientId = "groepsadmin-localhost-3000-client";
      break;
    case "https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be":
      returnClient.clientId = "groepsadmin-dev-tvl-client";
      break;
    case "https://ga-dev-tvl.scoutsengidsenvlaanderen.be":
      returnClient.clientId = "ga-dev-tvl-client";
      break;
    case "https://groepsadmin-develop.scoutsengidsenvlaanderen.net":
      returnClient.clientId = "groepsadmin-staging-client";
      break;
    case "https://ga-staging.scoutsengidsenvlaanderen.be":
      returnClient.clientId = "ga-staging-client";
      break;
    case "https://groepsadmin.scoutsengidsenvlaanderen.be":
      returnClient.url = "https://login.scoutsengidsenvlaanderen.be/auth";
      returnClient.clientId = "groepsadmin-production-client";
      break;
    case "https://ga-production.scoutsengidsenvlaanderen.be":
      returnClient.url = "https://login.scoutsengidsenvlaanderen.be/auth";
      returnClient.clientId = "ga-production-client";
      break;
  }
  return returnClient;
}
