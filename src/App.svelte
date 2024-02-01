<script lang="ts">
  import Graph from "./Graph.svelte";
  import { parseISO, format } from "date-fns";
  import { fr } from "date-fns/locale";
  import {
    callReadFromDevice,
    callReadFromFile,
    data$,
    dataPromise$,
    jsonBlobURL$,
    csvBlobURL$,
    fileName$,
    reset,
  } from "./data";
  const formatDate = (date: string) =>
    format(parseISO(date), "dd MMM yyyy h'h'mm", { locale: fr });

  const onFileChange = (event: any) => {
    callReadFromFile(event.target.files[0]);
    event.target.value = null;
  };
</script>

<div class="container">
  <!-- svelte-ignore a11y-missing-attribute -->
  <h2 class="mt-3"><img class="logo" src="./logo.svg" /> Accu-Chek</h2>
  <p>
    Cette application web permet d'extraire les données de glycémie mesurées par
    un appareil <a
      target="_blank"
      href="https://www.accu-chek.fr/lecteurs-de-glycemie/guide">Accu-Chek</a
    > connecté en USB et de les afficher sous forme graphique et sous forme de liste
    de mesures, avec la possibilité de les enregistrer au format JSON ou CSV. Il
    est possible aussi de recharger les données précédemment enregistrées au format
    JSON.
  </p>
  <p>
    Les données sont traitées directement dans le navigateur web en local et ne
    sont en aucun cas envoyées à un quelconque serveur sur internet.
  </p>
  {#if $dataPromise$}
    <button
      type="button"
      class="btn btn-outline-secondary mt-3"
      on:click={reset}>Réinitialiser</button
    >
  {:else}
    {#if navigator.usb}
      <button
        type="button"
        class="btn btn-primary mt-3"
        on:click={callReadFromDevice}
        >Extraire depuis le périphérique Accu-Chek</button
      >
    {:else}
      <div class="alert alert-warning mt-3">
        Votre navigateur ne permet pas de se connecter à un périphérique
        Accu-Chek par connexion USB. Vous pourriez essayer d'utiliser Chromium,
        Chrome, Edge ou Opera.
      </div>
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
  {/if}
  {#await $dataPromise$}
    <div class="alert alert-info mt-3">Chargement..</div>
  {:catch error}
    <div class="alert alert-danger mt-3">
      Une erreur s'est produite:<br />
      <pre>{error}</pre>
    </div>
  {/await}
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
      >Le <a target="_blank" href="https://github.com/davdiv/accu-check"
        >code source</a
      > de ce programme est disponible.</small
    >
  </div>
</div>

<style>
  .logo {
    width: 3em;
    height: 3em;
  }
</style>
