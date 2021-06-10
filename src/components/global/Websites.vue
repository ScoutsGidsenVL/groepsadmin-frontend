<template>
  <div class="col-10 col-lg-8">
    <div class="row">
      <div class="col-12 d-flex flex-row globale_menubalk align-items-center">
        <div class="sgv-logo">
          <a href="https://www.scoutsengidsenvlaanderen.be" id="item_sgv"></a>
        </div>

        <div
          v-for="website in websites"
          :key="website.naam"
          class="website-links"
          :class="website.afbeelding ? 'website-image' : 'website-text'"
        >
          <a
            :href="website.url"
            class="clean-link"
            :class="website.afbeelding ? 'website-image' : ''"
            :style="'background-image: url(' + website.afbeelding + ');'"
          >
            {{ !website.afbeelding ? website.naam : "" }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RestService from "@/services/api/RestService";

export default {
  name: "Websites",
  data() {
    return {
      websites: [
        {
          naam: "Scouts en Gidsen Vlaanderen",
          url: "https://www.scoutsengidsenvlaanderen.be",
        },
        {
          naam: "Hopper",
          url: "http://www.hopper.be",
        },
        {
          naam: "Groepsadministratie",
          url: "https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin",
        },
        {
          naam: "Facebook",
          url: "https://www.facebook.com/scoutsengidsenvlaanderen",
          afbeelding:
            "https://oudesite.scoutsengidsenvlaanderen.be/files/algemeen/menubalk/balk_sprite_fb.png",
        },
        {
          naam: "Twitter",
          url: "https://twitter.com/ScoutsGidsenVL",
          afbeelding:
            "https://oudesite.scoutsengidsenvlaanderen.be/files/algemeen/menubalk/balk_sprite_twitter.png",
        },
        {
          naam: "Instagram",
          url: '"https://instagram.com/scoutsgidsenvl',
          afbeelding:
            "https://oudesite.scoutsengidsenvlaanderen.be/files/algemeen/menubalk/balk_sprite_instagram.png",
        },
      ],
    };
  },
  mounted() {
    RestService.getWebsites()
      .then((response) => {
        if (response.status === 200) {
          this.websites = response.data.websites;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>
