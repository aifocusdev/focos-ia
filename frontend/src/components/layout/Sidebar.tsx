import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, Users, MessageSquare, LogOut, X, UserCheck } from 'lucide-react'
import { useAuth } from '../../hooks/auth'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { logout } = useAuth()
  const isMobile = useIsMobile()
  const { isOpen, isCollapsed, setOpen } = useSidebarStore()

  const menuItems = [
    { path: '/users', label: 'Usuários', icon: Users },
    { path: '/contacts', label: 'Contatos', icon: UserCheck },
    { path: '/whatsapp-integration', label: 'WhatsApp', icon: MessageSquare }
  ]

  const handleLogout = () => {
    logout()
  }

  const handleMenuClick = () => {
    if (isMobile) {
      setOpen(false)
    }
  }

  const closeSidebar = () => {
    setOpen(false)
  }

  // Don't render on mobile when closed
  if (isMobile && !isOpen) {
    return null
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'sticky'} top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 z-50
        transition-all duration-300 ease-in-out
        ${isMobile ? 'w-80' : (isCollapsed ? 'w-20' : 'w-64')}
        ${isMobile && isOpen ? 'translate-x-0' : ''}
        ${isMobile && !isOpen ? '-translate-x-full' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <h1 className="ml-3 text-xl font-bold text-white">
                  FOCOS IA
                </h1>
              )}
            </div>
            
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={closeSidebar}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (item.path === '/users' && location.pathname === '/')
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={handleMenuClick}
                      className={`
                        flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-red-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && (
                        <span>{item.label}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className={`
                flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-white 
                hover:bg-red-900 rounded-lg transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Sair' : undefined}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar