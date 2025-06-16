/**
 * Mock Data Service for Development
 * Provides realistic casino game data for testing
 */

import type { 
  Game, 
  GameProvider, 
  GameType, 
  Volatility, 
  Theme, 
  PaginatedResponse 
} from '@/features/games/types'

// Mock providers
export const mockProviders: GameProvider[] = [
  { providerId: 1, providerName: 'NetEnt', isActive: true, logoUrl: '/logos/netent.png' },
  { providerId: 2, providerName: 'Microgaming', isActive: true, logoUrl: '/logos/microgaming.png' },
  { providerId: 3, providerName: 'Play\'n GO', isActive: true, logoUrl: '/logos/playngo.png' },
  { providerId: 4, providerName: 'Pragmatic Play', isActive: true, logoUrl: '/logos/pragmatic.png' },
  { providerId: 5, providerName: 'Evolution Gaming', isActive: true, logoUrl: '/logos/evolution.png' },
  { providerId: 6, providerName: 'Red Tiger', isActive: true, logoUrl: '/logos/redtiger.png' },
  { providerId: 7, providerName: 'Big Time Gaming', isActive: true, logoUrl: '/logos/btg.png' },
  { providerId: 8, providerName: 'Yggdrasil', isActive: true, logoUrl: '/logos/yggdrasil.png' },
]

// Mock game types
export const mockGameTypes: GameType[] = [
  { gameTypeId: 1, gameTypeName: 'Video Slots', description: 'Modern video slot machines' },
  { gameTypeId: 2, gameTypeName: 'Classic Slots', description: 'Traditional 3-reel slots' },
  { gameTypeId: 3, gameTypeName: 'Progressive Jackpot', description: 'Slots with progressive jackpots' },
  { gameTypeId: 4, gameTypeName: 'Blackjack', description: 'Card game variants' },
  { gameTypeId: 5, gameTypeName: 'Roulette', description: 'Roulette variants' },
  { gameTypeId: 6, gameTypeName: 'Baccarat', description: 'Baccarat variants' },
  { gameTypeId: 7, gameTypeName: 'Live Casino', description: 'Live dealer games' },
  { gameTypeId: 8, gameTypeName: 'Video Poker', description: 'Video poker variants' },
]

// Mock volatilities
export const mockVolatilities: Volatility[] = [
  { volatilityID: 1, volatilityName: 'Low', description: 'Frequent small wins', level: 1 },
  { volatilityID: 2, volatilityName: 'Medium', description: 'Balanced risk and reward', level: 2 },
  { volatilityID: 3, volatilityName: 'High', description: 'Less frequent but bigger wins', level: 3 },
  { volatilityID: 4, volatilityName: 'Very High', description: 'Rare but massive wins', level: 4 },
]

// Mock themes
export const mockThemes: Theme[] = [
  { themeID: 1, themeName: 'Adventure', description: 'Adventure and exploration themes' },
  { themeID: 2, themeName: 'Ancient Egypt', description: 'Egyptian mythology and history' },
  { themeID: 3, themeName: 'Fantasy', description: 'Magic and fantasy worlds' },
  { themeID: 4, themeName: 'Fruit', description: 'Classic fruit machine themes' },
  { themeID: 5, themeName: 'Animals', description: 'Wildlife and animal themes' },
  { themeID: 6, themeName: 'Movies & TV', description: 'Based on popular media' },
  { themeID: 7, themeName: 'Mythology', description: 'Gods and mythological creatures' },
  { themeID: 8, themeName: 'Sports', description: 'Sports and competition themes' },
]

