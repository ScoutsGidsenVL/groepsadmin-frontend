let _ = require('lodash');

export default {
    sortedKeys(obj) {
        return _.sortBy(Object.keys(obj), [function (key) {
            if (/^[0-9]+$/.test(key)) {
                return Number(key);
            } else {
                return key.replace('Nu', '9999');
            }
        }]);
    },

    sortedValues(obj) {
        return _.map(this.sortedKeys(obj), function (key) {
            return obj[key];
        });
    },

    sortedNegativeValues(obj) {
        return _.map(this.sortedKeys(obj), function (key) {
            return -obj[key];
        });
    },

    eigenschappen(obj) {

        let chartColors = [
            {
                background: "rgba(76, 83, 236, 1)",
                border: "rgba(76, 83, 236, 0.59)"
            },
            {
                background: "rgb(255,0,0)",
                border: "rgba(212, 94, 94, 0.59)"
            },
        ];

        let result = [];
        let backgroundColors = [];
        let borderColors = [];
        let data = {
            labels: [],
            datasets: []
        };

        _.forEach(this.sortedKeys(obj), function (key, index) {
            result.push(obj[key]);
            data.labels.push(key);
            if (index < 5) {
                backgroundColors.push(chartColors[0].background);
                borderColors.push(chartColors[0].border);
            } else {
                backgroundColors.push(chartColors[1].background);
                borderColors.push(chartColors[1].border);
            }
        });

        data.datasets.push({ data: result, backgroundColor: backgroundColors, borderColor: borderColors });
        return {
            data,
            options: this.getGlobalOptiesZonderTitel()
        };
    },

    getGlobalOptiesZonderTitel() {
        return {
            maintainAspectRatio: true,
            responsive: true,
            title: {
                display: true,
            },
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        };
    },

    getGlobalOpties() {
        return {
            maintainAspectRatio: true,
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    fontSize: 20,
                    padding: 20
                },
                legend: {
                    display: true,
                    position: "bottom",
                    padding: 20
                },
            },
            scales: {
                x: {
                    display: true
                },
                y: {
                    display: true
                }
            }
        };
    },

    getLedenaantalPerLeeftijd(ledenaantallenData) {
        // kleuren bepalen
        let chartColors = [
            {
                background: "rgba(232, 232, 96, 1)",
                border: "rgba(232, 232, 96, 0.62)"
            },
            {
                background: "rgba(141, 221, 119, 1)",
                border: "rgba(141, 221, 119, 0.62)"
            },
            {
                background: "rgba(236, 148, 76, 1)",
                border: "rgba(236, 148, 76, 0.59)"
            },
            {
                background: "rgba(76, 83, 236, 1)",
                border: "rgba(76, 83, 236, 0.59)"
            },
            {
                background: "rgba(212, 94, 94, 1)",
                border: "rgba(212, 94, 94, 0.59)"
            },
            {
                background: "rgba(120, 97, 218, 1)",
                border: "rgba(120, 97, 218, 0.59)"
            },
            {
                background: "rgb(0,159,177)",
                border: "rgb(0,219,248)"
            }
        ];

        let alleJaren = [];
        _.forEach(ledenaantallenData.ledenPerLeeftijd, function (value) {
            alleJaren = _.concat(alleJaren, Object.keys(value));
        });
        let alleJarenUniek = _.uniq(alleJaren);
        alleJarenUniek.sort();
        alleJarenUniek.reverse(); // Jongste leden (met hoogste geboortejaar) eerst

        let data = {
            labels: alleJarenUniek,
            datasets: [
                {

            }]
        };
        _.forEach(this.sortedKeys(ledenaantallenData.ledenPerLeeftijd), function (keySoort, index) {
            console.log(keySoort)
            let values = _.fill(new Array(alleJarenUniek.length), 0);
            _.forEach(ledenaantallenData.ledenPerLeeftijd[keySoort], function (valueAantal, keyJaar) {
                values[alleJarenUniek.indexOf(keyJaar)] = valueAantal;
            });
            data.datasets.push({
                label: ({
                    '10': 'Leiding',
                    '20': 'Jins',
                    '30': 'Gidsen/Verkenners',
                    '40': 'Jongidsen/Jongverkenners',
                    '50': 'Kabouters/Welpen',
                    '60': 'Kapoenen',
                    '70': 'Akabe'
                })[keySoort],
                backgroundColor: chartColors[index].background,
                borderColor: chartColors[index].border,
                data: values
            });
        });

        data.datasets = data.datasets.filter((el) => {
            return el.data !== undefined;
        })
        data.datasets.reverse();// Jongste leden eerst

        //grafiek opties aanpassen naar de eigenschappen van dit type
        let grafiekOpties = this.getGlobalOpties();
        grafiekOpties.plugins.title.text = "Ledenaantal per leeftijd";
        grafiekOpties.scales = {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        };

        return {
            data: data,
            options: grafiekOpties
        };
    },

    getGroepsevolutie(ledenaantallenData) {
        let chartColors = [
            {
                border: "rgba(232, 232, 96, 1)",
                background: "rgba(232, 232, 96, 0.62)"
            },
            {
                border: "rgba(141, 221, 119, 1)",
                background: "rgba(141, 221, 119, 0.62)"
            },
            {
                border: "rgba(236, 148, 76, 1)",
                background: "rgba(236, 148, 76, 0.59)"
            },
            {
                border: "rgba(76, 83, 236, 1)",
                background: "rgba(76, 83, 236, 0.59)"
            },
            {
                border: "rgba(212, 94, 94, 1)",
                background: "rgba(212, 94, 94, 0.59)"
            },
            {
                border: "rgba(120, 97, 218, 1)",
                background: "rgba(120, 97, 218, 0.59)"
            }
        ];

        let data = {
            labels: this.sortedKeys(ledenaantallenData.groepsevolutie[0].aantalPersonen),
            datasets: []
        };

        let grafiekOpties = this.getGlobalOpties();
        grafiekOpties.plugins.title.text = "Groepsevolutie";
        grafiekOpties.scales.x.display = true;
        grafiekOpties.scales.y.display = true;

        ledenaantallenData.groepsevolutie.forEach((value, index) => {
            data.datasets.push({
                label: value.naam,
                fill: false,
                lineTension: 0,
                backgroundColor: chartColors[index].background,
                borderColor: chartColors[index].border,
                pointBackgroundColor: chartColors[index].border,
                pointBorderColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: chartColors[index].border,
                pointHoverBorderWidth: 1,
                pointRadius: 4,
                pointHitRadius: 10,
                data: this.sortedValues(value.aantalPersonen),
            });
        });

        return {
            data: data,
            options: grafiekOpties
        }
    },

    tekenHuidigeLeidingsErvaring(ledenaantallenData) {
        let chartHoverColors = ["rgba(232, 232, 96, 0.62)", "rgba(141, 221, 119, 0.62)", "rgba(236, 148, 76, 0.59)", "rgba(76, 83, 236, 0.59)", "rgba(212, 94, 94, 0.59)", "rgba(120, 97, 218, 0.59)"];
        let chartColors = [
            "rgba(232, 232, 96, 1)",
            "rgba(141, 221, 119, 1)",
            "rgba(236, 148, 76, 1)",
            "rgba(76, 83, 236, 1)",
            "rgba(212, 94, 94, 1)",
            "rgba(120, 97, 218, 1)",
            "rgba(232, 232, 96, 1)",
            "rgba(141, 221, 119, 1)",
            "rgba(236, 148, 76, 1)",
            "rgba(76, 83, 236, 1)",
            "rgba(212, 94, 94, 1)",
            "rgba(120, 97, 218, 1)"
        ];

        let data = {
            labels: this.sortedKeys(ledenaantallenData.leidingservaring).map(function (jaar) {
                return jaar + ' jaar';
            }),
            datasets: [{
                data: this.sortedValues(ledenaantallenData.leidingservaring),
                backgroundColor: chartColors,
                hoverBackgroundColor: chartHoverColors
            }]
        };

        let grafiekOpties = this.getGlobalOpties();
        grafiekOpties.plugins.title.text = "Leidingservaring";
        grafiekOpties.scales.x.display = false;
        grafiekOpties.scales.y.display = false;

        let animation = {animateScale: true};
        return {
            data: data,
            animation: animation,
            options: grafiekOpties
        };
    },

    tekenInEnUitstroom(ledenaantallenData) {
        // kleuren bepalen
        let chartColors = [
            {
                background: "rgba(232, 232, 96, 1)",
                border: "rgba(232, 232, 96, 0.62)"
            },
            {
                background: "rgba(141, 221, 119, 1)",
                border: "rgba(141, 221, 119, 0.62)"
            },
            {
                background: "rgba(236, 148, 76, 1)",
                border: "rgba(236, 148, 76, 0.59)"
            },
            {
                background: "rgba(76, 83, 236, 1)",
                border: "rgba(76, 83, 236, 0.59)"
            },
            {
                background: "rgba(212, 94, 94, 1)",
                border: "rgba(212, 94, 94, 0.59)"
            },
            {
                background: "rgba(120, 97, 218, 1)",
                border: "rgba(120, 97, 218, 0.59)"
            }
        ];

        let data = {
            labels: this.sortedKeys(ledenaantallenData.uitstroom[0].aantalPerLeeftijd),
            datasets: []
        };
        ledenaantallenData.uitstroom.forEach((value, index) => {
            data.datasets.push({
                label: "Uit: " + value.werkjaar,
                backgroundColor: chartColors[index % 6].background,
                borderColor: chartColors[(index + 2 * Math.round(index / 6)) % 6].border,
                data: this.sortedNegativeValues(value.aantalPerLeeftijd)
            });
        });

        ledenaantallenData.instroom.forEach((value, index) => {
            data.datasets.push({
                label: "In: " + value.werkjaar,
                backgroundColor: chartColors[index % 6].background,
                borderColor: chartColors[(index + 2 * Math.round(index / 6)) % 6].border,
                data: this.sortedValues(value.aantalPerLeeftijd)
            });
        });

        data.datasets = _.sortBy(data.datasets, 'label');

        //grafiek opties aanpassen naar de eigenschappen van dit type
        let grafiekOpties = this.getGlobalOpties();
        grafiekOpties.plugins.title.text = "In- en uitstroom per leeftijd";
        grafiekOpties.scales = {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        };

        // Grafiek aanmaken
        return {
            data: data,
            options: grafiekOpties
        };
    },

    tekenUitstroom(ledenaantallenData) {
        // kleuren bepalen
        let chartColors = [
            {
                background: "rgba(232, 232, 96, 1)",
                border: "rgba(232, 232, 96, 0.62)"
            },
            {
                background: "rgba(141, 221, 119, 1)",
                border: "rgba(141, 221, 119, 0.62)"
            },
            {
                background: "rgba(236, 148, 76, 1)",
                border: "rgba(236, 148, 76, 0.59)"
            },
            {
                background: "rgba(76, 83, 236, 1)",
                border: "rgba(76, 83, 236, 0.59)"
            },
            {
                background: "rgba(212, 94, 94, 1)",
                border: "rgba(212, 94, 94, 0.59)"
            },
            {
                background: "rgba(120, 97, 218, 1)",
                border: "rgba(120, 97, 218, 0.59)"
            }
        ];

        let data = {
            labels: this.sortedKeys(ledenaantallenData.uitstroom[0].aantalPerLeeftijd),
            datasets: []
        };
        ledenaantallenData.uitstroom.forEach((value, index) => {
            data.datasets.push({
                label: "Uit: " + value.werkjaar,
                backgroundColor: chartColors[index % 6].background,
                borderColor: chartColors[(index + 2 * Math.round(index / 6)) % 6].border,
                data: this.sortedNegativeValues(value.aantalPerLeeftijd)
            });
        });

        data.datasets = _.sortBy(data.datasets, 'label');

        //grafiek opties aanpassen naar de eigenschappen van dit type
        let grafiekOpties = this.getGlobalOpties();
        grafiekOpties.plugins.title.text = "Uitstroom per leeftijd";
        grafiekOpties.scales = {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        };

        // Grafiek aanmaken
        return {
            data: data,
            options: grafiekOpties
        };
    },

    tekenInstroom(ledenaantallenData) {
        // kleuren bepalen
        let chartColors = [
            {
                background: "rgba(232, 232, 96, 1)",
                border: "rgba(232, 232, 96, 0.62)"
            },
            {
                background: "rgba(141, 221, 119, 1)",
                border: "rgba(141, 221, 119, 0.62)"
            },
            {
                background: "rgba(236, 148, 76, 1)",
                border: "rgba(236, 148, 76, 0.59)"
            },
            {
                background: "rgba(76, 83, 236, 1)",
                border: "rgba(76, 83, 236, 0.59)"
            },
            {
                background: "rgba(212, 94, 94, 1)",
                border: "rgba(212, 94, 94, 0.59)"
            },
            {
                background: "rgba(120, 97, 218, 1)",
                border: "rgba(120, 97, 218, 0.59)"
            }
        ];

        let data = {
            labels: this.sortedKeys(ledenaantallenData.uitstroom[0].aantalPerLeeftijd),
            datasets: []
        };

        ledenaantallenData.instroom.forEach((value, index) => {
            data.datasets.push({
                label: "In: " + value.werkjaar,
                backgroundColor: chartColors[index % 6].background,
                borderColor: chartColors[(index + 2 * Math.round(index / 6)) % 6].border,
                data: this.sortedValues(value.aantalPerLeeftijd)
            });
        });

        data.datasets = _.sortBy(data.datasets, 'label');

        //grafiek opties aanpassen naar de eigenschappen van dit type
        let grafiekOpties = this.getGlobalOpties();
        grafiekOpties.plugins.title.text = "Instroom per leeftijd";
        grafiekOpties.scales = {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        };

        // Grafiek aanmaken
        return {
            data: data,
            options: grafiekOpties
        };
    },
}