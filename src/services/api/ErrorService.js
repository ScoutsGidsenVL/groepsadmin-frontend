export default {

    handleError(error) {
        if (error.response.status === 403 && error.response.config.headers.Accept === "application/pdf") {
            let obj = {}
            obj.severity = 'warn';
            obj.summary = 'Niet toegestaan';
            obj.detail = "Geen leesrechten op de geselecteerde leden";
            return obj;
        }
    }
}