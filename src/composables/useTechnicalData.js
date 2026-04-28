import { computed } from 'vue'

export function useTechnicalData(movies) {
  // Palet Warna Diperluas untuk 10 Genre + 1 Others
  const colors = [
    'rgba(6, 182, 212, 0.8)',   // Cyan
    'rgba(99, 102, 241, 0.8)',  // Indigo
    'rgba(236, 72, 153, 0.8)',  // Pink
    'rgba(245, 158, 11, 0.8)',  // Amber
    'rgba(59, 130, 246, 0.8)',  // Blue
    'rgba(16, 185, 129, 0.8)',  // Emerald
    'rgba(139, 92, 246, 0.8)',  // Violet
    'rgba(239, 68, 68, 0.8)',   // Red
    'rgba(20, 184, 166, 0.8)',  // Teal
    'rgba(249, 115, 22, 0.8)',  // Orange
    'rgba(100, 116, 139, 0.8)'  // Slate (Untuk "Others")
  ]
  
  const hoverColors = [
    'rgba(0, 240, 255, 1)', 'rgba(129, 140, 248, 1)', 'rgba(244, 114, 182, 1)',
    'rgba(251, 191, 36, 1)', 'rgba(96, 165, 250, 1)', 'rgba(52, 211, 153, 1)',
    'rgba(167, 139, 250, 1)', 'rgba(248, 113, 113, 1)', 'rgba(45, 212, 191, 1)',
    'rgba(251, 146, 60, 1)', 'rgba(148, 163, 184, 1)'
  ]

  // Helper: Fungsi otomatis mencari N Genre terbanyak
  const getTopGenres = (limit = 10) => {
    const counts = {}
    movies.value.forEach(m => {
      if (m.genres) m.genres.split(',').forEach(g => {
        const clean = g.trim()
        counts[clean] = (counts[clean] || 0) + 1
      })
    })
    return Object.keys(counts).sort((a,b) => counts[b] - counts[a]).slice(0, limit)
  }

  // 1. DATA: TREN KUALITAS GENRE (Multi-Line Chart: Top 10)
  const genreTrendData = computed(() => {
    if (!movies.value.length) return { labels: [], datasets: [] }
    
    const targetGenres = getTopGenres(10) // Ambil 10 Teratas!
    const yearRange = Array.from({length: 24}, (_, i) => 2000 + i) 
    
    const datasets = targetGenres.map((genre, index) => {
      const dataPoints = yearRange.map(year => {
        const filtered = movies.value.filter(m => m.releaseyear === year && m.genres && m.genres.includes(genre) && m.imdbrating)
        if (filtered.length === 0) return null
        const sum = filtered.reduce((acc, curr) => acc + parseFloat(curr.imdbrating), 0)
        return (sum / filtered.length).toFixed(2)
      })

      return {
        label: genre,
        data: dataPoints,
        borderColor: colors[index],
        backgroundColor: colors[index].replace('0.8', '0.1'),
        pointBackgroundColor: colors[index],
        pointHoverBackgroundColor: hoverColors[index],
        pointRadius: 3, pointHoverRadius: 6,
        tension: 0.4, spanGaps: true
      }
    })

    return { labels: yearRange, datasets }
  })

  // 2. DATA: ELITE ACTOR PROFILE (Scatter Plot - Tetap Sama)
  const actorQualityData = computed(() => {
    if (!movies.value.length) return { datasets: [] }
    
    const actorStats = {}
    movies.value.forEach(m => {
      if (m.cast && m.imdbrating) {
        m.cast.split(',').forEach(actor => {
          const name = actor.trim()
          if (!actorStats[name]) actorStats[name] = { count: 0, sumRating: 0 }
          actorStats[name].count++
          actorStats[name].sumRating += parseFloat(m.imdbrating)
        })
      }
    })

    const points = Object.keys(actorStats)
      .filter(name => actorStats[name].count >= 5)
      .map(name => ({
        x: actorStats[name].count,
        y: parseFloat((actorStats[name].sumRating / actorStats[name].count).toFixed(2)),
        actorName: name
      }))

    return {
      datasets: [{
        label: 'Actor Profile',
        data: points,
        backgroundColor: 'rgba(6, 182, 212, 0.5)',
        borderColor: colors[0],
        borderWidth: 1,
        pointRadius: 5, pointHoverRadius: 8,
        pointHoverBackgroundColor: hoverColors[0]
      }]
    }
  })

  // 3. DATA: ACTOR GENRE PORTFOLIO (Stacked Bar Chart: Top 10 + Others)
  const actorPortfolioData = computed(() => {
    if (!movies.value.length) return { labels: [], datasets: [] }
    
    const actorCounts = {}
    movies.value.forEach(m => { if (m.cast) m.cast.split(',').forEach(a => { actorCounts[a.trim()] = (actorCounts[a.trim()] || 0) + 1 }) })
    const top10Actors = Object.keys(actorCounts).sort((a, b) => actorCounts[b] - actorCounts[a]).slice(0, 10)

    // Ambil Top 10 Genre, tambahkan "Others" di paling akhir
    const targetGenres = getTopGenres(10)
    const categories = [...targetGenres, 'Others']

    const portfolio = top10Actors.map(name => {
      let stats = {}
      categories.forEach(c => stats[c] = 0) // Inisialisasi awal 0
      
      movies.value.filter(m => m.cast && m.cast.includes(name)).forEach(m => {
        let found = false
        targetGenres.forEach(g => {
          if (m.genres && m.genres.includes(g)) { stats[g]++; found = true }
        })
        if (!found) stats.Others++
      })
      return stats
    })

    const datasets = categories.map((genre, index) => {
      return {
        label: genre,
        data: portfolio.map(p => p[genre]),
        backgroundColor: colors[index], hoverBackgroundColor: hoverColors[index],
        borderRadius: 4
      }
    })

    return { labels: top10Actors, datasets }
  })

  return { genreTrendData, actorQualityData, actorPortfolioData }
}