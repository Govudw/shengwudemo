import { useEffect, useRef, useState } from 'react'
import logoSrc from '../assets/biomap-agent-logo.png'
import type { ActiveTopNav } from '../store/demoStoreLogic'
import { BellIcon, ChevronDownIcon } from './icons'

type TopNavProps = {
  activeItem: ActiveTopNav
  onNavigate: (item: TopNavItem) => void
  onNotify: (message: string) => void
  onAccountMenuSelect: (item: AccountMenuItem) => void
}

const navItems = ['Workspace', 'Projects', 'Assets', 'Capabilities'] as const
export type TopNavItem = (typeof navItems)[number]
export type PrimaryNavItem = TopNavItem
export type AccountMenuItem =
  | 'notification-center'
  | 'approval-center'
  | 'product-management-platform'

const navItemLabels: Record<TopNavItem, string> = {
  Workspace: 'Workspace',
  Projects: 'Projects',
  Assets: 'Assets',
  Capabilities: 'Capabilities',
}

const accountMenuOptions: { id: AccountMenuItem; label: string }[] = [
  { id: 'notification-center', label: '通知中心' },
  { id: 'approval-center', label: '审批中心' },
  { id: 'product-management-platform', label: '管理后台' },
]

function TopNav({
  activeItem,
  onNavigate,
  onNotify,
  onAccountMenuSelect,
}: TopNavProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!accountMenuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setAccountMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountMenuOpen])

  function handleAccountMenuSelect(item: AccountMenuItem) {
    setAccountMenuOpen(false)
    onAccountMenuSelect(item)
  }

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

        <div className="top-nav__account" ref={accountMenuRef}>
          <button
            type="button"
            className="top-nav__user"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
          >
            <span className="top-nav__avatar" aria-hidden="true">
              Z
            </span>
            <span className="top-nav__username">zhengjun</span>
            <ChevronDownIcon className="top-nav__chevron" />
          </button>
          {accountMenuOpen ? (
            <div className="top-nav__account-menu" role="menu">
              {accountMenuOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  className="top-nav__account-menu-item"
                  onClick={() => handleAccountMenuSelect(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default TopNav
