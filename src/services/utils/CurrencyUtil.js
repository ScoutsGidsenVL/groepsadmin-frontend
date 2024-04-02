export default {
    formateerBedrag(value) {
        return value.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'});
    }
}
