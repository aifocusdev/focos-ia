import React from 'react'
import { MessageCircle, Menu, User } from 'lucide-react'
import { useAuth } from '../../hooks/auth'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const Navbar: React.FC = () => {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const { toggleOpen } = useSidebarStore()

  // Only render on mobile
  if (!isMobile) {
    return null
  }

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700 md:hidden">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          {/* Menu button and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleOpen}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-2 text-lg font-bold text-white">
                FOCOS IA
              </h1>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2">
            {user && (
              <div className="flex items-center text-gray-300">
                <User className="w-4 h-4 mr-1" />
                <span className="text-sm">{user.username}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar