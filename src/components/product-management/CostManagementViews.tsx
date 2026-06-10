import type { CostSection } from './costManagementMockData'

type CostManagementViewProps = {
  activeSection: CostSection
  onNotify: (message: string) => void
}

export function CostManagementView({ activeSection }: CostManagementViewProps) {
  const titleBySection: Record<CostSection, string> = {
    overview: '成本总览',
    items: '成本项管理',
    models: '成本模型',
    allocations: '成本分摊规则',
    versions: '成本版本记录',
  }

  return (
    <div className="management-workspace">
      <h1>{titleBySection[activeSection]}</h1>
    </div>
  )
}
