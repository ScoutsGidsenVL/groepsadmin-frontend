export default function ApiConfig() {
    let apiHost;
    if (window.location.protocol === "https:") {
        apiHost = window.location.origin;
    } else {
        apiHost = '';
        // Alternatief als de groepsadmin lokaal draait:
        //apiHost = 'http://localhost:8080';
    }
    return {
        host: apiHost
    }
}