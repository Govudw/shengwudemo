// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    expect(getText('提交端点')).not.toBeNull()
    expect(getText('回调端点')).not.toBeNull()
    expect(getText('撤回端点')).not.toBeNull()
    expect(getText('认证')).not.toBeNull()
    expect(getText('最近同步时间')).not.toBeNull()

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

function renderApprovalCenterPage(
  props: Partial<React.ComponentProps<typeof ApprovalCenterPage>> = {},
): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(<ApprovalCenterPage onNotify={() => undefined} {...props} />)
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
