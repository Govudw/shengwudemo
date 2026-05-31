import logoSrc from '../assets/biomap-agent-logo.png'
import { BellIcon, ChevronDownIcon } from './icons'

type TopNavProps = {
  onNotify: (message: string) => void
}

const navItems = ['Workspace', 'Projects', 'Assets', 'Pipelines'] as const

function TopNav({ onNotify }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__brand" role="img" aria-label="BioMap Agent">
        <span className="top-nav__logo-crop" aria-hidden="true">
          <img className="top-nav__logo" src={logoSrc} alt="" />
        </span>
      </div>

      <nav className="top-nav__items" aria-label="Primary navigation">
        {navItems.map((item) => {
          const isActive = item === 'Workspace'

          return (
            <button
              key={item}
              type="button"
              className={`top-nav__item${isActive ? ' top-nav__item--active active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={
                isActive ? undefined : () => onNotify('该模块将在后续 Demo 中展开')
              }
            >
              {item}
            </button>
          )
        })}
      </nav>

      <div className="top-nav__actions">
        <button
          type="button"
          className="top-nav__bell"
          aria-label="Notifications"
          onClick={() => onNotify('Notification Center 将在后续 Demo 中展开')}
        >
          <BellIcon className="top-nav__icon" />
          <span className="top-nav__badge">3</span>
        </button>

        <button
          type="button"
          className="top-nav__user"
          onClick={() => onNotify('Account menu 将在后续 Demo 中展开')}
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
