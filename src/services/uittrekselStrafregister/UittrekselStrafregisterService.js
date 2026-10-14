import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import RestService from "@/services/api/RestService";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  process.env.BASE_URL + "js/pdf.worker.min.js";

export default {
  async haalVerificatieUrlOp(bestand) {
    const data = await bestand.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let tekst = "";
    for (let paginaNr = 1; paginaNr <= pdf.numPages; paginaNr++) {
      const pagina = await pdf.getPage(paginaNr);
      const content = await pagina.getTextContent();
      tekst += content.items.map((item) => item.str).join(" ") + "\n";
    }

    // De FOD Justitie vermeldt op het uittreksel strafregister (model 596-2)
    // een link naar just-crimeviewer-ctz.just.fgov.be om de echtheid te controleren.
    const match = tekst.match(/https?:\/\/\S*crimeviewer\S*/i);
    return match ? match[0].replace(/[.,)]+$/, "") : null;
  },

  // Het documentId is het laatste deel van de verificatielink (na de
  // laatste "/"), enkel dat sturen we door naar de backend, niet de
  // volledige link
  haalDocumentIdUitUrl(verificatieUrl) {
    const zonderQueryOfHash = verificatieUrl.split(/[?#]/)[0];
    const segmenten = zonderQueryOfHash.split("/").filter(Boolean);
    return segmenten[segmenten.length - 1] || null;
  },

  uploadUittreksel(lidId, verificatieUrl) {
    const documentId = this.haalDocumentIdUitUrl(verificatieUrl);
    return RestService.uploadUittrekselStrafregister(lidId, documentId);
  },
};
