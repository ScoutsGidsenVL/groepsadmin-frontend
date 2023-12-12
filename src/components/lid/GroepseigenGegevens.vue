<template>
  <div class="groepseigen-gegeven-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font18"> {{ title }}</span>
          <div :class="groepenLaden ? 'functies-loader' : ''">
            <Indicator :is-loading="groepenLaden" :full-page="false" :height=55 :width=55></Indicator>
          </div>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true" v-if="!groepenLaden">
          <accordionTab v-for="(geg, index) in groepseigenVelden" :key="index">
            <template #header>
              <div class="d-flex col-11 justify-content-between">
                <span>
                  {{ groepNaam(index) }}
                </span>
              </div>
            </template>
            <dynamisch-veld
              :veld="groepseigenVelden[index].schema"
              :model-value="groepseigenVelden[index].waarden"
              :groepIndex="index"
              class="groepseigengegevens"
            ></dynamisch-veld>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import DynamischVeld from "@/components/input/DynamischVeld";
import Indicator from "@/components/global/Indicator";
import GroepseigenGegevensService from "@/services/groepseigengegevens/GroepseigenGegevensService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "GroepseigenGegevens",
  components: {
    DynamischVeld,
    Indicator
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object, Array
    },
  },

  setup (props) {
    const {
      state,
      groepNaam,
      groepenLaden,
      groepen
    } = GroepseigenGegevensService.lidSpace(props);

    return {
      ...toRefs(state),
      groepNaam,
      groepenLaden,
      groepen
    }
  }
};
</script>

<style scoped></style>
