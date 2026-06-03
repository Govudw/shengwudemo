import type { ReactNode } from 'react'
import type { UseCaseCard } from '../data/mockData'

type IconProps = {
  className?: string
}

function IconSvg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function PlusIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconSvg>
  )
}

function XIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconSvg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconSvg>
  )
}

function FolderIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M3.5 7.5h6l2 2H20a1.5 1.5 0 0 1 1.5 1.5v6A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V9A1.5 1.5 0 0 1 4 7.5" />
      <path d="M3.5 7.5V6A1.5 1.5 0 0 1 5 4.5h4l2 2h4.5" />
    </IconSvg>
  )
}

function ChevronDownIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="m6 9 6 6 6-6" />
    </IconSvg>
  )
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="m9 6 6 6-6 6" />
    </IconSvg>
  )
}

function BellIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </IconSvg>
  )
}

function InfoIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </IconSvg>
  )
}

function SendIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="m21 3-8.5 18-3-8.5-8.5-3L21 3Z" />
      <path d="m9.5 12.5 4-4" />
    </IconSvg>
  )
}

function PinIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="m14 4 6 6-3 1-4 4v4l-2 2-4-4-4-4 2-2h4l4-4 1-3Z" />
      <path d="m9 15-6 6" />
    </IconSvg>
  )
}

function ArchiveIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M4 7h16" />
      <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
      <path d="M4 4h16v3H4z" />
      <path d="M10 11h4" />
    </IconSvg>
  )
}

function MoreHorizontalIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </IconSvg>
  )
}

function PanelRightIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M14.5 4v16" />
      <path d="M8 9h3" />
      <path d="M8 13h3" />
    </IconSvg>
  )
}

function MessageCircleIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L4 20.5l1.4-4.4A8.5 8.5 0 1 1 21 11.5Z" />
    </IconSvg>
  )
}

function ShareIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M4 12v7a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-7" />
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
    </IconSvg>
  )
}

function PencilIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M4 20h4l10.5-10.5a2.2 2.2 0 0 0-3-3L5 17v3Z" />
      <path d="m14 8 2 2" />
    </IconSvg>
  )
}

function TrashIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 13a1.8 1.8 0 0 0 1.8 1.5h6.4A1.8 1.8 0 0 0 17 20l1-13" />
      <path d="M9 7V4.5h6V7" />
    </IconSvg>
  )
}

function WarningIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M12 4 2.8 20h18.4L12 4Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </IconSvg>
  )
}

function MicIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </IconSvg>
  )
}

function TargetIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v4l3 3" />
    </IconSvg>
  )
}

function FlaskIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M9 3h6" />
      <path d="M10 3v5l-5.5 9.5A2.3 2.3 0 0 0 6.5 21h11a2.3 2.3 0 0 0 2-3.5L14 8V3" />
      <path d="M7 16h10" />
    </IconSvg>
  )
}

function DatabaseIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
    </IconSvg>
  )
}

function BrainIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M9 4.5A3 3 0 0 0 6 7.5 3.5 3.5 0 0 0 4 14a4 4 0 0 0 5 5" />
      <path d="M15 4.5a3 3 0 0 1 3 3 3.5 3.5 0 0 1 2 6.5 4 4 0 0 1-5 5" />
      <path d="M9 4.5V19" />
      <path d="M15 4.5V19" />
      <path d="M9 9H7" />
      <path d="M15 9h2" />
      <path d="M9 14H6.5" />
      <path d="M15 14h2.5" />
    </IconSvg>
  )
}

function ReportIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5" />
      <path d="M14 3.5V8h4" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </IconSvg>
  )
}

function PackageIcon({ className }: IconProps) {
  return (
    <IconSvg className={className}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
      <path d="m8 5.5 8 4.5" />
    </IconSvg>
  )
}

function CardIcon({ icon, className }: IconProps & { icon: UseCaseCard['icon'] }) {
  const icons: Record<UseCaseCard['icon'], (props: IconProps) => ReactNode> = {
    target: TargetIcon,
    flask: FlaskIcon,
    database: DatabaseIcon,
    brain: BrainIcon,
    report: ReportIcon,
    package: PackageIcon,
  }
  const Icon = icons[icon]

  return <Icon className={className} />
}

export {
  ArchiveIcon,
  BellIcon,
  BrainIcon,
  CardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  FlaskIcon,
  FolderIcon,
  InfoIcon,
  MessageCircleIcon,
  MicIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PanelRightIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  ReportIcon,
  SearchIcon,
  SendIcon,
  ShareIcon,
  TargetIcon,
  TrashIcon,
  WarningIcon,
  XIcon,
}
