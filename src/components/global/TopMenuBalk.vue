<template>
  <div class="top-menubalk">
    <div class="row top-menubalk-content">
      <websites />
      <div
        class="col-2 col-lg-4 d-flex flex-row align-items-center justify-content-end account"
      >
        <user />
        <wiki />
        <logout />
      </div>
    </div>
  </div>
</template>

<script>
import websites from "@/components/global/Websites";
import user from "@/components/global/account/User";
import wiki from "@/components/global/account/Wiki";
import logout from "@/components/global/account/Logout";
export default {
  name: "TopMenuBalk",
  components: { logout, websites, user, wiki },
};
</script>

<style scoped></style>
