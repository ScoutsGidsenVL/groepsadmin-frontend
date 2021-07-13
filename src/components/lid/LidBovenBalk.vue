<template>
  <div class="bovenbalk">
    <div class="d-flex justify-content-between">
      <div>
        <h4 class="ml-4 mt-2">{{ volledigeNaam }}</h4>
      </div>
      <div class="justify-content-end">
        <SplitButton
          label="Individuele steekkaart"
          @click="gaNaarIndividueleSteekkaart"
          :model="items"
          style="width: auto; min-width: 285px"
        ></SplitButton>
      </div>
    </div>
  </div>
</template>

<script>
import SplitButton from "primevue/splitbutton";

export default {
  name: "LidBovenBalk",
  components: {
    SplitButton,
  },
  props: {
    lid: {
      type: Object,
    },
    id: {
      type: String,
    },
  },

  data() {
    return {
      items: [
        {
          label: "Communicatievoorkeuren",
          icon: "fas fa-satellite-dish",
          command: () => {
            this.$toast.add({
              severity: "success",
              summary: "Communicatievoorkeuren",
              detail: "We gaan naar communicatievoorkeuren",
              life: 3000,
            });
          },
        },
        {
          label: "Nieuw lid",
          icon: "fas fa-user-plus",
          command: () => {
            this.$toast.add({
              severity: "success",
              summary: "Nieuw",
              detail: "Nieuw lid toevoegen",
              life: 3000,
            });
          },
        },
      ],
    };
  },
  methods: {
    gaNaarIndividueleSteekkaart() {
      this.$router.push({
        name: "IndividueleSteekkaart",
        params: { id: this.lid.id },
      });
    },
  },
  computed: {
    volledigeNaam() {
      if (this.lid.vgagegevens.voornaam && this.lid.vgagegevens.achternaam) {
        return (
          this.lid.vgagegevens.voornaam + " " + this.lid.vgagegevens.achternaam
        );
      } else {
        return " ";
      }
    },
  },
};
</script>

<style scoped></style>
