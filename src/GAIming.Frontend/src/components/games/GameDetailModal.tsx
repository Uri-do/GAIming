import React, { useState } from 'react';
import { X, Save, BarChart3, Settings, TrendingUp, Users } from 'lucide-react';

interface GameDetailModalProps {
  game: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gameData: any) => void;
}

const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    gameName: game?.gameName || '',
    isActive: game?.isActive || false,
    hideInLobby: game?.hideInLobby || false,
    gameOrder: game?.gameOrder || 0,
    minBetAmount: game?.minBetAmount || 0,
    maxBetAmount: game?.maxBetAmount || 0,
    gameDescription: game?.gameDescription || '',
    tags: game?.tags || [],
    notes: game?.notes || ''
  });

  if (!isOpen || !game) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({ ...game, ...formData });
    onClose();
  };

  const tabs = [
    { id: 'details', label: 'Game Details', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
    { id: 'players', label: 'Players', icon: Users }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{game.gameName}</h2>
            <p className="text-gray-600">{game.providerName} • {game.gameTypeName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Name
                  </label>
                  <input
                    type="text"
                    value={formData.gameName}
                    onChange={(e) => handleInputChange('gameName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Order
                  </label>
                  <input
                    type="number"
                    value={formData.gameOrder}
                    onChange={(e) => handleInputChange('gameOrder', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Bet Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minBetAmount}
                    onChange={(e) => handleInputChange('minBetAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Bet Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxBetAmount}
                    onChange={(e) => handleInputChange('maxBetAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Game is Active
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hideInLobby"
                    checked={formData.hideInLobby}
                    onChange={(e) => handleInputChange('hideInLobby', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="hideInLobby" className="ml-2 text-sm text-gray-700">
                    Hide in Lobby
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Description
                </label>
                <textarea
                  value={formData.gameDescription}
                  onChange={(e) => handleInputChange('gameDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter game description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Players</h3>
                  <p className="text-3xl font-bold text-blue-600">{game.totalPlayers.toLocaleString()}</p>
                  <p className="text-sm text-blue-700 mt-1">+12% from last month</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">${game.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-700 mt-1">+8% from last month</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Popularity Score</h3>
                  <p className="text-3xl font-bold text-purple-600">{game.popularityScore}/10</p>
                  <p className="text-sm text-purple-700 mt-1">Above average</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RTP</span>
                      <span className="font-medium">{game.rtpPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retention Rate</span>
                      <span className="font-medium">{(game.retentionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Players</span>
                      <span className="font-medium">{game.activePlayer}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendation Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Recommendations</span>
                      <span className="font-medium">{game.recommendationCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Click-through Rate</span>
                      <span className="font-medium">{(game.recommendationCtr * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-medium">8.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Recommendation Settings</h3>
                <p className="text-yellow-800 mb-4">Configure how this game appears in recommendations</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Enable Recommendations</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendation Weight
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="1.0"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low Priority</span>
                      <span>Normal</span>
                      <span>High Priority</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Recommendations per Day
                    </label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Algorithm Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Collaborative Filtering</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Content-based</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hybrid</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Player Demographics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Players (30d)</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Returning Players</span>
                      <span className="font-medium">8,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIP Players</span>
                      <span className="font-medium">234</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Player Behavior</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Session Duration</span>
                      <span className="font-medium">24 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Bet Size</span>
                      <span className="font-medium">$2.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessions per Player</span>
                      <span className="font-medium">3.2</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Players</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Player ID</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Total Bets</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Sessions</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Last Played</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2 text-sm">PLR001234</td>
                        <td className="py-2 text-sm">$1,250</td>
                        <td className="py-2 text-sm">45</td>
                        <td className="py-2 text-sm">2 hours ago</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm">PLR005678</td>
                        <td className="py-2 text-sm">$980</td>
                        <td className="py-2 text-sm">32</td>
                        <td className="py-2 text-sm">1 day ago</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm">PLR009012</td>
                        <td className="py-2 text-sm">$750</td>
                        <td className="py-2 text-sm">28</td>
                        <td className="py-2 text-sm">3 hours ago</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetailModal;
