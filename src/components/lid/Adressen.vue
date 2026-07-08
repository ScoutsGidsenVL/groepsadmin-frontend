<template>
  <div class="adressen-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font22"> {{ title }}</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded p-button-outlined mt-1 add-button"
            @click="voegAdresToe"
            title="Voeg adres toe"
            v-if="lidaanvraag || heeftToegang('adressen')"
          />
        </div>
      </template>
      <template #content>
        <accordion :multiple="true" v-model:activeIndex="activeIndex">
          <accordionTab v-for="(adres, index) in adressen" :key="index">
            <template #header>
              <div class="d-flex col-11 justify-content-between">
                <span>{{ setHeader(adres) }}</span>
                <i
                  class="pi pi-envelope mr-3"
                  v-if="adressen[index].postadres"
                  title="postadres"
                ></i>
                <Button
                  v-if="!adressen[index].postadres && heeftToegang('adressen')"
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-outlined p-button-danger remove-button mr-1"
                  @click="
                    $event.stopPropagation();
                    remove(index);
                  "
                  title="Verwijder adres"
                />
              </div>
            </template>
            <AdresVelden
              v-model="adressen[index]"
              :disabled="!heeftToegang('adressen')"
            />
            <BaseInputTelefoon
              v-model="adressen[index].telefoon"
              label="Telefoon"
              :disabled="!heeftToegang('adressen')"
              type="text"
              :invalid="
                v.$dirty &&
                v.adressen.$each.$response.$errors[index]?.telefoon &&
                v.adressen.$each.$response.$errors[index].telefoon.length > 0
              "
              :error-message="
                v.$dirty &&
                v.adressen.$each.$response.$errors[index]?.telefoon &&
                v.adressen.$each.$response.$errors[index].telefoon.length > 0
                  ? v.adressen.$each.$response.$errors[index].telefoon[0]
                      .$message
                  : ''
              "
            ></BaseInputTelefoon>
            <BaseCheckbox
              v-if="!lidaanvraag"
              label="Postadres"
              multiple="false"
              v-model="adressen[index].postadres"
              @change="zetPostadres(index)"
              :disabled="adressen[index].postadres || !heeftToegang('adressen')"
            />
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import AdresVelden from "@/components/adres/AdresVelden";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import { ref, toRefs } from "@vue/reactivity";
import { nextTick, onMounted } from "vue";
import AdresService from "@/services/adressen/AdresService";
import { useVuelidate } from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";

export default {
  name: "Adressen",
  components: {
    BaseCheckbox,
    BaseInputTelefoon,
    AdresVelden,
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object,
      default: null,
    },
    lidaanvraag: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const activeIndex = ref([]);

    if (props.lidaanvraag) {
      onMounted(() => {
        nextTick(() => {
          const adressen = props.modelValue.adressen;
          const heeftBestaandAdres =
            adressen && adressen.some((a) => a.gemeente);
          if (!heeftBestaandAdres) {
            activeIndex.value = [0];
          }
        });
      });
    }

    const {
      state,
      remove,
      voegAdresToe,
      setHeader,
      zetPostadres,
      heeftToegang,
    } = AdresService.adresSpace(props);

    const isGeldigGsmNummer = (value) => {
      value = Telefoonnummer.formatNumber(value);
      return Telefoonnummer.validateNumber(value);
    };

    const rules = {
      adressen: {
        $each: helpers.forEach({
          telefoon: {
            isGeldigGsmNummer: helpers.withMessage(
              "Geen geldig telefoonnummer",
              isGeldigGsmNummer
            ),
          },
        }),
      },
    };

    const v = useVuelidate(rules, state);

    return {
      ...toRefs(state),
      activeIndex,
      voegAdresToe,
      remove,
      zetPostadres,
      setHeader,
      v,
      heeftToegang,
    };
  },
};
</script>

<style scoped></style>
