import {computed, reactive} from "@vue/reactivity";
import useEmitter from "@/services/utils/useEmitter";

export default {

    functieFilterSpace(props) {
        const emitter = useEmitter();

        const state = reactive({
            toggleMenu: false,
            alleFuncties: false,
            selectedOption: [],
            openSections: [],
            selectedGroups: []
        })

        const activeerAlleFuncties = () => {
            if (!allesGeselecteerd()) {
                emitter.emit('activeerAlleFuncties', {'criteria': props.criteria})
                geselecteerdeGroepenToevoegen();
            } else {
                emitter.emit('deactiveerAlleFuncties', {'criteria': props.criteria})
                state.selectedGroups = [];
            }
        }

        const allesGeselecteerd = computed(() => {
            let aantal = 0;
            let aantalActieve = 0;
            if (props.criteria && props.criteria.itemgroups) {
                props.criteria.itemgroups.forEach(itemgroup => {
                    aantal = aantal + itemgroup.items.length;
                    itemgroup.items.forEach(item => {
                        item.activated ? aantalActieve++ : null;
                    })
                })
            }
            return aantal === aantalActieve;
        })



        const geselecteerdeGroepenToevoegen = () => {
            if (props.criteria) {
                props.criteria.itemgroups.forEach(itemgroup => {
                    let active = 0;
                    itemgroup.items.forEach(item => {
                        if (item.activated) {
                            active++;
                        }
                    })
                    if (active === itemgroup.items.length) {
                        state.selectedGroups.push(itemgroup.label);
                    }
                })
            }
        }

        const close = () => {
            state.toggleMenu = false;
        }

        const activeerFunctie = (functie) => {
            emitter.emit('activeerFunctie', {'criteria': props.criteria, 'functie': functie})
        }

        const activeerAlleGroepFuncties = (groepering) => {
            if (state.selectedGroups.includes(groepering)) {
                emitter.emit('activeerAlleGroepFuncties', {'criteria': props.criteria, 'groepering': groepering})
            } else {
                emitter.emit('deactiveerAlleGroepFuncties', {'criteria': props.criteria, 'groepering': groepering})
            }
        }

        const opened = (label) => {
            return state.openSections.includes(label);
        }

        const openSection = (label) => {
            let found = state.openSections.includes(label);

            if (found) {
                let index = state.openSections.indexOf(label);
                state.openSections.splice(index, 1);
            } else {
                state.openSections.push(label);
            }
        }

        const gesorteerdeFuncties = (items) => {
            return items.sort((a, b) => {
                if (a.label < b.label) {
                    return -1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                return 0
            });
        }

        const label = computed(() => {
            return "";
        })

        geselecteerdeGroepenToevoegen();

        return {
            state,
            allesGeselecteerd,
            label,
            gesorteerdeFuncties,
            opened,
            openSection,
            close,
            activeerFunctie,
            activeerAlleGroepFuncties,
            activeerAlleFuncties
        };
    }


}
