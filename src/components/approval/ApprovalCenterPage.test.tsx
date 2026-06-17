// @vitest-environment happy-dom

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApprovalCenterSectionId } from '../../data/approvalCenterMockData'
import ApprovalCenterPage from './ApprovalCenterPage'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('ApprovalCenterPage', () => {
  it('opens on the overview dashboard by default', () => {
    const { root } = renderApprovalCenterPage()

    expect(getHeading('审批中心')).not.toBeNull()
    expect(getText('待处理审批')).not.toBeNull()
    expect(getText('最近审批记录')).not.toBeNull()

    root.unmount()
  })

  it('groups approval navigation into workbench records configuration and integrations', () => {
    const { root } = renderApprovalCenterPage()

    expect(getExactText('审批工作台')).not.toBeNull()
    expect(getExactText('记录')).not.toBeNull()
    expect(getExactText('配置')).not.toBeNull()
    expect(getExactText('集成')).not.toBeNull()
    expect(getButton('总览').getAttribute('aria-current')).toBe('page')

    root.unmount()
  })

  it('localizes overview connector statuses without exposing raw enum values', () => {
    const { root } = renderApprovalCenterPage()

    expect(getText('正常 · 已同步')).not.toBeNull()
    expect(getText('异常 · 回调异常')).not.toBeNull()
    expect(getText('停用 · 无需同步')).not.toBeNull()
    expect(document.body.textContent).not.toMatch(/\b(healthy|warning|disabled)\b/)

    root.unmount()
  })

  it('shows external approval connectors as black-box integrations', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('外部审批').click()
    })

    expect(getHeading('外部审批')).not.toBeNull()
    expect(getText('外部系统拥有自己的流程')).not.toBeNull()
    expect(getText('企业微信 CRO 审批流')).not.toBeNull()

    root.unmount()
  })

  it('keeps external connector endpoints behind detail disclosure', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('外部审批').click()
    })

    expect(getText('已配置 3 个端点')).not.toBeNull()
    expect(getText('提交端点')).toBeNull()
    expect(getText('回调端点')).toBeNull()
    expect(getText('撤回端点')).toBeNull()

    act(() => {
      getButtons('查看详情')[0].click()
    })

    expect(getText('提交端点')).not.toBeNull()
    expect(getText('回调端点')).not.toBeNull()
    expect(getText('撤回端点')).not.toBeNull()

    root.unmount()
  })

  it('renders simulation output for a CRO order', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('模拟测试').click()
    })

    expect(getText('匹配规则')).not.toBeNull()
    expect(getText('CRO 订单企业审批')).not.toBeNull()
    expect(getText('外部系统处理')).not.toBeNull()

    root.unmount()
  })

  it('shows complete governance metadata across rules, flows, groups and connectors', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('操作规则').click()
    })
    expect(getText('查看版本')).not.toBeNull()

    act(() => {
      getButton('审批流程').click()
    })
    expect(getText('审批模式')).not.toBeNull()
    expect(getText('任一通过')).not.toBeNull()
    expect(getText('可要求补充')).not.toBeNull()

    act(() => {
      getButton('审批人组').click()
    })
    expect(getText('使用流程')).not.toBeNull()
    expect(getText('实验订单标准审批')).not.toBeNull()

    act(() => {
      getButton('外部审批').click()
    })

    act(() => {
      getButtons('查看详情')[0].click()
    })

    expect(getText('提交端点')).not.toBeNull()
    expect(getText('回调端点')).not.toBeNull()
    expect(getText('撤回端点')).not.toBeNull()
    expect(getText('认证')).not.toBeNull()
    expect(getText('最近同步时间')).not.toBeNull()

    root.unmount()
  })

  it('keeps pending approval table focused on compact default columns', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('待处理').click()
    })

    expect(getTableHeaders()).toEqual([
      '标题',
      '类型',
      '状态',
      '当前节点',
      '更新时间',
      '更多',
    ])
    expect(getTableHeaders()).not.toContain('项目')
    expect(getTableHeaders()).not.toContain('发起人')
    expect(getTableHeaders()).not.toContain('风险等级')

    root.unmount()
  })

  it('uses the inspector grid column only while a detail inspector is open', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('待处理').click()
    })

    const closedLayout = getDetailLayouts()[0]
    expect(closedLayout?.classList.contains('approval-center__detail-layout--inspector-open')).toBe(false)

    act(() => {
      getButtons('查看详情')[0].click()
    })

    const openLayout = getDetailLayouts()[0]
    expect(openLayout?.classList.contains('approval-center__detail-layout--inspector-open')).toBe(true)

    root.unmount()
  })

  it('keeps initiated approval table focused on compact default columns', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('我发起的').click()
    })

    expect(getTableHeaders()).toEqual([
      '标题',
      '类型',
      '状态',
      '当前节点',
      '更新时间',
      '更多',
    ])
    expect(getTableHeaders()).not.toContain('项目')
    expect(getTableHeaders()).not.toContain('发起人')
    expect(getTableHeaders()).not.toContain('风险等级')

    root.unmount()
  })

  it('keeps approval record table focused on compact immutable columns', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('审批记录').click()
    })

    expect(getTableHeaders()).toEqual([
      '标题',
      '类型',
      '状态',
      '结果',
      '更新时间',
      '更多',
    ])
    expect(getTableHeaders()).not.toContain('项目')
    expect(getTableHeaders()).not.toContain('发起人')
    expect(getTableHeaders()).not.toContain('风险等级')

    root.unmount()
  })

  it('keeps external connector table focused on compact integration columns', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('外部审批').click()
    })

    expect(getTableHeaders()).toEqual([
      '连接器',
      '来源',
      '状态',
      '外部流程',
      '同步策略',
      '审计',
      '更多',
    ])
    expect(getTableHeaders()).not.toContain('提交端点')
    expect(getTableHeaders()).not.toContain('回调端点')
    expect(getTableHeaders()).not.toContain('撤回端点')

    root.unmount()
  })

  it('notifies when approving a pending request in demo mode', () => {
    const onNotify = vi.fn()
    const { root } = renderApprovalCenterPage({ onNotify })

    act(() => {
      getButton('待处理').click()
    })
    act(() => {
      getButtons('通过')[0].click()
    })

    expect(onNotify).toHaveBeenCalledWith('已在 Demo 中记录审批动作')

    root.unmount()
  })

  it('adds row-specific aria labels to repeated approval actions', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('待处理').click()
    })

    expect(getButtons('查看详情')[0].getAttribute('aria-label')).toBe(
      '查看 Publish EGFR GraphRAG KnowledgeBase to public scope 详情',
    )
    expect(getButtons('查看资料包')[0].getAttribute('aria-label')).toBe(
      '查看 Publish EGFR GraphRAG KnowledgeBase to public scope 资料包',
    )
    expect(getButtons('通过')[0].getAttribute('aria-label')).toBe(
      '通过 Publish EGFR GraphRAG KnowledgeBase to public scope',
    )

    act(() => {
      getButton('外部审批').click()
    })

    expect(getButtons('查看详情')[0].getAttribute('aria-label')).toBe(
      '查看 企业微信 CRO 审批流 详情',
    )

    root.unmount()
  })

  it('shows pending approval due time in the request inspector', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('待处理').click()
    })
    act(() => {
      getButtons('查看详情')[0].click()
    })

    expect(getExactText('时间状态')).not.toBeNull()
    expect(getExactText('截止时间')).not.toBeNull()
    expect(getExactText('2026-06-16 11:00:00')).not.toBeNull()

    root.unmount()
  })

  it('shows initiated approval creation time in the request inspector', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('我发起的').click()
    })
    act(() => {
      getButtons('查看详情')[0].click()
    })

    expect(getExactText('创建时间')).not.toBeNull()
    expect(getText('2026-06-15 09:18:00')).not.toBeNull()

    root.unmount()
  })

  it('shows completed approval time in immutable record inspectors', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('审批记录').click()
    })
    act(() => {
      getButtons('查看详情')[0].click()
    })

    expect(getExactText('完成时间')).not.toBeNull()
    expect(getText('2026-06-15 10:22:00')).not.toBeNull()

    root.unmount()
  })

  it('hydrates the inspector from controlled approval state props', () => {
    const { root } = renderApprovalCenterPage({
      initialActiveSection: 'pending',
      initialInspectorOpen: true,
      initialSelectedObjectId: 'BM-APR-20260615-002',
    })

    expect(getHeading('待处理审批')).not.toBeNull()
    expect(getExactText('审批编号')).not.toBeNull()
    expect(getExactText('BM-APR-20260615-002')).not.toBeNull()

    root.unmount()
  })

  it('does not expose local approval decisions for external pending records', () => {
    const { root } = renderApprovalCenterPage()

    act(() => {
      getButton('待处理').click()
    })

    expect(getText('外部系统跟踪')).not.toBeNull()
    expect(getText('重试同步')).not.toBeNull()
    expect(getText('撤回状态')).not.toBeNull()

    root.unmount()
  })
})

type RenderApprovalCenterPageOptions = {
  onNotify?: (message: string) => void
  initialActiveSection?: ApprovalCenterSectionId
  initialInspectorOpen?: boolean
  initialSelectedObjectId?: string | null
}

function ApprovalCenterPageHarness({
  onNotify = () => undefined,
  initialActiveSection = 'overview',
  initialInspectorOpen = false,
  initialSelectedObjectId = null,
}: RenderApprovalCenterPageOptions) {
  const [activeSection, setActiveSection] =
    useState<ApprovalCenterSectionId>(initialActiveSection)
  const [inspectorOpen, setInspectorOpen] = useState(initialInspectorOpen)
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
    initialSelectedObjectId,
  )

  return (
    <ApprovalCenterPage
      activeSection={activeSection}
      inspectorOpen={inspectorOpen}
      selectedObjectId={selectedObjectId}
      onNotify={onNotify}
      onSectionChange={(section) => {
        setActiveSection(section)
        setInspectorOpen(false)
        setSelectedObjectId(null)
      }}
      onSelectObject={(objectId, open = objectId !== null) => {
        setSelectedObjectId(objectId)
        setInspectorOpen(open)
      }}
    />
  )
}

function renderApprovalCenterPage(
  options: RenderApprovalCenterPageOptions = {},
): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(<ApprovalCenterPageHarness {...options} />)
  })

  return { container, root }
}

function getHeading(name: string): HTMLHeadingElement | null {
  return Array.from(document.querySelectorAll<HTMLHeadingElement>('h1, h2')).find(
    (heading) => heading.textContent === name,
  ) ?? null
}

function getButton(name: string): HTMLButtonElement {
  const button = getButtons(name)[0]

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}

function getButtons(name: string): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button')).filter(
    (button) => button.textContent === name,
  )
}

function getText(text: string): Element | null {
  return Array.from(document.querySelectorAll('body *')).find((element) =>
    element.textContent?.includes(text),
  ) ?? null
}

function getExactText(text: string): Element | null {
  return Array.from(document.querySelectorAll('body *')).find(
    (element) => element.textContent === text,
  ) ?? null
}

function getTableHeaders(): string[] {
  return Array.from(document.querySelectorAll<HTMLTableCellElement>('th')).map(
    (header) => header.textContent ?? '',
  )
}

function getDetailLayouts(): HTMLDivElement[] {
  return Array.from(
    document.querySelectorAll<HTMLDivElement>('.approval-center__detail-layout'),
  )
}
