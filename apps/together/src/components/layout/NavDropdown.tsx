import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavDropdownChild {
  to: string
  label: string
}

interface NavDropdownProps {
  icon: string
  label: string
  basePath: string
  children: NavDropdownChild[]
  isLocked?: boolean
}

export function NavDropdown({ icon, label, basePath, children, isLocked }: NavDropdownProps) {
  const location = useLocation()
  const isChildActive = location.pathname.startsWith(basePath)
  const [isOpen, setIsOpen] = useState(isChildActive)

  if (isLocked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 text-gray-400 cursor-not-allowed">
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
        <span className="ml-auto text-xs">🔒</span>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isChildActive
            ? 'bg-brand-primary/10 text-brand-primary font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
        <span className={`ml-auto text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="ml-6 mt-0.5 space-y-0.5">
          {children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end={child.to === basePath}
              className={({ isActive }) =>
                `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'text-brand-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
