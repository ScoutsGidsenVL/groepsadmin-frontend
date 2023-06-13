import store from "@/store";

let _ = require('lodash');


export default {

    groepeerFilters(filters) {
        let categorisedFilters = {
            '0000': {
                naam: 'Mijn filters',
                isHeader: true,
                filters: []
            },
            '0001': {
                naam: 'Mijn gedeelde filters',
                isHeader: true,
                filters: []
            },
            '___Z': {
                naam: 'Standaard filters',
                isHeader: true,
                filters: []
            }
        };

        filters.forEach((filter) => {
            if (filter.delen === true) {
                if (filter.gedeeldvanuit) {
                    filter.gedeeldvanuit.forEach((groep) => {
                        let filterIdArray = []
                        if (!categorisedFilters[groep]) {
                            categorisedFilters[groep] = {isHeader: true, filters: []};
                        }

                        // Voorkomen dat er dubbele filters worden getoond
                        categorisedFilters[groep].filters.forEach((existingFilter) => {
                            filterIdArray.push(existingFilter.id);
                        })

                        if (!filterIdArray.includes(filter.id)) {
                            categorisedFilters[groep].filters.push(filter);
                        }
                        let groepByNummer = {};

                        groepByNummer = store.getters.groepByNummer(groep);
                        if (!groepByNummer) {
                            store.dispatch("getGroepByNummer", groep).then(res => {
                                if (categorisedFilters[res.groepsnummer]) {
                                    categorisedFilters[res.groepsnummer]['naam'] = 'Gedeeld met ' + res.naam + " [" + res.groepsnummer + "]"
                                }
                            });
                        } else {
                            if (categorisedFilters[groepByNummer.groepsnummer]) {
                                categorisedFilters[groepByNummer.groepsnummer]['naam'] = 'Gedeeld met ' + groepByNummer.naam + " [" + groepByNummer.groepsnummer + "]"
                            }
                        }
                    })
                } else {
                    categorisedFilters['0001'].filters.push(filter);
                }
            } else if (filter.type === 'verbond') {
                categorisedFilters['___Z'].filters.push(filter);
            } else {
                categorisedFilters['0000'].filters.push(filter);
            }
        });

        let sortedFilters = [];
        _.forEach(categorisedFilters, (filterGroup) => {
            if (filterGroup.filters.length > 0) {
                sortedFilters.push(filterGroup);
            }
            let groupedAndSortedFilters = filterGroup.filters.sort(function (a, b) {
                return (a.naam.toUpperCase() > b.naam.toUpperCase()) ? 1 : ((b.naam.toUpperCase() > a.naam.toUpperCase()) ? -1 : 0);
            });
            groupedAndSortedFilters.forEach((filter) => {
                sortedFilters.push(filter)
            })
        });
        let gestructureerdeFilters = [];

        _.forEach(sortedFilters, (filterGroup) => {
            if (filterGroup.isHeader) {
                let items = [];
                _.forEach(filterGroup.filters, (sortedFilter) => {
                    let filter = {
                        label: sortedFilter.naam,
                        value: sortedFilter
                    }
                    items.push(filter);
                });
                let filter = {label: filterGroup.naam, code: filterGroup.naam, items: items};
                gestructureerdeFilters.push(filter);
            }
        })
        return gestructureerdeFilters;
    },

    activateCriterium(crit, huidigeFilter) {
        crit.activated = true;
        this.setHuidigeFilterLabel('Huidige', huidigeFilter);

        if (!crit.multiValues && !(crit.criteriaSubKey === "verbonds" || crit.criteriaSubKey === "groepspecifiek")) {
            if (crit.multiplePossible) {
                _.forEach(crit.items, function (value) {
                    value.activated = true;
                });
            } else {
                if (crit.criteriaKey === 'geslacht') {
                    // ladies first!
                    _.find(crit.items, {'value': 'vrouw'}).activated = true;
                } else {
                    let bAlreadyActive = false;
                    _.forEach(crit.items, function (value) {
                        if (value.activated) {
                            bAlreadyActive = true;
                        }
                    });
                    if (!bAlreadyActive) {
                        crit.items[0].activated = true;
                    }
                }
            }
        } else {
            _.forEach(crit.itemgroups, function (value) {
                _.forEach(value.items, function (v) {
                    v.activated = true;
                })
            })
        }

    },

    setHuidigeFilterLabel(str, huidigeFilter) {
        huidigeFilter.naam = str;
    },

    getIndividueleSteekkaartMenu() {
        return {
            "title": "Individuele steekkaart",
            "criteriaKey": "individuelesteekkaart",
            "multiplePossible": false,
            "multiValues": true,
            "operator": {
                "label": "Aangepast ",
                "key": "operator",
                "values": [
                    ["voor", "ouder"],
                    ["na", "jonger"]
                ]
            }
            ,
            "value":
                {
                    "operator":
                        "ouder"
                }
        }

    },

    getLeeftijdMenu() {
        return {
            'title': 'Leeftijd',
            'criteriaKey': 'leeftijd',
            'multiplePossible': false,
            'activated': false,
            'multiValues': true,
            'leeftijdOpDatum': {
                'label': '',
                'key': 'op31december',
                'values': [
                    ['was op 31 december', true],
                    ['Is nu', false]
                ]
            }
            ,
            'jongerDan': {
                'label': 'en jonger dan',
                'key': 'jongerdan',
                'values': [
                    ["-", -1],
                    ["5 jaar", 5],
                    ["6 jaar", 6],
                    ["7 jaar", 7],
                    ["8 jaar", 8],
                    ["9 jaar", 9],
                    ["10 jaar", 10],
                    ["11 jaar", 11],
                    ["12 jaar", 12],
                    ["13 jaar", 13],
                    ["14 jaar", 14],
                    ["15 jaar", 15],
                    ["16 jaar", 16],
                    ["17 jaar", 17],
                    ["18 jaar", 18],
                    ["19 jaar", 19],
                    ["20 jaar", 20],
                    ["21 jaar", 21],
                    ["22 jaar", 22],
                    ["23 jaar", 23],
                    ["24 jaar", 24],
                    ["25 jaar", 25],
                    ["26 jaar", 26],
                    ["27 jaar", 27],
                    ["28 jaar", 28],
                    ["29 jaar", 29],
                    ["30 jaar", 30],
                    ["31 jaar", 31],
                    ["32 jaar", 32],
                    ["33 jaar", 33],
                    ["34 jaar", 34],
                    ["35 jaar", 35],
                    ["36 jaar", 36],
                    ["37 jaar", 37],
                    ["38 jaar", 38],
                    ["39 jaar", 39],
                    ["40 jaar", 40],
                    ["41 jaar", 41],
                    ["42 jaar", 42],
                    ["43 jaar", 43],
                    ["44 jaar", 44],
                    ["45 jaar", 45],
                    ["46 jaar", 46],
                    ["47 jaar", 47],
                    ["48 jaar", 48],
                    ["49 jaar", 49]
                ]
            }
            ,
            'ouderDan': {
                'label': 'ouder dan',
                'key': 'ouderdan',
                'values': [
                    ["-", -1],
                    ["5 jaar", 5],
                    ["6 jaar", 6],
                    ["7 jaar", 7],
                    ["8 jaar", 8],
                    ["9 jaar", 9],
                    ["10 jaar", 10],
                    ["11 jaar", 11],
                    ["12 jaar", 12],
                    ["13 jaar", 13],
                    ["14 jaar", 14],
                    ["15 jaar", 15],
                    ["16 jaar", 16],
                    ["17 jaar", 17],
                    ["18 jaar", 18],
                    ["19 jaar", 19],
                    ["20 jaar", 20],
                    ["21 jaar", 21],
                    ["22 jaar", 22],
                    ["23 jaar", 23],
                    ["24 jaar", 24],
                    ["25 jaar", 25],
                    ["26 jaar", 26],
                    ["27 jaar", 27],
                    ["28 jaar", 28],
                    ["29 jaar", 29],
                    ["30 jaar", 30],
                    ["31 jaar", 31],
                    ["32 jaar", 32],
                    ["33 jaar", 33],
                    ["34 jaar", 34],
                    ["35 jaar", 35],
                    ["36 jaar", 36],
                    ["37 jaar", 37],
                    ["38 jaar", 38],
                    ["39 jaar", 39],
                    ["40 jaar", 40],
                    ["41 jaar", 41],
                    ["42 jaar", 42],
                    ["43 jaar", 43],
                    ["44 jaar", 44],
                    ["45 jaar", 45],
                    ["46 jaar", 46],
                    ["47 jaar", 47],
                    ["48 jaar", 48],
                    ["49 jaar", 49]
                ]
            }

        };
    },

    getCriteria() {
        let returnObj = {};
        returnObj.arrCriteria = [];

        // Functies
        let functies = store.getters.functies;
        let functieGroepen = this.maakFunctieGroepen(functies);
        functieGroepen.activated = false;
        returnObj.arrCriteria.push(functieGroepen);

        // Groepen
        let groepen = store.getters.groepen;
        let groepenCriteria = this.getCriteriaGroepen(groepen);
        groepenCriteria.activated = false;
        returnObj.arrCriteria.push(groepenCriteria);

        let geg = store.getters.profiel.groepseigenVelden;
        let groepsEigenCriteria = this.getCriteriaGroepsEigen(geg, groepen);
        groepsEigenCriteria.activated = false;
        returnObj.arrCriteria.push(groepsEigenCriteria);

        returnObj.arrCriteria.push(this.getGeslachtMenu());

        returnObj.arrCriteria.push(this.getOudledenMenu());

        returnObj.arrCriteria.push(this.getVerminderdLidgeldMenu())

        returnObj.arrCriteria.push(this.getAdresGeblokkeerdMenu())

        returnObj.arrCriteria.push(this.getEmailGeblokkeerdMenu())

        returnObj.arrCriteria.push(this.getLeeftijdMenu())

        returnObj.arrCriteria.push(this.getIndividueleSteekkaartMenu())

        return returnObj;
    },

    maakFunctieGroepen(functies) {

        // met lodash zoeken we alle functie objecten met als property type:'verbond'
        let verbondFuncties = _.filter(functies, function (f) {
            return f.type === 'verbond';
        });

        let functieGroep = {};
        functieGroep.criteriaSubKey = "verbonds";
        functieGroep.title = 'Functies';
        functieGroep.criteriaKey = "functies";
        functieGroep.multiplePossible = true;
        functieGroep.itemgroups = [];

        verbondFuncties.forEach(verbondFunctie => {
            let functieMapObj = this.mapObj(verbondFunctie);

            verbondFunctie.groeperingen.forEach(groepering => {

                let itemGroupObj = _.find(functieGroep.itemgroups, {'label': groepering.naam});

                if (!itemGroupObj) {
                    itemGroupObj = {};
                    itemGroupObj.label = groepering.naam;
                    itemGroupObj.items = [];
                    itemGroupObj.collapsed = true;
                    itemGroupObj.volgorde = groepering.volgorde;

                    functieGroep.itemgroups.push(itemGroupObj);
                }

                itemGroupObj.items.push(functieMapObj);
            });
        });

        functieGroep.itemgroups = _.sortBy(functieGroep.itemgroups, ['volgorde']);

        // functieGroepen maken van functies met type 'groep'
        let groepseigenFuncties = this.maakGroepSpecifiekeFunctieGroepen(functies);
        groepseigenFuncties.forEach(value => {
            let obj = {};
            obj.collapsed = true;
            obj.items = value.items;
            obj.label = value.title;
            functieGroep.itemgroups.push(obj);
        });

        return functieGroep;
    },

    getGeslachtMenu() {
        let geslacht = {
            "title": "Geslacht",
            "criteriaKey": "geslacht",
            "multiplePossible": false,
            "items": [
                {
                    "value": "vrouw",
                    "label": "Meisje"
                },
                {
                    "value": "man",
                    "label": "Jongen"
                },
                {
                    "value": "andere",
                    "label": "Andere"
                }
            ]
        }
        geslacht.activated = false;
        return geslacht;
    },

    getOudledenMenu() {
        let oudLeden = {
            "title": "Oudleden",
            "criteriaKey": "oudleden",
            "multiplePossible": false,
            "items": [
                {
                    "value": true,
                    "label": "Oudlid"
                },
                {
                    "value": "alles",
                    "label": "Actief en Oudlid"
                }
            ]
        }
        oudLeden.activated = false;
        return oudLeden;
    },

    getVerminderdLidgeldMenu() {
        let verminderdLidgeld = {
            "title": "Verminderd lidgeld",
            "criteriaKey": "verminderdLidgeld",
            "multiplePossible": false,
            "items": [
                {
                    "value": true,
                    "label": "Ja"
                }
            ]
        }
        verminderdLidgeld.activated = false;
        return verminderdLidgeld;
    },

    getEmailGeblokkeerdMenu() {
        let emailGeblokkeerd = {
            "title": "E-mailadres geblokkeerd",
            "criteriaKey": "emailgeblokkeerd",
            "multiplePossible": false,
            "items": [
                {
                    "value": true,
                    "label": "Ja"
                }
            ]
        }
        emailGeblokkeerd.activated = false;
        return emailGeblokkeerd;
    },

    getAdresGeblokkeerdMenu() {
        let adresGeblokkeerd = {
            "title": "Adres geblokkeerd",
            "criteriaKey": "adresgeblokkeerd",
            "multiplePossible": false,
            "items": [
                {
                    "value": true,
                    "label": "Ja"
                }
            ]
        }
        adresGeblokkeerd.activated = false;
        return adresGeblokkeerd;
    },

    maakGroepSpecifiekeFunctieGroepen(functies) {

        let groepFuncties = _.filter(functies, function (f) {
            return f.type === 'groep';
        });

        // neem eerst alle groepnummers van de functies die behoren tot het type 'groep'
        let arrGroepFunctieGroepen = [];
        _.forEach(groepFuncties, function (value) {
            arrGroepFunctieGroepen.push(value.groepen[0]);
        });
        // hou enkel de unieke waarden over
        arrGroepFunctieGroepen = _.uniqWith(arrGroepFunctieGroepen, _.isEqual);
        arrGroepFunctieGroepen = _.sortBy(arrGroepFunctieGroepen);

        // per unieke waarde een functiegroep maken
        let groepSpecifiekeFunctieGroepen = [];
        arrGroepFunctieGroepen.forEach(v => {
            let arrUnmappedObjs = _.filter(groepFuncties, function (f) {
                return f.groepen[0] === v
            });
            let arrMappedObjs = [];
            let mappedObj = {};

            arrUnmappedObjs.forEach(value => {
                mappedObj = this.mapObj(value);
                arrMappedObjs.push(mappedObj);
            });

            let functieGroep = this.maakFunctieGroep(arrMappedObjs, 'Functies van ' + v);
            groepSpecifiekeFunctieGroepen.push(functieGroep);
        });

        return groepSpecifiekeFunctieGroepen;
    },

    mapObj(unmappedObj) {
        // Map de properties van ieder object (bvb. 'beschrijving' wordt 'label', 'id' wordt 'value')
        let map = {
            beschrijving: "label",
            id: "value"
        };
        let mappedObj = {};
        _.forEach(unmappedObj, function (value, key) {
            key = map[key] || key;
            mappedObj[key] = value;
        });
        return mappedObj;
    },

    maakFunctieGroep(arrFuncties, titel) {
        return {
            title: titel.charAt(0).toUpperCase() + titel.slice(1),
            criteriaKey: "functies",
            multiplePossible: true,
            items: arrFuncties
        };
    },

    getCriteriaGroepen(groepenData) {
        let groepen = groepenData.filter(function (groep) {
            return 'contacten' in groep;
        });

        let groepenCriteria = {
            title: "Groepen",
            criteriaKey: "groepen",
            multiplePossible: true,
            items: []
        };
        groepen.forEach(value => {
            let groep = {
                value: value.groepsnummer,
                label: value.naam + " - " + value.groepsnummer,
                sortering: value.groepsnummer
            };
            groepenCriteria.items.push(groep);
        });
        return groepenCriteria;
    },


    getCriteriaGroepsEigen(geg, groepen) {
        let groepsObject = {}
        let groepenCriteria = {
            title: "Groepseigen gegevens",
            criteriaKey: "groepseigen",
            multiplePossible: true,
            itemgroups: []
        };
        _.forEach(Object.entries(geg), function (value) {
            _.forEach(groepen, (groep) => {
                groepsObject = {}
                if (groep.id === value[0]) {
                    groepsObject.value = groep.groepsnummer;
                    groepsObject.label = groep.naam + " - " + groep.groepsnummer;
                    groepsObject.sortering = groep.groepsnummer;

                    if (value[1].schema.length > 0) {
                        groepsObject.items = _.map(value[1].schema, function (groepseigenGegeven) {
                            if (groepseigenGegeven != null && groepseigenGegeven.type === "lijst") {
                                return {
                                    veld: groepseigenGegeven.id,
                                    label: groepseigenGegeven.label,
                                    activated: false,
                                    waarde: '',
                                    keuze: true,
                                    keuzes: groepseigenGegeven.keuzes,
                                    operator: 'like',
                                    operatorValues: [
                                        {label: 'bevat', value: 'like'},
                                        {label: 'is', value: 'equals'},
                                        {label: 'is kleiner dan', value: 'less'},
                                        {label: 'is groter dan', value: 'greater'}
                                    ]

                                }
                            }
                            if (groepseigenGegeven.type === "vinkje") {

                                return {
                                    activated: false,
                                    veld: groepseigenGegeven.id,
                                    label: groepseigenGegeven.label,
                                    vinkje: true,
                                    operator: 'equals',
                                    waarde: false,

                                }
                            }

                            return {
                                veld: groepseigenGegeven.id,
                                label: groepseigenGegeven.label,
                                activated: false,
                                waarde: '',
                                operator: 'like',
                                operatorValues: [
                                    {label: 'bevat', value: 'like'},
                                    {label: 'is', value: 'equals'},
                                    {label: 'is kleiner dan', value: 'less'},
                                    {label: 'is groter dan', value: 'greater'}
                                ]
                            }
                        });
                    }
                    groepenCriteria.itemgroups.push(groepsObject);
                }
            })
        });
        return groepenCriteria;
    },

    getActieveCriteria(huidigeFilter, criteria) {
        let activeCriteria = [];
        if (huidigeFilter.criteria) {
            for (const [key, value] of Object.entries(huidigeFilter.criteria)) {
                criteria.arrCriteria.forEach(crit => {
                    if (crit.criteriaKey === key) {
                        if (value && (value === true || value.length > 0)) {
                            crit.activated = true;
                            crit.value = value;
                            activeCriteria.push(crit);
                        }

                        if (key === 'groepseigen') {
                            crit.itemgroups.forEach((itemgroup) => {
                                if (itemgroup.items && itemgroup.items.length > 0) {
                                    itemgroup.items.forEach((item) => {
                                        if (crit.value && crit.value.length > 0) {
                                            crit.value.forEach((value) => {
                                                if (item.veld === value.veld) {
                                                    item.activated = true;
                                                    item.waarde = value.waarde === "true" ? true : value.waarde;
                                                    item.operator = value.operator;
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        if (key === 'functies') {
                            crit.itemgroups.forEach((itemgroup) => {
                                if (itemgroup.items && itemgroup.items.length > 0) {
                                    itemgroup.items.forEach((item) => {
                                        item.activated = !!value.includes(item.value);
                                    })
                                }
                            })
                        }
                    }
                })
            }
        }

        // Om de vreemde constructie van deze filter op te vangen moeten we gaan checken als die bestaat in de criteria van de huidige filter
        if (!Object.prototype.hasOwnProperty.call(huidigeFilter.criteria, 'oudleden')) {
            criteria.arrCriteria.forEach(crit => {
                if (crit.criteriaKey === 'oudleden') {
                    crit.activated = true;
                    crit.value = "alles";
                    activeCriteria.push(crit);
                }
            })
        }
        // groepseigen gegevens controle om elk item apart te activeren en te voorzien van de juiste waarde

        return activeCriteria;
    }
}
