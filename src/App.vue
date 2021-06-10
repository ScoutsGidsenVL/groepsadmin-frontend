<template>
  <Header />
  <confirmDialog/>
  <toast position="top-center"/>
  <router-view />
  <Footer />
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
import Footer from "@/components/global/Footer";
import Header from "@/components/global/Header";
export default {
  components: {
    Header,
    Footer,
  },
};
</script>
