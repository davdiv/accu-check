# Accu-Chek

Ce programme permet d'extraire les données de glycémie mesurées par un appareil [Accu-Chek](https://www.accu-chek.fr/lecteurs-de-glycemie/guide) connecté en USB (avec l'[API WebUSB](https://wicg.github.io/webusb/)) et de les afficher sous forme graphique (avec [Chart.js](https://www.chartjs.org/)) et sous forme de liste de mesures, avec la possibilité de les enregistrer au format JSON ou CSV. Il est possible aussi de recharger les données précédemment enregistrées au format JSON.

Ce programme est utilisable directement [en ligne ici](https://davdiv.github.io/accu-check/).

Les données sont traitées directement dans le navigateur web en local et ne sont en aucun cas envoyées à un quelconque serveur sur internet.

Le code du fichier [readUSBData](src/readUSBData.ts) provient en grande partie de [Tidepool uploader](https://github.com/tidepool-org/uploader) sous license BSD-2-Clause. Merci à eux!
