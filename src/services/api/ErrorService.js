export default {
  handleError(error) {
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.config.headers.Accept === "application/pdf"
    ) {
      let obj = {};
      obj.severity = "warn";
      obj.summary = "Niet toegestaan";
      obj.detail = "Geen leesrechten op de geselecteerde leden";
      return obj;
    }
    return {
      severity: "error",
      summary: "Ai, er liep iets fout met de Groepsadministratie.",
      detail:
        "Laat je even aan groepsadministratie@scoutsengidsenvlaanderen.be weten wat je aan het doen was?",
    };
  },
};
