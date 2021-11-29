<template>
  <SideMenu />
  <confirmDialog />
  <toast position="bottom-right" />
  <transition>
    <router-view class="app-content"/>
  </transition>
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
export default {
  components: {
    SideMenu
  },
};
</script>