// Generate mock games
const generateMockGames = (): Game[] => {
  const games: Game[] = []
  const gameNames = [
    'Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Sweet Bonanza', 'The Dog House',
    'Gates of Olympus', 'Reactoonz', 'Fire Joker', 'Jammin\' Jars', 'Razor Shark',
    'Dead or Alive 2', 'Immortal Romance', 'Thunderstruck II', 'Mega Moolah', 'Divine Fortune',
    'Wolf Gold', 'Great Rhino', 'John Hunter', 'Mustang Gold', 'Pirate Gold',
    'Vikings Go Berzerk', 'Valley of the Gods', 'Holmes and the Stolen Stones', 'Spina Colada',
    'Golden Ticket', 'Troll Hunters', 'Jungle Spirit', 'Planet of the Apes', 'Jumanji',
    'Narcos', 'Vikings', 'Ozwin\'s Jackpots', 'Temple Tumble', 'Easter Island',
    'Atlantis Megaways', 'Bonanza', 'Extra Chilli', 'White Rabbit', 'Danger High Voltage',
    'Genie Jackpots', 'Who Wants to Be a Millionaire', 'Monopoly Live', 'Deal or No Deal',
    'Lightning Roulette', 'Crazy Time', 'Dream Catcher', 'Football Studio', 'Side Bet City'
  ]

  for (let i = 0; i < 150; i++) {
    const provider = mockProviders[Math.floor(Math.random() * mockProviders.length)]
    const gameType = mockGameTypes[Math.floor(Math.random() * mockGameTypes.length)]
    const volatility = mockVolatilities[Math.floor(Math.random() * mockVolatilities.length)]
    const theme = mockThemes[Math.floor(Math.random() * mockThemes.length)]
    
    const game: Game = {
      gameId: i + 1,
      gameName: gameNames[i % gameNames.length] + (i >= gameNames.length ? ` ${Math.floor(i / gameNames.length) + 1}` : ''),
      providerId: provider.providerId,
      providerName: provider.providerName,
      gameTypeId: gameType.gameTypeId,
      gameTypeName: gameType.gameTypeName,
      provider,
      gameType,
      volatilityId: volatility.volatilityID,
      volatility,
      themeId: theme.themeID,
      theme,
      minBetAmount: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
      maxBetAmount: Math.random() * 500 + 100, // 100 to 600
      rtpPercentage: Math.random() * 8 + 92, // 92% to 100%
      isMobile: Math.random() > 0.2, // 80% mobile compatible
      isDesktop: Math.random() > 0.1, // 90% desktop compatible
      isActive: Math.random() > 0.15, // 85% active
      hideInLobby: Math.random() > 0.9, // 10% hidden
      gameOrder: Math.floor(Math.random() * 1000),
      releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString(), // Last 3 years
      createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: `https://picsum.photos/200/150?random=${i + 1}`,
      description: `Experience the thrill of ${gameNames[i % gameNames.length]} with exciting features and great winning potential.`,
      features: ['Free Spins', 'Wild Symbols', 'Scatter Symbols', 'Bonus Rounds'].filter(() => Math.random() > 0.5),
      tags: ['Popular', 'New', 'Hot', 'Trending'].filter(() => Math.random() > 0.7),
    }
    
    games.push(game)
  }
  
  return games
}

export const mockGames = generateMockGames()

// Mock API service that simulates real API calls
export const mockApiService = {
  async getGames(params: {
    page?: number
    pageSize?: number
    search?: string
    provider?: number
    gameType?: number
    volatility?: number
    theme?: number
    isActive?: boolean
    isMobile?: boolean
    isDesktop?: boolean
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<Game>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
    
    const {
      page = 1,
      pageSize = 20,
      search,
      provider,
      gameType,
      volatility,
      theme,
      isActive,
      isMobile,
      isDesktop,
      sortBy = 'gameName',
      sortDirection = 'asc'
    } = params

    let filteredGames = [...mockGames]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredGames = filteredGames.filter(game =>
        game.gameName.toLowerCase().includes(searchLower) ||
        game.providerName?.toLowerCase().includes(searchLower) ||
        game.gameTypeName?.toLowerCase().includes(searchLower)
      )
    }

    if (provider) {
      filteredGames = filteredGames.filter(game => game.providerId === provider)
    }

    if (gameType) {
      filteredGames = filteredGames.filter(game => game.gameTypeId === gameType)
    }

    if (volatility) {
      filteredGames = filteredGames.filter(game => game.volatilityId === volatility)
    }

    if (theme) {
      filteredGames = filteredGames.filter(game => game.themeId === theme)
    }

    if (isActive !== undefined) {
      filteredGames = filteredGames.filter(game => game.isActive === isActive)
    }

    if (isMobile !== undefined) {
      filteredGames = filteredGames.filter(game => game.isMobile === isMobile)
    }

    if (isDesktop !== undefined) {
      filteredGames = filteredGames.filter(game => game.isDesktop === isDesktop)
    }

    // Apply sorting
    filteredGames.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Game]
      let bValue: any = b[sortBy as keyof Game]

      // Handle nested properties
      if (sortBy === 'providerName') {
        aValue = a.providerName || ''
        bValue = b.providerName || ''
      } else if (sortBy === 'gameTypeName') {
        aValue = a.gameTypeName || ''
        bValue = b.gameTypeName || ''
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      let comparison = 0
      if (aValue > bValue) comparison = 1
      if (aValue < bValue) comparison = -1

      return sortDirection === 'desc' ? -comparison : comparison
    })

    // Apply pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedGames = filteredGames.slice(startIndex, endIndex)

    return {
      items: paginatedGames,
      totalCount: filteredGames.length,
      pageNumber: page,
      pageSize,
      totalPages: Math.ceil(filteredGames.length / pageSize),
      hasNextPage: endIndex < filteredGames.length,
      hasPreviousPage: page > 1,
    }
  },

  async getProviders(): Promise<GameProvider[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockProviders
  },

  async getGameTypes(): Promise<GameType[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockGameTypes
  },

  async getVolatilities(): Promise<Volatility[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockVolatilities
  },

  async getThemes(): Promise<Theme[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockThemes
  },

  async getGame(gameId: number): Promise<Game | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockGames.find(game => game.gameId === gameId) || null
  },
}

// Override the real API service with mock data in development
if (process.env.NODE_ENV === 'development') {
  console.log('🎮 Using mock data service for games')
}
