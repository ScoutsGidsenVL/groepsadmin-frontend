<template>
  <div class="sidemenu">
    <div class="hidden lg:block desktop-menu">
      <div class="header_logo_inner">
        <div class="ga-logo cursor-pointer" @click="goToDashBoard">
          <img :src="`${publicPath}static/img/ga-logo.svg`" alt="ga logo"/>
        </div>
      </div>
      <div class="menu-wrapper">
        <div class="menu">
          <div>
            <ul>
              <li v-for="menuItem in desktopMenuItems" :key="menuItem.label"
                  class="menu-item menu-item-width cursor-pointer">
                <div @click="goto(menuItem.link)" class="menu-item-width">
                  <div class="menu-icon">
                    <i :class="[menuItem.icon, activeMenu.toLowerCase() === menuItem.label.toLowerCase()? 'active': '']"
                       class="menu-icon"
                       :title="menuItem.label.toLowerCase()"
                    />
                  </div>
                  <div
                    v-if="menuItem.label !== 'Zoeken'"
                    :class="[activeMenu.toLowerCase() === menuItem.label.toLowerCase()? 'active': '']"
                    class="text-align-left ml-6"
                  >{{ menuItem.label }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="lg:hidden mb-8">
      <div class="mb-6 relative d-flex justify-content-end align-content-center">
        <div class="ga-logo-mobile cursor-pointer" @click="goToDashBoard">
          <img :src="`${publicPath}static/img/ga-logo.svg`" alt="ga logo" class="ml-2 top-0"/>
        </div>
        <div class="right-0">
          <Button type="button" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
                  class="actie-button menu-button" label="Menu">
                  <i class="pi pi-bars"></i>
                  <span class="px-3">Menu</span>
                  <i class="pi pi-chevron-down"></i>
          </Button>
          <Menu
            id="overlay_menu"
            ref="menu"
            :model="mobileMenuItems"
            :popup="true"
            class="mobile-menu"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WikiService from "@/services/wiki/WikiService";
import rechtenService from "@/services/rechten/rechtenService";

export default {
  name: "SideMenu",
  data() {
    return {
      publicPath: process.env.BASE_URL,
      activeMenu: "",
      menuItems: [
        {
          label: "Mijn gegevens",
          condition: true,
          icon: "far fa-user",
          link: "Profiel",
          command: () => {
            this.goto("Profiel")
          }
        },
        {
          label: "Mijn individuele steekkaart",
          condition: true,
          icon: "fal fa-notes-medical",
          link: "IndividueleSteekkaart",
          command: () => {
            this.goto("IndividueleSteekkaart")
          }
        },
        {
          label: "Mijn Communicatievoorkeuren",
          condition: true,
          icon: "fal fa-satellite-dish",
          link: "Communicatievoorkeuren",
          command: () => {
            this.$router.push({name: "Communicatievoorkeuren"})
          }
        },
        {
          label: "Ledenlijst",
          condition: "ledenlijst",
          icon: "far fa-users",
          link: "Ledenlijst",
          command: () => {
            this.$router.push({name: 'Ledenlijst'})
          }
        },
        {
          label: "Lidaanvragen",
          condition: "aanvragen",
          icon: "far fa-address-book",
          link: "Aanvragen",
          command: () => {
            this.$router.push({name: 'Aanvragen'})
          }
        },
        {
          label: "Groep",
          condition: "groepen",
          icon: "far fa-cogs",
          link: "Groepsinstellingen",
          command: () => {
            this.$router.push({name: 'Groepsinstellingen'})
          }
        },
        {
          label: "Ledenaantallen",
          condition: "groepen",
          icon: "far fa-chart-area",
          link: "Ledenaantallen",
          command: () => {
            this.$router.push({name: 'Ledenaantallen'})
          }
        },
        {
          label: "Help",
          condition: true,
          icon: "far fa-question",
          link: "Help",
        },
        {
          label: 'Vorige layout',
          condition: true,
          icon: 'fas fa-external-link',
          link: "Vorige layout",
        }
      ],
    }
  },
  methods: {
    toggle(event) {
      this.$refs.menu.toggle(event);
    },
    goToDashBoard() {
      this.$router.push({name: "Dashboard"});
    },

    goto(menuItem) {
      top.window.onbeforeunload = null;
      if (menuItem === "Help") {
        window.open(WikiService.getWikiUrl(), '_blank');
        return;
      }

      if (menuItem === "Vorige layout") {
        if (window.origin === "http://localhost:3000") {
          window.location.href = "http://localhost:8000/#/ledenlijst";
        } else {
          window.location.href = "/groepsadmin/client/";
        }
        return;
      }

      if (menuItem === "Profiel") {
        this.$router.push({name: "Lid", params: {id: "profiel"}});
      } else if (menuItem === "IndividueleSteekkaart"){
        this.$router.push({name: menuItem, params: {id: this.$store.getters.profiel.id}});
      } else {
        this.$router.push({name: menuItem});
      }
      this.activeMenu = menuItem;
    },
  },
  // In geval van refresh gaan we huidige pagina ophalen om actieve menu aan te duiden
  mounted() {
    this.activeMenu = WikiService.getPagina();
  },
  computed: {
    desktopMenuItems: function () {
      return this.menuItems.filter(obj => {
        if (obj.condition === "groepen") {
          return rechtenService.hasAccessToGroepen();
        }
        return obj.condition === true || rechtenService.hasPermission(obj.condition) || rechtenService.hasAccess(obj.condition);
      });
    },
    mobileMenuItems: function () {

      let mobileMenuItems = this.menuItems.filter(obj => {
        if (obj.condition === "groepen") {
          return rechtenService.hasAccessToGroepen();
        }
        return obj.label !== 'Zoeken' || rechtenService.hasPermission(obj.condition) || rechtenService.hasAccess(obj.condition);
      })
      mobileMenuItems.push({
        label: "Afmelden",
        condition: true,
        icon: "fas fa-sign-out-alt",
        command: () => {
          this.$keycloak.logout()
        }
      })
      return mobileMenuItems;
    },
  }
}
</script>

