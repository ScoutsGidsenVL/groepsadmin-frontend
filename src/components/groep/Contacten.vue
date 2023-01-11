<template>
  <div class="contacten-card lg:ml-4 mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font22">Contact</span
          ><span class="small mt-1" v-if="contactenImporteren"
            >Contacten laden &nbsp;<i class="fas fa-spinner fa-spin"></i
          ></span>
        </div>
      </template>
      <template #content>
        <div class="ml-3" v-if="groep.groepsleiding && groep.groepsleiding.length > 0">
          <label class="f-500 text-decoration-underline"> Groepsleiding</label>
          <div v-for="(grl, key) in groep.groepsleiding" :key="key">
            <i class="fas fa-user"></i><span class="ml-3">{{ grl.naam }}</span>
            <br />
            <i class="fas fa-envelope">
            <span class="ml-3"
          ><a class="mail-link font font-normal" :href="'mailto:' + grl.email">{{
              grl.email
            }}</a></span></i>
          </div>
        </div>
        <br/>
        <div class="ml-3" v-if="groep.vga">
          <label class="text-decoration-underline">
            Verantwoordelijke Groepsadministratie</label
          >
          <div>
            <i class="fas fa-user"></i><span class="ml-3">{{ groep.vga.naam }}</span>
            <br />
            <i class="fas fa-envelope">
            <span class="ml-3"
              ><a class="mail-link font font-normal" :href="'mailto:' + groep.vga.email">{{
                groep.vga.email
              }}</a></span></i>
          </div>
        </div>
        <br />
        <div class="ml-3" v-if="groep.fv">
          <label class="text-decoration-underline"> Financieel Verantwoordelijke</label>
          <div>
            <i class="fas fa-user"></i
            ><span class="ml-3"
              >{{ groep.fv.naam }}</span>
            <br />
            <i class="fas fa-envelope"><span class="ml-3"
              ><a class="mail-link font font-normal" :href="'mailto:' + groep.fv.email">{{
                groep.fv.email
              }}</a></span></i>
          </div>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
export default {
  name: "Contacten",
  props: {
    modelValue: {
      type: Object,
    },
    contactenLaden: {
      type: Boolean,
    },
  },
  computed: {
    contactenImporteren() {
      return this.contactenLaden;
    },
    groep() {
      return this.modelValue;
    },
  },
};
</script>

<style scoped></style>
