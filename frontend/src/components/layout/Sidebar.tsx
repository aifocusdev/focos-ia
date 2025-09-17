import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  LogOut,
  MessageSquare,
  Server,
  Tag,
  Smartphone,
  AppWindow,
  Zap,
  Users,
  UserCircle,
  Wifi,
  Settings
} from 'lucide-react'
import { useAuthStore } from '../../stores'
import { ConnectionIndicator } from '../ui/ConnectionStatus'

interface NavItem {
  path: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}

const navigationItems: NavItem[] = [
  {
    path: '/conversations',
    icon: MessageCircle,
    label: 'Conversas'
  },
  {
    path: '/servers',
    icon: Server,
    label: 'Servidores'
  },
  {
    path: '/devices',
    icon: Smartphone,
    label: 'Dispositivos'
  },
  {
    path: '/applications',
    icon: AppWindow,
    label: 'Aplicações'
  },
  {
    path: '/quick-replies',
    icon: Zap,
    label: 'Respostas Rápidas'
  },
  {
    path: '/tags',
    icon: Tag,
    label: 'Tags'
  }
]

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  // Add admin items if user is admin
  const allNavigationItems = React.useMemo(() => {
    const items = [...navigationItems]

    if (isAdmin) {
      // Add separator
      items.push({
        path: 'separator',
        icon: () => null,
        label: 'separator'
      } as any)

      // Add admin items
      items.push(
        {
          path: '/admin/users',
          icon: Users,
          label: 'Gerenciar Usuários'
        },
        {
          path: '/admin/contacts',
          icon: UserCircle,
          label: 'Gerenciar Contatos'
        },
        {
          path: '/admin/whatsapp-integration',
          icon: Wifi,
          label: 'Integração WhatsApp'
        }
      )
    }

    return items
  }, [isAdmin])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar h-full w-16 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="flex-shrink-0 p-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-800 to-red-900 rounded-xl flex items-center justify-center shadow-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {allNavigationItems.map((item, index) => {
          // Handle separator
          if (item.path === 'separator') {
            return (
              <div key={`separator-${index}`} className="my-4 border-t border-gray-700" />
            )
          }

          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                  group relative flex items-center justify-center w-12 h-12 rounded-xl 
                  transition-all duration-200 hover:bg-gray-800
                  ${isActive 
                    ? 'bg-red-900 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                  }
                `
              }
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Tooltip */}
              <div className="
                absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded-md
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 pointer-events-none z-50
                whitespace-nowrap
              ">
                {item.label}
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="flex-shrink-0 p-2 space-y-2">
        {/* Connection Status */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50">
          <ConnectionIndicator className="scale-90" />
        </div>

        {/* User Avatar */}
        <div className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gray-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          
          {/* User Tooltip */}
          <div className="
            absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-md
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 pointer-events-none z-50
            whitespace-nowrap
          ">
            <div className="font-medium">{user?.name || user?.username}</div>
            <div className="text-xs text-gray-300">Online</div>
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
            group relative flex items-center justify-center w-12 h-12 rounded-xl
            text-gray-400 hover:text-red-400 hover:bg-red-900/20
            transition-all duration-200
          "
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
          
          {/* Logout Tooltip */}
          <div className="
            absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded-md
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 pointer-events-none z-50
            whitespace-nowrap
          ">
            Sair
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default Sidebar