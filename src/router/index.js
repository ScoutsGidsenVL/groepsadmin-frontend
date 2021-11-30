import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard";
import Ledenlijst from "@/views/Ledenlijst";
import Ledenaantallen from "@/views/Ledenaantallen";
import IndividueleSteekkaart from "@/views/IndividueleSteekkaart";
import Groep from "@/views/Groep";
import Lid from "@/views/Lid";
import Mail from "@/views/Mail";
import Etiketten from "@/views/Etiketten";
import Aanvragen from "@/views/Aanvragen";
import LidToevoegen from "@/views/LidToevoegen";
import Communicatievoorkeuren from "@/views/Communicatievoorkeuren";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { isAuthorized: true }
  },
  {
    path: "/ledenlijst/mail",
    name: "Mail",
    component: Mail,
    meta: { isAuthorized: true }
  },
  {
    path: "/ledenlijst/etiket",
    name: "Etiket",
    component: Etiketten,
    meta: { isAuthorized: true }
  },
  {
    path: "/ledenlijst",
    name: "Ledenlijst",
    component: Ledenlijst,
    meta: { isAuthorized: true }
  },
  {
    path: "/ledenaantallen",
    name: "Ledenaantallen",
    component: Ledenaantallen,
    meta: { isAuthorized: true }
  },
  {
    path: "/groepsinstellingen",
    name: "Groepsinstellingen",
    component: Groep,
    meta: { isAuthorized: true }
  },
  {
    path: "/aanvragen",
    name: "Aanvragen",
    component: Aanvragen,
    meta: { isAuthorized: true }
  },
  {
    path: "/lid/toevoegen",
    name: "lidToevoegen",
    component: LidToevoegen,
    meta: { isAuthorized: true }
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
    meta: { isAuthorized: true }
  },
  {
    path: "/lid/communicatievoorkeuren",
    name: "Communicatievoorkeuren",
    component: Communicatievoorkeuren,
    meta: { isAuthorized: true }
  },
];

const router = createRouter({
  history: createWebHistory("/groepsadmin/frontend"),
  routes,
});

router.beforeEach((to, from, next) => {
  // if (to.matched.some(record => record.meta.isAuthorized)){
  //   // check if lid has access
  //   next({
  //     path: '/lid/profiel',
  //   })
  // }
  // console.log(from);
  // console.log(next);
  // if (to.matched.some(record => record.meta.isAuthorized)) {
  //   // this route requires auth, check if logged in
  //   // if not, redirect to login page.
  //   if (!auth.loggedIn()) {
  //     next({
  //       path: '/login',
  //       query: { redirect: to.fullPath }
  //     })
  //   } else {
  //     next()
  //   }
  // } else {
  //   next() // make sure to always call next()!
  // }
  next();
})

export default router;
