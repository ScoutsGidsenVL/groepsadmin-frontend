<template>
  <div class="sidemenu">
    <div class="hidden lg:block desktop-menu">
      <div class="header_logo_inner">
        <div class="ga-logo clickable" @click="goToDashBoard">
          <img :src="`${publicPath}static/img/ga-logo.svg`" alt="ga logo"/>
        </div>
      </div>
      <div class="menu-wrapper">
        <div class="menu">
          <div>
            <ul>
              <li v-for="menuItem in desktopMenuItems" :key="menuItem.label"
                  class="menu-item menu-item-width clickable">
                <div @click="goto(menuItem)" class="menu-item-width">
                  <div class="menu-icon">
                    <i :class="[menuItem.icon, activeMenu.toLowerCase() === menuItem.label.toLowerCase()? 'active': '']"
                       class="menu-icon"
                       :title="menuItem.label.toLowerCase()"
                    />
                  </div>
                  <div
                    v-if="menuItem.label !== 'Zoeken'"
                    :class="[activeMenu.toLowerCase() === menuItem.label.toLowerCase()? 'active': '']"
                    class="menu-item-text"
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
      <div class="top-menu d-flex justify-content-center align-content-center">
        <div class="ga-logo-mobile clickable" @click="goToDashBoard">
          <img :src="`${publicPath}static/img/ga-logo.svg`" alt="ga logo" class="ml-2 top-0"/>
        </div>
        <div class="right-0">
          <Button type="button" icon="pi pi-bars" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
                  class="mobile-menu-button menu-button p-button-rounded"/>
          <Menu id="overlay_menu" ref="menu" :model="mobileMenuItems" :popup="true" class="mobile-menu"/>
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
          label: "Ledenlijst",
          condition: "ledenlijst",
          icon: "far fa-users",
          link: "Ledenlijst",
          command: () => {
            this.$router.push({name: 'Ledenlijst'})
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
          label: "Groep",
          condition: "groepen",
          icon: "far fa-cogs",
          link: "Groepsinstellingen",
          command: () => {
            this.$router.push({name: 'Groepsinstellingen'})
          }
        },
        {
          label: "Mijn gegevens",
          condition: true,
          icon: "far fa-user",
          link: "Profiel",
          command: () => {
            this.$router.push({name: 'Lid', params: {id: "profiel"}})
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
          label: "Help",
          condition: true,
          icon: "far fa-question",
        },
        {
          label: 'Huidige Layout',
          condition: true,
          icon: 'fas fa-external-link'
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
      if (menuItem.label === 'Help') {
        window.open(WikiService.getWikiUrl(), '_blank');
      }

      if (menuItem.label === "Huidige Groepsadministratie") {
        let url = window.origin = 'localhost:3000' ?  'http://localhost:8000/'
          : window.origin = 'https://ga-staging.scoutsengidsenvlaanderen.be/' ? 'https://ga-staging.scoutsengidsenvlaanderen.be/groepsadmin/client/'
            : 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/'

        window.open(url);
      }

      if (menuItem.link === "Profiel") {
        this.$router.push({name: "Lid", params: {id: "profiel"}});
      } else {
        this.$router.push({name: menuItem.link});
      }
      this.activeMenu = menuItem.label;
    },
  },
  // In geval van refresh gaan we huidige pagina ophalen om actieve menu aan te duiden
  mounted() {
    this.activeMenu = WikiService.getPagina();
  },
  computed: {
    desktopMenuItems: function () {
      return this.menuItems.filter(obj => {
        return obj.condition === true || rechtenService.hasAccess(obj.condition);
      });
    },
    mobileMenuItems: function () {

      let mobileMenuItems = this.menuItems.filter(obj => {
        return obj.label !== 'Zoeken' || rechtenService.hasAccess(obj.condition);
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

