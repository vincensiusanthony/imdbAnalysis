<template>
  <div class="animate-fade-in relative z-10">
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-64 text-accent">
      <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-semibold tracking-widest uppercase text-sm animate-pulse">Processing Advanced Metrics...</p>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <ChartCard title="Genre Quality Evolution (2000-2023)" icon="📈" heightClass="h-96" colSpanClass="col-span-1 lg:col-span-2" iconBgClass="bg-indigo-500/20" iconTextClass="text-indigo-400">
        <Line :data="genreTrendData" :options="interactiveLineOptions" />
      </ChartCard>

      <ChartCard title="Elite Actor Profile (Rating vs Total Movies)" icon="🎯" heightClass="h-96" iconBgClass="bg-cyan-500/20" iconTextClass="text-cyan-400">
        <Scatter :data="actorQualityData" :options="scatterOptions" />
      </ChartCard>

      <ChartCard title="Actor Genre Portfolio (Specialization)" icon="🎭" heightClass="h-96" iconBgClass="bg-pink-500/20" iconTextClass="text-pink-400">
        <Bar :data="actorPortfolioData" :options="stackedBarOptions" />
      </ChartCard>

    </div>
  </div>
</template>

<script setup>
import ChartCard from '../components/ui/ChartCard.vue'
import { onMounted } from 'vue'
import { useMovies } from '../composables/useMovies'
import { useTechnicalData } from '../composables/useTechnicalData' // Import composable data kompleks
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { Bar, Line, Scatter } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

// Ambil raw data
const { movies, isLoading, fetchMovies } = useMovies()
onMounted(() => fetchMovies())

// Panggil "otak" pemrosesan grafik kompleks
const { genreTrendData, actorQualityData, actorPortfolioData } = useTechnicalData(movies)

// --- CHART OPTIONS (Dengan Fitur Interaktif) ---
const commonTooltip = { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#00f0ff', bodyColor: '#e2e8f0', borderColor: 'rgba(6, 182, 212, 0.3)', borderWidth: 1, padding: 12, cornerRadius: 8 }
// Konfigurasi agar pengguna bisa klik legend untuk Show/Hide data
const interactiveLegend = { display: true, position: 'bottom', labels: { color: '#cbd5e1', usePointStyle: true, padding: 20 } }
const gridLines = { color: 'rgba(51, 65, 85, 0.3)', borderDash: [5,5] }

// Opsi Multi-Line Chart
const interactiveLineOptions = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 1500, easing: 'easeOutQuart' },
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: interactiveLegend, tooltip: commonTooltip },
  scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { title: { display: true, text: 'Avg IMDB Rating', color: '#64748b' }, ticks: { color: '#e2e8f0' }, grid: gridLines } }
}

// Opsi Scatter (Dengan Tooltip Khusus Menampilkan Nama Aktor)
const scatterOptions = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 1500, easing: 'easeOutQuart' },
  plugins: { 
    legend: { display: false }, 
    tooltip: { ...commonTooltip, callbacks: { label: (ctx) => `${ctx.raw.actorName}: ${ctx.raw.x} movies, ⭐ ${ctx.raw.y}` } } 
  },
  scales: {
    x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Total Movies', color: '#64748b' }, grid: gridLines, ticks: { color: '#94a3b8' } },
    y: { title: { display: true, text: 'Avg IMDB Rating', color: '#64748b' }, grid: gridLines, ticks: { color: '#e2e8f0' } }
  }
}

// Opsi Stacked Bar
const stackedBarOptions = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 1500, easing: 'easeOutQuart' },
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: interactiveLegend, tooltip: commonTooltip },
  scales: {
    x: { stacked: true, grid: { display: false }, ticks: { color: '#94a3b8' } }, // STACKED = TRUE
    y: { stacked: true, title: { display: true, text: 'Number of Movies', color: '#64748b' }, grid: gridLines, ticks: { color: '#e2e8f0' } } // STACKED = TRUE
  }
}
</script>