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

const routes = [
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {isAuthorized: true}
    },
    {
        path: "/ledenlijst/mail",
        name: "Mail",
        component: Mail,
        meta: {
            isAuthorized: rechtenService.hasAccess("ledenlijst")
        }
    },
    {
        path: "/ledenlijst/etiket",
        name: "Etiket",
        component: Etiketten,
        meta: {
            isAuthorized: rechtenService.hasAccess("ledenlijst")
        }
    },
    {
        path: "/ledenlijst",
        name: "Ledenlijst",
        component: Ledenlijst,
        meta: {
            isAuthorized: rechtenService.hasAccess("ledenlijst")
        }
    },
    {
        path: "/ledenaantallen",
        name: "Ledenaantallen",
        component: Ledenaantallen,
        meta: {isAuthorized: true}
    },
    {
        path: "/groepsinstellingen",
        name: "Groepsinstellingen",
        component: Groep,
        meta: {
            isAuthorized: rechtenService.hasAccess("groepen")

        }
    },
    {
        path: "/aanvragen",
        name: "Aanvragen",
        component: Aanvragen,
        meta: {
            isAuthorized: rechtenService.hasAccess("aanvragen")
        }

},
    {
        path: "/lid/toevoegen",
        name: "lidToevoegen",
        component: LidToevoegen,
        meta: {isAuthorized: true}
    },
    {
        path: "/lid/:id",
        name: "Lid",
        component: Lid,
        meta: {
            isAuthorized: true
        }
    },
    {
        path: "/formulier/lidworden/:groep",
        name: "LidWorden",
        component: InschrijvingsFormulier,
        meta: {
            isAuthorized: true
        }
    },
    {
        path: "/formulier/lidworden/:groep/verstuurd",
        name: "LidWordenVerstuurd",
        component: InschrijvingsFormulierVerstuurd,
        meta: {
            isAuthorized: true
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
        meta: {isAuthorized: true}
    },
    {
        path: "/lid/communicatievoorkeuren",
        name: "Communicatievoorkeuren",
        component: Communicatievoorkeuren,
        meta: {isAuthorized: true}
    },
];

const router = createRouter({
    history: createWebHistory("/groepsadmin/frontend/"),
    routes,

});

router.beforeEach((to, from, next) => {
    // Als gebruiker geen toegang heeft dan redirecten naar dashboard
    if (!to.meta.isAuthorized) {
        next({
            name: "Dashboard",
        })
    } else {
        next()
    }
})

export default router;
