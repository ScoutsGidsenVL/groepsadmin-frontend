<template>
  <SideMenu />
  <confirmDialog />
  <toast position="bottom-right" />
  <ingelogd-lid></ingelogd-lid>
  <router-view class="app-content"/>
</template>

<style>
#app {
  font-family: museo_sans500, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
<script>
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
export default {
  components: {
    IngelogdLid,
    SideMenu
  },
};
</script>
