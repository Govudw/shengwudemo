import type { TargetSection } from './targetManagementMockData'

type TargetManagementViewProps = {
  activeSection: TargetSection
  onNotify: (message: string) => void
}

export function TargetManagementView({ activeSection }: TargetManagementViewProps) {
  const titleBySection: Record<TargetSection, string> = {
    overview: '目标总览',
    quarterly: '季度目标',
    contributions: '商品贡献',
    margins: '成本与毛利',
    versions: '目标版本记录',
  }

  return (
    <div className="management-workspace">
      <h1>{titleBySection[activeSection]}</h1>
    </div>
  )
}
