import { NavLink } from 'react-router-dom'
import { useUserRole } from '../../hooks/useUserRole'
import { NavDropdown } from './NavDropdown'

interface NavItemProps {
  to: string
  icon: string
  label: string
  locked?: boolean
  badge?: string
}

function NavItem({ to, icon, label, locked, badge }: NavItemProps) {
  if (locked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 text-gray-400 cursor-not-allowed">
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
        <span className="ml-auto text-xs">🔒</span>
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-brand-primary/10 text-brand-primary font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
      {badge && (
        <span className="ml-auto text-xs text-gray-500">{badge}</span>
      )}
    </NavLink>
  )
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </div>
  )
}

export function Sidebar() {
  const { role } = useUserRole()

  const hasCoachAccess = role === 'client' || role === 'coach' || role === 'admin'
  const isCoach = role === 'coach' || role === 'admin'

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo/Title */}
      <div className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg font-bold text-brand-primary">Together</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {/* PRIMARY */}
        <div className="mb-4 space-y-0.5">
          <NavItem to="/" icon="🏠" label="Home" />
          <NavItem to="/campfire" icon="🔥" label="Campfire" />
          <NavItem to="/exchange" icon="🤝" label="Exchange" />
        </div>

        {/* TOOLS */}
        <div className="mb-4">
          <SectionLabel title="Tools" />
          <div className="mt-1 space-y-0.5">
            <NavDropdown
              icon="⚡"
              label="Impacts"
              basePath="/impacts"
              children={[
                { to: '/impacts', label: 'About Impacts' },
                { to: '/impacts/self', label: 'For Yourself' },
                { to: '/impacts/others', label: 'For Others' },
              ]}
            />
            <NavDropdown
              icon="📈"
              label="Insights"
              basePath="/insights"
              children={[
                { to: '/insights', label: 'About Insights' },
                { to: '/insights/self', label: 'For Yourself' },
                { to: '/insights/others', label: 'For Others' },
              ]}
            />
            <NavDropdown
              icon="✨"
              label="Inspirations"
              basePath="/inspirations"
              children={[
                { to: '/inspirations', label: 'About Inspirations' },
                { to: '/inspirations/self', label: 'For Yourself' },
                { to: '/inspirations/others', label: 'For Others' },
              ]}
            />
          </div>
        </div>

        {/* DIRECTION */}
        <div className="mb-4">
          <SectionLabel title="Direction" />
          <div className="mt-1 space-y-0.5">
            <NavItem to="/map" icon="🧭" label="Map" locked={!hasCoachAccess} />
            <NavItem to="/chat" icon="💬" label="Chat" locked={!hasCoachAccess} />
          </div>
        </div>
      </nav>

      {/* Bottom utility */}
      <div className="border-t border-gray-200 px-2 py-4 space-y-0.5">
        <NavItem to="/profile" icon="👤" label="Profile" />
        <NavItem to="/learn" icon="📖" label="Learn" />

        {isCoach && (
          <>
            <div className="my-2 border-t border-gray-100" />
            <NavItem to="/coach/clients" icon="👥" label="Coach View" />
          </>
        )}
      </div>
    </aside>
  )
}
