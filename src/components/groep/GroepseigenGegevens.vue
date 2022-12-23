<template>
  <div class="mb-4 lg:ml-4">
    <card>
      <template #title>
        <span>
          Groepseigen gegevens
        </span>
        <span v-if="kanGroepWijzigen">
          <Button
            icon="pi pi-plus"
            class="p-button-rounded add-button mt-t float-end mr-3"
            @click="voegGeigToe"
            title="Voeg groepseigen gegeven toe"
          />
        </span>
      </template>
      <template #content>
        <div class="text-black ml-1 small-text font-light"
             v-if="groep && groep.groepseigenGegevens && groep.groepseigenGegevens.length === 0">
          <p class="small">Geen groepseigen gegevens beschikbaar voor deze groep.</p>
        </div>
        <div v-if="groep && groep.groepseigenGegevens">
        <draggable :list="groep.groepseigenGegevens"
                   @start="drag=true"
                   @end="drag=false"
                   item-key="id"
                   handle=".handle"
        >
          <template #item="{ element, index }">
            <accordion>
              <accordionTab>
                <template #header>
                  <div class="row custom-height w-100">
                    <div class="col-10 handle d-flex justify-content-start cursor-move cut-off-text">
                      <i class="fal fa-arrows top-6 "></i>
                      <span class="ml-2">{{ geigTitel(element) }}</span>
                    </div>
                    <div class="col-2 d-flex justify-content-end">
                      <Button
                        v-if="kanGroepWijzigen"
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-outlined p-button-danger remove-button top--5"
                        @click="
                                    $event.stopPropagation();
                                    verwijderGegeven(index);
                                  "
                        title="Verwijder gegeven"
                      />
                    </div>
                  </div>
                </template>
                <div v-if="element.status !== 'nieuw'">
                  <div class="row">
                    <div class="col-12">
                      <div class="row">
                        <div class="col-5">
                          <i class="pi pi-check-square mt-1 icon-geig" v-if="element.type === 'vinkje'"></i>
                          <i class="fal fa-text mt-1 icon-geig" v-if="element.type === 'tekst'"></i>
                          <i class="fas fa-caret-square-down mt-1 icon-geig" v-if="element.type === 'lijst'"></i>
                          <i class="fas fa-align-justify mt-1 icon-geig"
                             v-if="element.type === 'tekst meerderelijnen'"></i>
                          <i class="fas fa-layer-group mt-1 icon-geig" v-if="element.type === 'groep'"></i>
                        </div>
                        <base-input-no-label v-model="element.label"></base-input-no-label>
                      </div>
                      <div v-if="element.type === 'lijst'">
                        <div class="row">
                          <div class="col-12">
                            <p>Mogelijke keuzes:</p>
                          </div>
                        </div>
                        <div v-for="(keuze, index) in element.keuzes" :key="index" class="ml--05 row mt--1">
                          <div class="col-10 ml--05">
                            <base-input-no-label v-model="element.keuzes[index]"
                                                 @keyup="veranderKeuze(index, element)"></base-input-no-label>
                          </div>
                          <div class="col-2 d-flex justify-content-end">
                            <Button
                              v-if="element.keuzes.length > 1 && kanGroepWijzigen"
                              icon="pi pi-trash"
                              class="p-button-rounded p-button-outlined p-button-danger remove-button"
                              @click="
                                    $event.stopPropagation();
                                    wisKeuze(index, element);
                                  "
                              title="Verwijder keuze"
                            />
                          </div>
                        </div>
                      </div>
                      <BaseCheckbox v-model="element.kanLidWijzigen"
                                    label="Persoon kan zelf wijzigen"></BaseCheckbox>
                      <BaseCheckbox v-model="element.kanLeidingWijzigen"
                                    label="Alle leiding kan wijzigen"></BaseCheckbox>
                      <BaseTextArea v-model="element.beschrijving" label="Helpinstructie"></BaseTextArea>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <div v-if="element.status === 'nieuw'">
                      <div class="row">
                        <div class="col-2">
                          <p>Type: </p>
                        </div>
                        <div class="col-8">
                          <Button class="mr-1 type-select-button" icon="fal fa-text"
                                  :class="element.type === 'tekst' ? 'actief' : ''" @click="setType(element, 'tekst')"
                                  title="tekst"/>
                          <Button class="mr-1 type-select-button" icon="far fa-align-justify"
                                  :class="element.type === 'tekst_meerdere_lijnen' ? 'actief' : ''"
                                  @click="setType(element, 'tekst_meerdere_lijnen')" title="tekst op meerdere lijnen"/>
                          <Button class="mr-1 type-select-button" icon="far fa-caret-square-down"
                                  :class="element.type === 'lijst' ? 'actief' : ''" @click="setType(element, 'lijst')"
                                  title="lijst"/>
                          <Button class="mr-1 type-select-button" icon="pi pi-check-square"
                                  :class="element.type === 'vinkje' ? 'actief' : ''" @click="setType(element, 'vinkje')"
                                  title="vinkje"/>
                          <Button class="mr-1 type-select-button" icon="fad fa-layer-group"
                                  :class="element.type === 'groep' ? 'actief' : ''" @click="setType(element, 'groep')"
                                  title="vinkje"/>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-12">
                          <p> {{
                              element.type === 'tekst_meerdere_lijnen' ? 'tekst op meerdere lijnen' : element.type
                            }} </p>
                        </div>
                      </div>
                      <div class="row">
                        <base-input-no-label v-model="element.label" placeholder="Nieuw groepseigen gegeven"
                                             ></base-input-no-label>
                      </div>
                      <div v-if="element.type === 'lijst'">
                        <div class="row">
                          <div class="col-12">
                            <p>Mogelijke keuzes:</p>
                          </div>
                        </div>
                        <div v-for="(keuze, index) in element.keuzes" :key="index" class="ml--05 row mt--1">
                          <div class="col-10 ml--05">
                            <base-input-no-label v-model="element.keuzes[index]"
                                                 @keyup="veranderKeuze(index, element)"></base-input-no-label>
                          </div>
                          <div class="col-2 d-flex justify-content-end">
                            <Button
                              v-if="element.keuzes.length > 1"
                              icon="pi pi-trash"
                              class="p-button-rounded p-button-outlined p-button-danger remove-button mt-1"
                              @click="
                                    $event.stopPropagation();
                                    wisKeuze(index, element);
                                  "
                              title="Verwijder keuze"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <BaseCheckbox v-model="element.kanLidWijzigen"
                                      label="Persoon kan zelf wijzigen"></BaseCheckbox>
                        <BaseCheckbox v-model="element.kanLeidingWijzigen"
                                      label="Alle leiding kan wijzigen"></BaseCheckbox>
                        <BaseTextArea v-model="element.beschrijving" label="Helpinstructie"></BaseTextArea>
                      </div>
                    </div>
                  </div>
                </div>
              </accordionTab>
            </accordion>
          </template>
        </draggable>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import BaseTextArea from "@/components/input/BaseTextArea";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import BaseInputNoLabel from "@/components/input/BaseInputNoLabel";
import GroepseigenGegevensService from "@/services/groepseigengegevens/GroepseigenGegevensService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "GroepseigenGegevens",
  components: {
    BaseInputNoLabel,
    BaseTextArea,
    BaseCheckbox,
    Draggable,
  },

  props: {
    modelValue: {
      type: Object,
    },
  },

  setup(props) {
    const {
      state,
      kanGroepWijzigen,
      geigTitel,
      verwijderGegeven,
      voegGeigToe,
      setType,
      veranderKeuze,
      wisKeuze
    } = GroepseigenGegevensService.groepSpace(props)


    return {
      ...toRefs(state),
      kanGroepWijzigen,
      geigTitel,
      verwijderGegeven,
      voegGeigToe,
      setType,
      veranderKeuze,
      wisKeuze
    };
  }
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

.top-6 {
  margin-top: 6px !important;
}
</style>
