import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useUserStore } from '../../../stores/userStore'
import { Button } from '../../ui/Button'

const UserFilters: React.FC = () => {
  const { setFilters, fetchUsers, loading } = useUserStore()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = async () => {
    const filters = searchValue.trim() ? { name: searchValue.trim() } : {}
    setFilters(filters)
    await fetchUsers(filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }


  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuários por nome ou username..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            loading={loading}
            disabled={loading}
            className="px-4 py-2"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UserFilters