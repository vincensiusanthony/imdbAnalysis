<template>
  <div class="animate-fade-in">
    <div class="flex flex-col lg:flex-row justify-between lg:items-end mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">🎬 Movie Database</h2>
        <p class="text-slate-400 text-sm mt-1">Cari dan jelajahi {{ movies.length.toLocaleString() }} data film</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div class="relative w-full sm:w-auto">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Ketik judul film..." 
            class="bg-cardbg border border-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary w-full sm:w-64 text-white transition-all shadow-inner"
          >
        </div>

        <div class="flex items-center justify-between sm:justify-start gap-3 bg-cardbg border border-slate-700 px-4 py-2 rounded-xl">
          <span class="text-sm text-slate-400">Show:</span>
          <select v-model="entriesLimit" class="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer">
            <option :value="20">20</option>
            <option :value="30">30</option>
            <option :value="40">40</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-cardbg rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
      <div v-if="isLoading" class="p-10 text-center text-primary animate-pulse font-semibold">
        Memuat Database...
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300 whitespace-nowrap">
          <thead class="bg-slate-800/80 text-slate-400 border-b border-slate-700 uppercase text-xs tracking-wider">
            <tr>
              <th class="px-6 py-4 font-semibold w-1/3">Title</th>
              <th class="px-6 py-4 font-semibold">Year</th>
              <th class="px-6 py-4 font-semibold">Genre</th>
              <th class="px-6 py-4 font-semibold">IMDB Rating</th>
              <th class="px-6 py-4 font-semibold text-right">Votes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <tr v-for="movie in paginatedMovies" :key="movie.title + movie.releaseyear" class="hover:bg-slate-800/40 transition-colors">
              <td class="px-6 py-4 font-bold text-white">{{ movie.title }}</td>
              <td class="px-6 py-4 text-slate-400">{{ movie.releaseyear }}</td>
              <td class="px-6 py-4 text-xs text-slate-500">{{ movie.genres || '-' }}</td>
              <td class="px-6 py-4">
                <span class="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-md font-bold text-xs">
                  ⭐ {{ movie.imdbrating || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-right text-slate-400">
                {{ movie.numvotes ? parseInt(movie.numvotes).toLocaleString() : '0' }}
              </td>
            </tr>
            <tr v-if="paginatedMovies.length === 0">
              <td colspan="5" class="px-6 py-16 text-center text-slate-500">
                <div class="text-4xl mb-3">👻</div>
                <p>Data tidak ditemukan untuk pencarian <strong>"{{ searchQuery }}"</strong></p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="p-4 border-t border-slate-700 bg-slate-800/30 text-xs sm:text-sm text-slate-400 flex justify-between items-center">
        <p>Menampilkan <strong>{{ paginatedMovies.length }}</strong> dari <strong>{{ filteredMovies.length.toLocaleString() }}</strong> hasil</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMovies } from '../composables/useMovies'

const { movies, isLoading, fetchMovies } = useMovies()

const searchQuery = ref('')
const entriesLimit = ref(20)

onMounted(() => fetchMovies())

const filteredMovies = computed(() => {
  if (!movies.value || movies.value.length === 0) return []
  if (!searchQuery.value.trim()) return movies.value
  const query = searchQuery.value.toLowerCase().trim()
  return movies.value.filter(movie => movie.title && String(movie.title).toLowerCase().includes(query))
})

const paginatedMovies = computed(() => filteredMovies.value.slice(0, entriesLimit.value))
</script>