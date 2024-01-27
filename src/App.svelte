<script lang="ts">
  import Graph from "./Graph.svelte";
  import { parseISO, format } from "date-fns";
  import { fr } from "date-fns/locale";
  import {
    callReadFromDevice,
    callReadFromFile,
    data$,
    jsonBlobURL$,
    csvBlobURL$,
    fileName$,
  } from "./data";
  const formatDate = (date: string) =>
    format(parseISO(date), "dd MMM yyyy h'h'mm", { locale: fr });

  const onFileChange = (event: any) => {
    callReadFromFile(event.target.files[0]);
    event.target.value = null;
  };
</script>

<div class="container">
  <h2 class="mt-3">Accu-Chek</h2>
  {#if navigator.usb}
    <button
      type="button"
      class="btn btn-primary mt-3"
      on:click={callReadFromDevice}
      >Extraire depuis le périphérique Accu-Chek</button
    >
  {:else}
    Votre navigateur ne permet pas de se connecter à un périphérique Accu-Chek
    par connexion USB. Vous pourriez essayer d'utiliser Chrome ou Chromium.
  {/if}
  <div class="mt-3">
    <label for="formFile" class="form-label">Ouvrir un fichier JSON</label>
    <input
      class="form-control"
      type="file"
      id="formFile"
      on:change={onFileChange}
    />
  </div>
  {#if $data$}
    <a
      class="btn btn-outline-secondary mt-3"
      download={`${$fileName$}.json`}
      href={$jsonBlobURL$}>Enregistrer au format JSON</a
    >
    <a
      class="btn btn-outline-secondary mt-3"
      download={`${$fileName$}.csv`}
      href={$csvBlobURL$}>Enregistrer au format CSV</a
    >

    <dl class="mt-3">
      <dt>Nom de modèle:</dt>
      <dd>{$data$.config.modelName}</dd>
      <dt>Numéro de modèle:</dt>
      <dd>{$data$.config.modelNumber}</dd>
      <dt>Numéro de série:</dt>
      <dd>{$data$.config.serialNumber}</dd>
      <dt>Heure du périphérique:</dt>
      <dd>{formatDate($data$.config.deviceTime)}</dd>
      <dt>Heure du système:</dt>
      <dd>{formatDate($data$.config.systemTime)}</dd>
    </dl>
    <Graph data={$data$.data}></Graph>
    <table class="table">
      <thead>
        <tr><th>Date</th><th>Glycémie</th></tr>
      </thead>
      <tbody class="table-group-divider">
        {#each $data$.data as measure}
          <tr
            ><td>{formatDate(measure.timestamp)}</td><td>{measure.value}</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  {/if}
  <div class="mt-3 text-body-secondary">
    <small
      >Le <a href="https://github.com/davdiv/accu-check">code source</a> de ce programme
      est disponible.</small
    >
  </div>
</div>
