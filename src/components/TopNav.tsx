import logoSrc from '../assets/biomap-agent-logo.png'
import type { ActiveTopNav } from '../store/demoStoreLogic'
import { BellIcon, ChevronDownIcon } from './icons'

type TopNavProps = {
  activeItem: ActiveTopNav
  onNavigate: (item: TopNavItem) => void
  onNotify: (message: string) => void
}

const navItems = ['Workspace', 'Projects', 'Assets', 'Capabilities'] as const
export type TopNavItem = (typeof navItems)[number]
export type PrimaryNavItem = TopNavItem

const navItemLabels: Record<TopNavItem, string> = {
  Workspace: 'Workspace',
  Projects: 'Projects',
  Assets: 'Assets',
  Capabilities: 'Capabilities',
}

function TopNav({ activeItem, onNavigate, onNotify }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__brand" role="img" aria-label="BioMap Agent">
        <span className="top-nav__logo-crop" aria-hidden="true">
          <img className="top-nav__logo" src={logoSrc} alt="" />
        </span>
      </div>

      <nav className="top-nav__items" aria-label="主导航">
        {navItems.map((item) => {
          const isActive = item === activeItem

          return (
            <button
              key={item}
              type="button"
              className={`top-nav__item${isActive ? ' top-nav__item--active active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item)}
            >
              {navItemLabels[item]}
            </button>
          )
        })}
      </nav>

      <div className="top-nav__actions">
        <button
          type="button"
          className="top-nav__bell"
          aria-label="通知"
          onClick={() => onNotify('通知中心尚未接入当前工作区')}
        >
          <BellIcon className="top-nav__icon" />
          <span className="top-nav__badge">3</span>
        </button>

        <button
          type="button"
          className="top-nav__user"
          onClick={() => onNotify('账户菜单尚未接入当前工作区')}
        >
          <span className="top-nav__avatar" aria-hidden="true">
            Z
          </span>
          <span className="top-nav__username">zhengjun</span>
          <ChevronDownIcon className="top-nav__chevron" />
        </button>
      </div>
    </header>
  )
}

export default TopNav
