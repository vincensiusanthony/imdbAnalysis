import { ref, computed } from 'vue'
import Papa from 'papaparse'

// GLOBAL STATE
const movies = ref([])
const isLoading = ref(true)
const error = ref(null)

// 🔥 GLOBAL TIME FRAME FILTER - Default set to 2010
const yearFrom = ref(2010) 
const yearTo = ref('All')

export const formatLargeNumber = (num) => {
  if (num == null) return '0'
  const value = parseInt(num)
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B+'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M+'
  return value.toLocaleString()
}

export function useMovies() {
  const fetchMovies = () => {
    if (movies.value.length > 0) return
    isLoading.value = true
    error.value = null
    const csvPath = 'https://silvaronna.github.io/imdbAnalysis/imdb_data.csv'

    Papa.parse(csvPath, {
      download: true, header: true, dynamicTyping: true,
      complete: (results) => {
        movies.value = results.data.filter(row => row.title)
        isLoading.value = false
      },
      error: (err) => { error.value = "Failed to load CSV."; isLoading.value = false }
    })
  }

  const filteredMoviesByTime = computed(() => {
    return movies.value.filter(m => {
      const y = parseInt(m.releaseyear)
      if (isNaN(y) || y > 2023) return false 

      let from = yearFrom.value === 'All' ? 0 : parseInt(yearFrom.value)
      let to = yearTo.value === 'All' ? 2023 : parseInt(yearTo.value)
      
      if (from > to) { const temp = from; from = to; to = temp; }
      return y >= from && y <= to
    })
  })

  const availableYears = Array.from({length: 2023 - 1980 + 1}, (_, i) => 2023 - i)

  return { 
    movies, filteredMoviesByTime, 
    isLoading, error, fetchMovies, 
    yearFrom, yearTo, availableYears 
  }
}