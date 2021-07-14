import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard";
import Ledenlijst from "@/views/Ledenlijst";
import Ledenaantallen from "@/views/Ledenaantallen";
import IndividueleSteekkaart from "@/views/IndividueleSteekkaart";
import Groep from "@/views/Groep";
import Lid from "@/views/Lid";
import Mail from "@/views/Mail";
import Etiketten from "@/views/Etiketten";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/ledenlijst/mail",
    name: "Mail",
    component: Mail,
  },
  {
    path: "/ledenlijst/etiket",
    name: "Etiket",
    component: Etiketten,
  },
  {
    path: "/ledenlijst",
    name: "Ledenlijst",
    component: Ledenlijst,
  },
  {
    path: "/ledenaantallen",
    name: "Ledenaantallen",
    component: Ledenaantallen,
  },
  {
    path: "/groepsinstellingen",
    name: "Groepsinstellingen",
    component: Groep,
  },
  {
    path: "/lid/:id",
    name: "Lid",
    component: Lid,
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
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
