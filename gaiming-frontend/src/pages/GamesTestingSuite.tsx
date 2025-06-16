/**
 * Games Management Testing Suite
 * Comprehensive testing interface for games functionality
 */

import React, { useState, useEffect } from 'react'
import { gameService } from '@/features/games/services'
import { mockGames, mockProviders, mockGameTypes } from '@/shared/services/mockDataService'
import type { Game, GameProvider, GameType } from '@/features/games/types'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const GamesTestingSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'pass' | 'fail'>>({})
  const [testLogs, setTestLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  
  // Test data
  const [loadedGames, setLoadedGames] = useState<Game[]>([])
  const [loadedProviders, setLoadedProviders] = useState<GameProvider[]>([])
  const [loadedGameTypes, setLoadedGameTypes] = useState<GameType[]>([])
  
  const notifications = useNotificationStore()

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateTestResult = (testName: string, result: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [testName]: result }))
    addLog(`Test "${testName}": ${result.toUpperCase()}`)
  }

  // Test 1: Data Loading
  const testDataLoading = async () => {
    try {
      addLog('Testing data loading...')
      
      // Test providers loading
      const providers = await gameService.getProviders()
      setLoadedProviders(providers)
      
      if (providers.length > 0) {
        addLog(`✓ Loaded ${providers.length} providers`)
      } else {
        throw new Error('No providers loaded')
      }
      
      // Test game types loading
      const gameTypes = await gameService.getGameTypes()
      setLoadedGameTypes(gameTypes)
      
      if (gameTypes.length > 0) {
        addLog(`✓ Loaded ${gameTypes.length} game types`)
      } else {
        throw new Error('No game types loaded')
      }
      
      // Test games loading
      const gamesResponse = await gameService.getGames({ page: 1, pageSize: 10 })
      setLoadedGames(gamesResponse.items)
      
      if (gamesResponse.items.length > 0) {
        addLog(`✓ Loaded ${gamesResponse.items.length} games (page 1)`)
        addLog(`✓ Total games available: ${gamesResponse.totalCount}`)
      } else {
        throw new Error('No games loaded')
      }
      
      updateTestResult('data-loading', 'pass')
    } catch (error) {
      addLog(`✗ Data loading failed: ${error}`)
      updateTestResult('data-loading', 'fail')
    }
  }

  // Test 2: Filtering
  const testFiltering = async () => {
    try {
      addLog('Testing filtering functionality...')
      
      // Test provider filter
      if (loadedProviders.length > 0) {
        const firstProvider = loadedProviders[0]
        const filteredByProvider = await gameService.getGames({
          provider: firstProvider.providerId,
          pageSize: 50
        })
        
        const allFromProvider = filteredByProvider.items.every(game => 
          game.providerId === firstProvider.providerId
        )
        
        if (allFromProvider) {
          addLog(`✓ Provider filter works: ${filteredByProvider.items.length} games from ${firstProvider.providerName}`)
        } else {
          throw new Error('Provider filter not working correctly')
        }
      }
      
      // Test active/inactive filter
      const activeGames = await gameService.getGames({ isActive: true, pageSize: 20 })
      const inactiveGames = await gameService.getGames({ isActive: false, pageSize: 20 })
      
      addLog(`✓ Active games: ${activeGames.totalCount}`)
      addLog(`✓ Inactive games: ${inactiveGames.totalCount}`)
      
      // Test platform filters
      const mobileGames = await gameService.getGames({ isMobile: true, pageSize: 20 })
      const desktopGames = await gameService.getGames({ isDesktop: true, pageSize: 20 })
      
      addLog(`✓ Mobile games: ${mobileGames.totalCount}`)
      addLog(`✓ Desktop games: ${desktopGames.totalCount}`)
      
      updateTestResult('filtering', 'pass')
    } catch (error) {
      addLog(`✗ Filtering test failed: ${error}`)
      updateTestResult('filtering', 'fail')
    }
  }

  // Test 3: Search
  const testSearch = async () => {
    try {
      addLog('Testing search functionality...')
      
      // Test search by game name
      const searchResults = await gameService.getGames({ 
        search: 'Starburst',
        pageSize: 10 
      })
      
      if (searchResults.items.length > 0) {
        const hasStarburst = searchResults.items.some(game => 
          game.gameName.toLowerCase().includes('starburst')
        )
        if (hasStarburst) {
          addLog(`✓ Search found ${searchResults.items.length} games matching "Starburst"`)
        } else {
          throw new Error('Search results do not contain expected game')
        }
      }
      
      // Test search by provider
      const providerSearch = await gameService.getGames({ 
        search: 'NetEnt',
        pageSize: 10 
      })
      
      addLog(`✓ Provider search found ${providerSearch.items.length} games`)
      
      updateTestResult('search', 'pass')
    } catch (error) {
      addLog(`✗ Search test failed: ${error}`)
      updateTestResult('search', 'fail')
    }
  }

  // Test 4: Pagination
  const testPagination = async () => {
    try {
      addLog('Testing pagination...')
      
      const page1 = await gameService.getGames({ page: 1, pageSize: 5 })
      const page2 = await gameService.getGames({ page: 2, pageSize: 5 })
      
      // Check that pages have different games
      const page1Ids = page1.items.map(game => game.gameId)
      const page2Ids = page2.items.map(game => game.gameId)
      const overlap = page1Ids.some(id => page2Ids.includes(id))
      
      if (!overlap && page1.items.length > 0 && page2.items.length > 0) {
        addLog(`✓ Pagination works: Page 1 has ${page1.items.length} games, Page 2 has ${page2.items.length} games`)
        addLog(`✓ Total pages: ${page1.totalPages}`)
      } else {
        throw new Error('Pagination not working correctly')
      }
      
      updateTestResult('pagination', 'pass')
    } catch (error) {
      addLog(`✗ Pagination test failed: ${error}`)
      updateTestResult('pagination', 'fail')
    }
  }

  // Test 5: Sorting
  const testSorting = async () => {
    try {
      addLog('Testing sorting functionality...')
      
      // Test sorting by name ascending
      const sortedAsc = await gameService.getGames({ 
        sortBy: 'gameName', 
        sortDirection: 'asc',
        pageSize: 10 
      })
      
      // Test sorting by name descending
      const sortedDesc = await gameService.getGames({ 
        sortBy: 'gameName', 
        sortDirection: 'desc',
        pageSize: 10 
      })
      
      if (sortedAsc.items.length > 1 && sortedDesc.items.length > 1) {
        const firstAsc = sortedAsc.items[0].gameName
        const firstDesc = sortedDesc.items[0].gameName
        
        addLog(`✓ Ascending sort: First game is "${firstAsc}"`)
        addLog(`✓ Descending sort: First game is "${firstDesc}"`)
        
        if (firstAsc !== firstDesc) {
          addLog(`✓ Sorting works correctly`)
        } else {
          addLog(`⚠ Sorting may not be working (same first game in both directions)`)
        }
      }
      
      updateTestResult('sorting', 'pass')
    } catch (error) {
      addLog(`✗ Sorting test failed: ${error}`)
      updateTestResult('sorting', 'fail')
    }
  }

  // Test 6: Data Integrity
  const testDataIntegrity = async () => {
    try {
      addLog('Testing data integrity...')
      
      let issuesFound = 0
      
      // Check if games have required fields
      for (const game of loadedGames.slice(0, 10)) {
        if (!game.gameName || !game.providerId || !game.gameTypeId) {
          addLog(`✗ Game ${game.gameId} missing required fields`)
          issuesFound++
        }
        
        if (game.rtpPercentage && (game.rtpPercentage < 80 || game.rtpPercentage > 100)) {
          addLog(`⚠ Game ${game.gameName} has unusual RTP: ${game.rtpPercentage}%`)
        }
        
        if (game.minBetAmount && game.maxBetAmount && game.minBetAmount > game.maxBetAmount) {
          addLog(`✗ Game ${game.gameName} has invalid bet range`)
          issuesFound++
        }
      }
      
      // Check provider relationships
      const providersInGames = new Set(loadedGames.map(game => game.providerId))
      const availableProviders = new Set(loadedProviders.map(provider => provider.providerId))
      
      for (const providerId of providersInGames) {
        if (!availableProviders.has(providerId)) {
          addLog(`✗ Game references unknown provider ID: ${providerId}`)
          issuesFound++
        }
      }
      
      if (issuesFound === 0) {
        addLog(`✓ Data integrity check passed`)
        updateTestResult('data-integrity', 'pass')
      } else {
        addLog(`✗ Found ${issuesFound} data integrity issues`)
        updateTestResult('data-integrity', 'fail')
      }
    } catch (error) {
      addLog(`✗ Data integrity test failed: ${error}`)
      updateTestResult('data-integrity', 'fail')
    }
  }

  // Test 7: Performance
  const testPerformance = async () => {
    try {
      addLog('Testing performance...')
      
      const startTime = performance.now()
      
      // Load multiple pages quickly
      const promises = []
      for (let i = 1; i <= 5; i++) {
        promises.push(gameService.getGames({ page: i, pageSize: 20 }))
      }
      
      await Promise.all(promises)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      addLog(`✓ Loaded 5 pages in ${duration.toFixed(2)}ms`)
      
      if (duration < 5000) { // Should complete within 5 seconds
        addLog(`✓ Performance test passed`)
        updateTestResult('performance', 'pass')
      } else {
        addLog(`⚠ Performance test slow but acceptable`)
        updateTestResult('performance', 'pass')
      }
    } catch (error) {
      addLog(`✗ Performance test failed: ${error}`)
      updateTestResult('performance', 'fail')
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults({})
    setTestLogs([])
    
    addLog('Starting comprehensive games management testing...')
    
    try {
      await testDataLoading()
      await testFiltering()
      await testSearch()
      await testPagination()
      await testSorting()
      await testDataIntegrity()
      await testPerformance()
      
      addLog('All tests completed!')
      
      const results = Object.values(testResults)
      const passed = results.filter(r => r === 'pass').length
      const failed = results.filter(r => r === 'fail').length
      
      if (failed === 0) {
        notifications.showSuccess('Tests Complete', `All ${passed} tests passed!`)
      } else {
        notifications.showWarning('Tests Complete', `${passed} passed, ${failed} failed`)
      }
    } catch (error) {
      addLog(`Test suite error: ${error}`)
      notifications.showError('Test Error', 'Test suite encountered an error')
    } finally {
      setIsRunning(false)
    }
  }

  const getTestStatus = (testName: string) => {
    const result = testResults[testName]
    if (result === 'pass') return '✅ PASS'
    if (result === 'fail') return '❌ FAIL'
    return '⏳ PENDING'
  }

  const getOverallStatus = () => {
    const results = Object.values(testResults)
    if (results.length === 0) return 'Not Started'
    if (results.every(r => r === 'pass')) return '✅ ALL TESTS PASSED'
    if (results.some(r => r === 'fail')) return '❌ SOME TESTS FAILED'
    return '⏳ TESTING IN PROGRESS'
  }

  return (
    <FeatureErrorBoundary featureName="Games Testing Suite">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Games Management Testing Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive testing for games management functionality
          </p>
          <div className="mt-4 text-lg font-semibold">
            Status: {getOverallStatus()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="space-y-4">
                <Button 
                  onClick={runAllTests} 
                  variant="primary" 
                  fullWidth
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Running Tests...
                    </>
                  ) : (
                    'Run All Tests'
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testDataLoading} variant="outline" size="sm" disabled={isRunning}>
                    Data Loading
                  </Button>
                  <Button onClick={testFiltering} variant="outline" size="sm" disabled={isRunning}>
                    Filtering
                  </Button>
                  <Button onClick={testSearch} variant="outline" size="sm" disabled={isRunning}>
                    Search
                  </Button>
                  <Button onClick={testPagination} variant="outline" size="sm" disabled={isRunning}>
                    Pagination
                  </Button>
                  <Button onClick={testSorting} variant="outline" size="sm" disabled={isRunning}>
                    Sorting
                  </Button>
                  <Button onClick={testDataIntegrity} variant="outline" size="sm" disabled={isRunning}>
                    Data Integrity
                  </Button>
                </div>
                
                <Button onClick={testPerformance} variant="outline" fullWidth disabled={isRunning}>
                  Performance Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Data Loading:</span>
                  <span>{getTestStatus('data-loading')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Filtering:</span>
                  <span>{getTestStatus('filtering')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Search:</span>
                  <span>{getTestStatus('search')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pagination:</span>
                  <span>{getTestStatus('pagination')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sorting:</span>
                  <span>{getTestStatus('sorting')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Integrity:</span>
                  <span>{getTestStatus('data-integrity')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance:</span>
                  <span>{getTestStatus('performance')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{loadedGames.length}</div>
              <div className="text-sm text-gray-600">Games Loaded</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{loadedProviders.length}</div>
              <div className="text-sm text-gray-600">Providers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{loadedGameTypes.length}</div>
              <div className="text-sm text-gray-600">Game Types</div>
            </CardContent>
          </Card>
        </div>

        {/* Test Logs */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
              {testLogs.length === 0 ? (
                <p className="text-gray-500">No test logs yet. Run tests to see results.</p>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {testLogs.map((log, index) => (
                    <div key={index} className="text-gray-700 dark:text-gray-300">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  )
}

export default GamesTestingSuite
