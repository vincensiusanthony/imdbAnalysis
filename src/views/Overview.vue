<template>
  <div class="animate-fade-in relative z-10">
    <div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center h-64 text-accent">
      <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-semibold tracking-widest uppercase text-sm animate-pulse">Initializing Data...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl backdrop-blur-md">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-slate-400 font-medium">Total Database</p>
              <h3 class="text-3xl font-bold text-white mt-1">{{ totalMovies.toLocaleString() }}</h3>
            </div>
            <div class="p-2 bg-blue-500/20 rounded-lg text-blue-400">🗄️</div>
          </div>
        </div>
        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-slate-400 font-medium">Avg IMDB Rating</p>
              <h3 class="text-3xl font-bold text-accent mt-1">{{ avgRating }}</h3>
            </div>
            <div class="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">⭐</div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-primary/80 to-indigo-600/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 tech-card shadow-lg shadow-primary/20">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-blue-100 font-medium">Top Genre</p>
              <h3 class="text-3xl font-bold text-white mt-1">{{ topGenre }}</h3>
            </div>
            <div class="p-2 bg-white/20 rounded-lg text-white">🎭</div>
          </div>
        </div>
        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-slate-400 font-medium">Total Votes Analisa</p>
              <h3 class="text-3xl font-bold text-indigo-400 mt-1">{{ totalVotes }}M+</h3>
            </div>
            <div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">📈</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card col-span-1 group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">🍩</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Distribusi Tipe</h4>
          </div>
          <div class="h-64"><Doughnut :data="typeChartData" :options="chartOptions" /></div>
        </div>

        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card col-span-1 lg:col-span-2 group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">📉</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Tren Rilis Konten</h4>
          </div>
          <div class="h-64"><Line :data="trendChartData" :options="chartOptions" /></div>
        </div>

        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card col-span-1 lg:col-span-3 group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">📊</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Top 10 Genre Terbanyak</h4>
          </div>
          <div class="h-80"><Bar :data="genreChartData" :options="horizontalBarOptions" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useMovies } from '../composables/useMovies'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler } from 'chart.js'
import { Doughnut, Line, Bar } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler)

const { movies, isLoading, error, fetchMovies } = useMovies()
onMounted(() => fetchMovies())

const totalMovies = computed(() => movies.value.length)
const avgRating = computed(() => {
  if (movies.value.length === 0) return 0
  const sum = movies.value.reduce((acc, curr) => acc + (parseFloat(curr.imdbrating) || 0), 0)
  return (sum / movies.value.length).toFixed(1)
})
const totalVotes = computed(() => {
  const sum = movies.value.reduce((acc, curr) => acc + (parseInt(curr.numvotes) || 0), 0)
  return (sum / 1000000).toFixed(1)
})
const topGenre = computed(() => {
  const counts = {}
  movies.value.forEach(m => {
    if(m.genres) m.genres.split(',').forEach(g => { counts[g.trim()] = (counts[g.trim()] || 0) + 1 })
  })
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '')
})

// --- WARNA & DATA ---
const colorBlue = 'rgba(59, 130, 246, 0.8)'
const colorCyan = 'rgba(6, 182, 212, 0.8)'
const colorIndigo = 'rgba(99, 102, 241, 0.8)'
const colorHover = 'rgba(0, 240, 255, 1)'

const typeChartData = computed(() => {
  let movieCount = 0, tvCount = 0
  movies.value.forEach(m => { if (m.type === 'Movie') movieCount++; else if (m.type === 'TV Show') tvCount++ })
  return {
    labels: ['Movie', 'TV Show'],
    datasets: [{ data: [movieCount, tvCount], backgroundColor: [colorBlue, colorCyan], hoverBackgroundColor: [colorHover, colorHover], borderWidth: 0, hoverOffset: 15 }]
  }
})

const trendChartData = computed(() => {
  let yearCounts = {}
  movies.value.forEach(d => {
    let yr = d.releaseyear
    if (yr >= 1980 && yr <= 2023) yearCounts[yr] = (yearCounts[yr] || 0) + 1
  })
  const sortedYears = Object.keys(yearCounts).sort((a,b) => a - b)
  return {
    labels: sortedYears,
    datasets: [{
      label: 'Total Rilis', data: sortedYears.map(y => yearCounts[y]),
      borderColor: colorCyan, backgroundColor: 'rgba(6, 182, 212, 0.1)', fill: true, tension: 0.4,
      pointBackgroundColor: colorCyan, pointHoverBackgroundColor: colorHover, pointRadius: 0, pointHoverRadius: 6
    }]
  }
})

const genreChartData = computed(() => {
  const counts = {}
  movies.value.forEach(m => { if(m.genres) m.genres.split(',').forEach(g => { counts[g.trim()] = (counts[g.trim()] || 0) + 1 }) })
  const sorted = Object.keys(counts).map(k => ({name: k, count: counts[k]})).sort((a,b) => b.count - a.count).slice(0, 10)
  return {
    labels: sorted.map(g => g.name),
    datasets: [{ label: 'Jumlah Titles', data: sorted.map(g => g.count), backgroundColor: colorIndigo, hoverBackgroundColor: colorHover, borderRadius: 4 }]
  }
})

// --- CHART OPTIONS ---
const commonTooltip = { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#00f0ff', bodyColor: '#e2e8f0', borderColor: 'rgba(6, 182, 212, 0.3)', borderWidth: 1, padding: 12, cornerRadius: 8 }

const chartOptions = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 1500, easing: 'easeOutQuart' },
  plugins: { legend: { labels: { color: '#cbd5e1' } }, tooltip: commonTooltip },
  scales: { x: { ticks: { color: '#64748b' }, grid: { display: false } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.3)', borderDash: [5, 5] } } }
}

const horizontalBarOptions = {
  responsive: true, maintainAspectRatio: false, indexAxis: 'y', animation: { duration: 1500, easing: 'easeOutQuart' },
  plugins: { legend: { display: false }, tooltip: commonTooltip },
  scales: { x: { grid: { color: 'rgba(51, 65, 85, 0.3)', borderDash: [5,5] }, ticks: { color: '#94a3b8' } }, y: { grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: '500' } } } }
}
</script>