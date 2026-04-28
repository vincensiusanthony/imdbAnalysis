<template>
  <div class="animate-fade-in">
    <div v-if="isLoading" class="flex items-center justify-center h-64 text-primary animate-pulse text-xl">
      Memproses Spesifikasi Teknis...
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div class="bg-cardbg p-6 rounded-2xl border border-slate-700 shadow-xl col-span-1 lg:col-span-2">
        <h4 class="text-lg font-semibold text-white mb-4">⏱️ Tren Durasi Rata-rata Film (Menit)</h4>
        <div class="h-80"><Line :data="durationData" :options="lineOptions" /></div>
      </div>

      <div class="bg-cardbg p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h4 class="text-lg font-semibold text-white mb-4">⏳ Distribusi Durasi Film (Menit)</h4>
        <div class="h-80"><Bar :data="durationDistData" :options="verticalBarOptions" /></div>
      </div>

      <div class="bg-cardbg p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h4 class="text-lg font-semibold text-white mb-4">🎭 Top 10 Aktor Paling Produktif</h4>
        <div class="h-80"><Bar :data="actorsData" :options="horizontalBarOptions" /></div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useMovies } from '../composables/useMovies'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler)

const { movies, isLoading, fetchMovies } = useMovies()
onMounted(() => fetchMovies())

// Logic Panel 8: Tren Durasi Rata-rata
const durationData = computed(() => {
  const yearDurations = {}
  movies.value.forEach(m => {
    if (m.type === 'Movie' && m.releaseyear >= 1980 && m.releaseyear <= 2023) {
      const durMatch = String(m.duration).match(/(\d+)/)
      if (durMatch) {
        const dur = parseInt(durMatch[0])
        const yr = m.releaseyear
        if (!yearDurations[yr]) yearDurations[yr] = { sum: 0, count: 0 }
        yearDurations[yr].sum += dur
        yearDurations[yr].count++
      }
    }
  })
  const sortedYears = Object.keys(yearDurations).sort((a,b) => a - b)
  const avgDurations = sortedYears.map(y => (yearDurations[y].sum / yearDurations[y].count).toFixed(1))
  return {
    labels: sortedYears,
    datasets: [{ label: 'Rata-rata Durasi (Menit)', data: avgDurations, borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.2)', tension: 0.3, fill: true }]
  }
})

// Logic Panel 11: Distribusi Durasi Film
const durationDistData = computed(() => {
  const bins = { '< 60': 0, '60-90': 0, '90-120': 0, '120-150': 0, '150-180': 0, '> 180': 0 }
  movies.value.forEach(m => {
    if (m.type === 'Movie') {
      const durMatch = String(m.duration).match(/(\d+)/)
      if (durMatch) {
        const dur = parseInt(durMatch[0])
        if (dur < 60) bins['< 60']++; else if (dur <= 90) bins['60-90']++; else if (dur <= 120) bins['90-120']++;
        else if (dur <= 150) bins['120-150']++; else if (dur <= 180) bins['150-180']++; else bins['> 180']++
      }
    }
  })
  return { labels: Object.keys(bins), datasets: [{ label: 'Jumlah Film', data: Object.values(bins), backgroundColor: '#10b981', borderRadius: 4 }] }
})

// Logic Panel 9: Top Aktor
const actorsData = computed(() => {
  const actorCounts = {}
  movies.value.forEach(m => { if (m.cast) m.cast.split(',').forEach(actor => { actorCounts[actor.trim()] = (actorCounts[actor.trim()] || 0) + 1 }) })
  const sortedActors = Object.keys(actorCounts).map(name => ({ name, count: actorCounts[name] })).sort((a, b) => b.count - a.count).slice(0, 10)
  return { labels: sortedActors.map(a => a.name), datasets: [{ label: 'Jumlah Film', data: sortedActors.map(a => a.count), backgroundColor: '#3b82f6', borderRadius: 4 }] }
})

const horizontalBarOptions = {
  responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } },
  scales: { x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, y: { grid: { display: false }, ticks: { color: '#e2e8f0' } } }
}
const verticalBarOptions = {
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#e2e8f0' } }, y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } } }
}
const lineOptions = {
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8' } }, y: { grid: { color: '#334155', borderDash: [5,5] }, ticks: { color: '#94a3b8' } } }
}
</script>