<template>
  <div>
    <TopMenuBalk />
    <Menubalk />
  </div>
</template>

<script>
import TopMenuBalk from "@/components/global/TopMenuBalk";
import Menubalk from "@/components/global/Menubalk";
export default {
  name: "Header",
  components: { TopMenuBalk, Menubalk },
};
</script>
