<template>
  <div class="animate-fade-in relative z-10">
    <div class="fixed top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center h-64 text-accent">
      <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-semibold tracking-widest uppercase text-sm animate-pulse">Initializing Data...</p>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">⭐</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Top 10 Title Berdasarkan Votes</h4>
          </div>
          <div class="h-80"><Bar :data="topVotesData" :options="horizontalBarOptions" /></div>
        </div>

        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">🏆</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Highest Rated (Min. 500k Votes)</h4>
          </div>
          <div class="h-80"><Bar :data="highestRatedData" :options="horizontalBarOptions" /></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">📊</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Distribusi Skor IMDB</h4>
          </div>
          <div class="h-80"><Bar :data="scoreDistributionData" :options="verticalBarOptions" /></div>
        </div>

        <div class="bg-cardbg backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 tech-card group">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">📈</div>
            <h4 class="text-lg font-bold text-white tracking-wide">Korelasi Votes vs Rating</h4>
          </div>
          <div class="h-80"><Scatter :data="scatterData" :options="scatterOptions" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useMovies } from '../composables/useMovies'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend } from 'chart.js'
import { Bar, Scatter } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend)

const { movies, isLoading, fetchMovies } = useMovies()
onMounted(() => fetchMovies())

// --- WARNA TEMA TECH BLUE ---
const colorBlue = 'rgba(59, 130, 246, 0.8)'   // Blue 500
const colorCyan = 'rgba(6, 182, 212, 0.8)'    // Cyan 500
const colorIndigo = 'rgba(99, 102, 241, 0.8)' // Indigo 500
const colorHover = 'rgba(0, 240, 255, 1)'     // Neon Cyan untuk Hover

// --- DATA LOGIC ---
const topVotesData = computed(() => {
  const sorted = [...movies.value].sort((a, b) => b.numvotes - a.numvotes).slice(0, 10)
  return { 
    labels: sorted.map(m => m.title), 
    datasets: [{ 
      label: 'Total Votes', 
      data: sorted.map(m => m.numvotes), 
      backgroundColor: colorBlue, 
      hoverBackgroundColor: colorHover,
      borderRadius: 6,
      borderSkipped: false
    }] 
  }
})

const highestRatedData = computed(() => {
  const sorted = movies.value.filter(m => m.numvotes > 500000).sort((a, b) => b.imdbrating - a.imdbrating).slice(0, 10)
  return { 
    labels: sorted.map(m => m.title), 
    datasets: [{ 
      label: 'IMDB Rating', 
      data: sorted.map(m => m.imdbrating), 
      backgroundColor: colorCyan,
      hoverBackgroundColor: colorHover, 
      borderRadius: 6,
      borderSkipped: false
    }] 
  }
})

const scoreDistributionData = computed(() => {
  const bins = { '< 5.0': 0, '5.0-5.9': 0, '6.0-6.9': 0, '7.0-7.9': 0, '8.0-8.9': 0, '9.0+': 0 }
  movies.value.forEach(m => {
    const score = parseFloat(m.imdbrating)
    if (score < 5.0) bins['< 5.0']++; else if (score < 6.0) bins['5.0-5.9']++; else if (score < 7.0) bins['6.0-6.9']++;
    else if (score < 8.0) bins['7.0-7.9']++; else if (score < 9.0) bins['8.0-8.9']++; else bins['9.0+']++
  })
  return { 
    labels: Object.keys(bins), 
    datasets: [{ 
      label: 'Jumlah Film', 
      data: Object.values(bins), 
      backgroundColor: colorIndigo,
      hoverBackgroundColor: colorHover,
      borderRadius: 6 
    }] 
  }
})

const scatterData = computed(() => {
  const points = movies.value.filter(m => m.numvotes > 10000 && m.imdbrating).map(m => ({ x: m.numvotes, y: parseFloat(m.imdbrating) }))
  return { 
    datasets: [{ 
      label: 'Movies', 
      data: points, 
      backgroundColor: 'rgba(14, 165, 233, 0.4)', // Sky transparan
      borderColor: 'rgba(14, 165, 233, 0.8)',
      borderWidth: 1,
      pointRadius: 4, 
      pointHoverRadius: 8,
      pointHoverBackgroundColor: colorHover
    }] 
  }
})

// --- CHART OPTIONS (Interaktif & Animasi) ---
const commonOptions = {
  responsive: true, 
  maintainAspectRatio: false, 
  animation: {
    duration: 1500,
    easing: 'easeOutQuart'
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#00f0ff',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    }
  }
}

const horizontalBarOptions = {
  ...commonOptions,
  indexAxis: 'y', 
  scales: { 
    x: { grid: { color: 'rgba(51, 65, 85, 0.3)', borderDash: [5,5] }, ticks: { color: '#94a3b8' } }, 
    y: { grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: '500' } } } 
  }
}

const verticalBarOptions = {
  ...commonOptions,
  scales: { 
    x: { grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: '500' } } }, 
    y: { grid: { color: 'rgba(51, 65, 85, 0.3)', borderDash: [5,5] }, ticks: { color: '#94a3b8' } } 
  }
}

const scatterOptions = {
  ...commonOptions,
  scales: {
    x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Jumlah Votes', color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8' } },
    y: { title: { display: true, text: 'IMDB Rating', color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8' } }
  }
}
</script>