<template>
  <div class="mb-4">
    <card>
      <template #title>
        <span class="font18"> Ondersteunende vzw's</span>
        <span v-if="kanGroepWijzigen">
          <Button
            icon="pi pi-plus"
            class="p-button-rounded add-button mt-t float-end mr-1"
            @click="voegVzwToe"
            title="Voeg ondersteunende vzw toe"
          />
        </span>
      </template>
      <template #content>
        <div
          class="text-black ml-1 small-text font-light"
          v-if="
            (groep &&
              groep.ondersteunendeVzws &&
              groep.ondersteunendeVzws.length === 0) ||
            groep.ondersteunendeVzws == null
          "
        >
          <p class="small">
            Geen ondersteunende vzw's gekoppeld aan deze groep.
          </p>
        </div>
        <div
          v-if="
            groep &&
            groep.ondersteunendeVzws &&
            groep.ondersteunendeVzws.length > 0
          "
        >
          <accordion :multiple="true" v-model:activeIndex="activeIndex">
            <accordionTab
              v-for="(vzw, index) in groep.ondersteunendeVzws"
              :key="index"
            >
              <template #header>
                <div class="row custom-height w-100">
                  <div class="col-10 d-flex align-items-center">
                    <span class="font15 cut-off-text-table">{{
                      vzwTitel(vzw)
                    }}</span>
                  </div>
                  <div class="col-2 d-flex justify-content-end">
                    <Button
                      v-if="kanGroepWijzigen"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-outlined p-button-danger remove-button top--5"
                      @click="
                        $event.stopPropagation();
                        verwijderVzw(index);
                      "
                      title="Verwijder vzw"
                    />
                  </div>
                </div>
              </template>
              <base-input
                v-model="vzw.naam"
                label="Naam vzw"
                :disabled="!kanGroepWijzigen"
              ></base-input>
              <base-input
                v-model="vzw.kbo"
                label="KBO Nummer"
                placeholder="XXXX.XXX.XXX"
                :disabled="!kanGroepWijzigen"
                :help-link="kboLink(vzw)"
                help-icon="pi pi-external-link"
                help-title="Bekijk in de KBO database"
                @changeValue="v.$touch()"
                :invalid="
                  v.$dirty &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                    ?.kbo &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index].kbo
                    .length > 0
                "
                :error-message="
                  v.$dirty &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                    ?.kbo &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index].kbo
                    .length > 0
                    ? v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                        .kbo[0].$message
                    : ''
                "
              ></base-input>
              <base-input
                v-model="vzw.email"
                label="E-mail vzw"
                :disabled="!kanGroepWijzigen"
                @changeValue="v.$touch()"
                :invalid="
                  v.$dirty &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                    ?.email &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                    .email.length > 0
                "
                :error-message="
                  v.$dirty &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                    ?.email &&
                  v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                    .email.length > 0
                    ? v.groep.ondersteunendeVzws.$each.$response.$errors[index]
                        .email[0].$message
                    : ''
                "
              ></base-input>
              <base-text-area
                v-model="vzw.doel"
                label="Doel van de vzw"
                placeholder="Wat doet jullie vzw; lokaalbeheer, verhuur, evenementen, ..."
                :disabled="!kanGroepWijzigen"
              ></base-text-area>
            </accordionTab>
          </accordion>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import BaseInput from "@/components/input/BaseInput";
import BaseTextArea from "@/components/input/BaseTextArea";
import OndersteunendeVzwService from "@/services/groep/OndersteunendeVzwService";
import { toRefs } from "@vue/reactivity";

export default {
  name: "OndersteunendeVzw",
  components: {
    BaseInput,
    BaseTextArea,
  },

  props: {
    modelValue: {
      type: Object,
    },
    kanGroepWijzigen: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const {
      state,
      voegVzwToe,
      verwijderVzw,
      vzwTitel,
      kboLink,
      v,
    } = OndersteunendeVzwService.groepSpace(props);

    return {
      ...toRefs(state),
      voegVzwToe,
      verwijderVzw,
      vzwTitel,
      kboLink,
      v,
    };
  },
};
</script>

<style scoped>
.custom-height {
  height: 18px !important;
  margin-top: -26px !important;
}

.top--5 {
  margin-top: -5px !important;
}
</style>
