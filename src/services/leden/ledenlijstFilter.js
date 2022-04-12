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
                        if (!categorisedFilters[groep]) {
                            categorisedFilters[groep] = {isHeader: true, filters: []};
                        }
                        categorisedFilters[groep].filters.push(filter);
                        let groepByNummer = store.getters.groepByNummer(groep);

                        if (categorisedFilters[groepByNummer.groepsnummer]) {
                            categorisedFilters[groepByNummer.groepsnummer]['naam'] = 'Gedeeld met ' + groepByNummer.naam + " [" + groepByNummer.groepsnummer + "]"
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
            var groupedAndSortedFilters = filterGroup.filters.sort(function (a, b) {
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
                let filter = { label: filterGroup.naam, code: filterGroup.naam, items: items };
                gestructureerdeFilters.push(filter);
            }
        })
        console.log(gestructureerdeFilters);
        return gestructureerdeFilters;
    }
}