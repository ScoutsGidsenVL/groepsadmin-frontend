<template>
  <div class="groepseigen-gegeven-card ml-4 mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span
          ><span class="small mt-1" v-if="groepenLaden"
            >Groepen laden &nbsp;<i class="fas fa-spinner fa-spin"></i
          ></span>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true">
          <accordionTab v-for="(geg, index) in gegVelden" :key="index">
            <template #header>
              <div class="d-flex col-12 justify-content-between">
                <span>
                  {{ groepNaam(index) }} {{ groepNaam(index) ? " - " : "" }}
                  {{ index }}</span
                >
              </div>
            </template>
            <dynamisch-veld
              :veld="gegVelden[index].schema"
              :model-value="gegVelden[index].waarden"
              :groepIndex="index"
              @changeValue="changeValue"
            ></dynamisch-veld>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from "@vue/reactivity";
import { useStore } from "vuex";
import DynamischVeld from "@/components/input/DynamischVeld";

export default {
  name: "GroepseigenGegevens",
  components: {
    DynamischVeld,
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object,
    },
  },

  setup(props) {
    const store = useStore();

    const state = reactive({
      gegVelden: computed(() => {
        return props.modelValue;
      }),

      groepen: computed(() => {
        return store.getters.indexedGroepen;
      }),
    });

    return { ...toRefs(state) };
  },

  computed: {
    groepenLaden() {
      return this.$store.getters.groepenLaden;
    },
  },

  methods: {
    groepNaam(index) {
      if (
        this.groepen &&
        !this.$store.getters.groepenLaden &&
        this.groepen[index]
      ) {
        return this.groepen[index].naam;
      }
    },
    changeValue(veld, waarde, groepIndex) {
      this.gegVelden[groepIndex].waarden[veld] = waarde;
    },
  },
};
</script>

<style scoped></style>
