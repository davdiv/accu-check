<script lang="ts" context="module">
  import Chart from "chart.js/auto";
  import { fr } from "date-fns/locale";
  import "chartjs-adapter-date-fns";
  import zoom from "chartjs-plugin-zoom";
  import type { Measurement } from "./readUSBData";

  Chart.register(zoom);
</script>

<script lang="ts">
  export let data: Measurement[];

  const chart = (dom: HTMLCanvasElement, data: Measurement[]) => {
    const instance = new Chart(dom, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Glycémie",
            data: data.map((item) => ({ x: item.timestamp, y: item.value })),
          },
        ],
      },
      options: {
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
            pan: {
              enabled: true,
              mode: "x",
            },
            limits: {
              x: { min: "original", max: "original" },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            adapters: {
              date: {
                locale: fr,
              },
            },
          },
        },
      },
    });
    return {
      destroy() {
        instance.destroy();
      },
    };
  };
</script>

{#key data}
  <canvas use:chart={data}></canvas>
{/key}
