# accu-check

Ce programme permet d'extraire les données de glycémie mesurées par un appareil [Accu-Chek](https://www.accu-chek.fr/lecteurs-de-glycemie/guide) connecté en USB (avec l'[API WebUSB](https://wicg.github.io/webusb/)) et de les afficher sous forme graphique (avec [Chart.js](https://www.chartjs.org/)) et sous forme de liste de mesures, avec la possibilité de les enregistrer au format JSON ou CSV.

Ce programme est utilisable directement [en ligne ici](https://davdiv.github.io/accu-check/).

Le code du fichier [readUSBData](src/readUSBData.ts) provient en grande partie de [Tidepool uploader](https://github.com/tidepool-org/uploader) sous license BSD-2-Clause. Merci à eux!
