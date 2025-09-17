import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useSidebarStore } from '../../stores/sidebarStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile()
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Navbar */}
          <Navbar />
          
          {/* Main Content */}
          <main className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isMobile ? '' : (isCollapsed ? 'ml-0' : 'ml-0')}
          `}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout