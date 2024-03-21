import {createRouter, createWebHistory,} from "vue-router";
import Dashboard from "@/views/Dashboard";
import Ledenlijst from "@/views/Ledenlijst";
import Ledenaantallen from "@/views/Ledenaantallen";
import IndividueleSteekkaart from "@/views/IndividueleSteekkaart";
import Groep from "@/views/Groep";
import Lid from "@/views/Lid";
import Mail from "@/views/Mail";
import Etiketten from "@/views/Etiketten";
import Aanvragen from "@/views/Aanvragen";
import Communicatievoorkeuren from "@/views/Communicatievoorkeuren";
import rechtenService from "@/services/rechten/rechtenService";
import LidToevoegen from "@/views/LidToevoegen";
import InschrijvingsFormulier from "@/views/InschrijvingsFormulier";
import InschrijvingsFormulierVerstuurd from "@/views/InschrijvingsFormulierVerstuurd";
import Activiteiten from "@/views/Activiteiten.vue";

const routes = [
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: "/email/ledenlijst",
        name: "Mail",
        component: Mail,
        meta: {
            requiresAuth: true,
            hasAccessTo: "ledenlijst"
        }
    },
    {
        path: "/etiketten",
        name: "Etiket",
        component: Etiketten,
        meta: {
            requiresAuth: true,
            hasAccessTo: "ledenlijst"
        }
    },
    {
        path: "/ledenlijst",
        name: "Ledenlijst",
        component: Ledenlijst,
        meta: {
            requiresAuth: true,
            hasAccessTo: "ledenlijst"
        }
    },
    {
        path: "/ledenaantallen",
        name: "Ledenaantallen",
        component: Ledenaantallen,
        meta: {
            requiresAuth: true,
            hasAccessTo: "groepen"
        }
    },
    {
        path: "/groepsinstellingen",
        name: "Groepsinstellingen",
        component: Groep,
        meta: {
            requiresAuth: true,
            hasAccessTo: "groepen"
        }
    },
    {
        path: "/aanvragen",
        name: "Aanvragen",
        component: Aanvragen,
        meta: {
            requiresAuth: true,
            hasAccessTo: "aanvragen"

        }
    },
    {
        path: "/activiteiten",
        name: "Activiteiten",
        component: Activiteiten,
        meta: {
            requiresAuth: true,
            hasAccessTo: "aanvragen"

        }
    },
    {
        path: "/lid/toevoegen",
        name: "lidToevoegen",
        component: LidToevoegen,
        meta: {
            requiresAuth: true,
            hasAccessTo: "nieuw lid"
        }
    },
    {
        path: "/lid/:id",
        name: "Lid",
        component: Lid,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: "/formulier/lidworden/:groep",
        name: "LidWorden",
        component: InschrijvingsFormulier,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: "/formulier/lidworden/:groep/verstuurd",
        name: "LidWordenVerstuurd",
        component: InschrijvingsFormulierVerstuurd,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: "/",
        redirect: {
            name: "Dashboard",
        },
    },
    {
        path: "/lid/individuelesteekkaart/:id",
        name: "IndividueleSteekkaart",
        component: IndividueleSteekkaart,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: "/lid/communicatievoorkeuren",
        name: "Communicatievoorkeuren",
        component: Communicatievoorkeuren,
        meta: {requiresAuth: false}
    },
    {
        path: "/groepsadmin/client/",
        name: 'VorigeLayout'
    }
];

const router = createRouter({
    history: createWebHistory("/groepsadmin/frontend/"),
    routes,

});

router.beforeEach((to, from, next) => {
    // Als gebruiker geen toegang heeft dan redirecten naar dashboard
    if (to.meta.requiresAuth) {
        if (to.meta.hasAccessTo === 'groepen' && rechtenService.hasAccessToGroepen()) {
            next();
        } else if (to.meta.hasAccessTo !== 'groepen' && rechtenService.hasAccess(to.meta.hasAccessTo)) {
            next();
        } else {
            next({
                name: "Dashboard",
            })
        }
    } else {
        next()
    }
})

export default router;
