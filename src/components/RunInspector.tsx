import { useState } from 'react'
import type { ReactNode } from 'react'
import type {
  RunInspectorCapabilityRunItem,
  RunInspectorData,
} from '../data/conversationTypes'
import { ChevronRightIcon } from './icons'

type RunInspectorProps = {
  data?: RunInspectorData
}

const summaryStatusLabels: Record<RunInspectorData['summary']['status'], string> = {
  notStarted: '未开始',
  running: '运行中',
  waiting: '等待中',
  completed: '已完成',
  blocked: '受阻',
}

const progressStatusLabels: Record<RunInspectorData['progress'][number]['status'], string> = {
  done: '完成',
  active: '进行中',
  waiting: '等待',
  blocked: '受阻',
}

const outputKindLabels: Record<RunInspectorData['outputs'][number]['kind'], string> = {
  projectFile: '项目文件',
  experimentOrder: '实验订单',
  report: '报告',
  dataset: '数据集',
  figure: '图表',
}

const outputStatusLabels: Record<RunInspectorData['outputs'][number]['status'], string> = {
  draft: '草稿',
  saved: '已保存',
  submitted: '已提交',
  completed: '已完成',
}

const approvalKindLabels: Record<RunInspectorData['approvals'][number]['kind'], string> = {
  humanConfirmation: '人工确认',
  approvalRequest: '审批',
}

const approvalStatusLabels: Record<RunInspectorData['approvals'][number]['status'], string> = {
  pending: '待处理',
  confirmed: '已确认',
  approved: '已审批',
}

const capabilityStatusLabels: Record<RunInspectorCapabilityRunItem['status'], string> = {
  success: '成功',
  failed: '失败',
  warning: '警告',
}

function RunInspector({ data }: RunInspectorProps) {
  const [expandedRuns, setExpandedRuns] = useState<Record<string, boolean>>({})

  if (!data) {
    return (
      <section className="run-inspector" aria-label="运行信息">
        <div className="run-inspector__empty">
          <h2>运行信息</h2>
          <p>暂无运行信息</p>
        </div>
      </section>
    )
  }

  return (
    <section className="run-inspector" aria-label="运行信息">
      <div className="run-inspector__summary">
        <div className="run-inspector__summary-topline">
          <h2>运行信息</h2>
          <span
            className={`run-inspector__summary-status run-inspector__summary-status--${data.summary.status}`}
          >
            {summaryStatusLabels[data.summary.status]}
          </span>
        </div>
        <p>{data.summary.stage}</p>
        <div className="run-inspector__summary-metrics" aria-label="运行摘要">
          <span>{`${data.summary.completedSteps} / ${data.summary.totalSteps} 步`}</span>
          <span>{`${data.summary.outputCount} 个输出`}</span>
          <span>{`${data.summary.pendingCount} 个待处理`}</span>
        </div>
      </div>

      <RunInspectorSection title="进度">
        <ol className="run-inspector__progress-list">
          {data.progress.map((item) => (
            <li
              key={item.id}
              className={`run-inspector__progress-item run-inspector__progress-item--${item.status}`}
            >
              <span className="run-inspector__progress-marker">
                {item.status === 'done' ? '✓' : ''}
              </span>
              <span className="run-inspector__item-body">
                <span className="run-inspector__item-title">
                  <span className="run-inspector__item-name">{item.title}</span>
                  <span className="run-inspector__item-state">
                    {progressStatusLabels[item.status]}
                  </span>
                </span>
                {item.meta ? (
                  <span className="run-inspector__item-meta">{item.meta}</span>
                ) : null}
                {item.detail ? (
                  <span className="run-inspector__item-detail">{item.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </RunInspectorSection>

      <RunInspectorSection title="输出">
        <ul className="run-inspector__plain-list">
          {data.outputs.map((item) => (
            <li key={item.id} className="run-inspector__plain-item">
              <span className="run-inspector__item-body">
                <span className="run-inspector__item-title">
                  <span className="run-inspector__item-name">{item.name}</span>
                  <span className="run-inspector__item-state">
                    {outputStatusLabels[item.status]}
                  </span>
                </span>
                <span className="run-inspector__item-meta">
                  {outputKindLabels[item.kind]} · {item.location}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </RunInspectorSection>

      <RunInspectorSection title="审批">
        <ul className="run-inspector__plain-list">
          {data.approvals.map((item) => (
            <li key={item.id} className="run-inspector__plain-item">
              <span className="run-inspector__item-body">
                <span className="run-inspector__item-title">
                  <span className="run-inspector__item-name">{item.title}</span>
                  <span className="run-inspector__item-state">
                    {approvalStatusLabels[item.status]}
                  </span>
                </span>
                <span className="run-inspector__item-meta">
                  {approvalKindLabels[item.kind]}
                  {item.actor ? ` · ${item.actor}` : ''}
                  {item.decidedAt ? ` · ${item.decidedAt}` : ''}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </RunInspectorSection>

      <RunInspectorSection title="能力调用">
        <ul className="run-inspector__capability-list">
          {data.capabilityRuns.map((item) => {
            const expanded = Boolean(expandedRuns[item.id])

            return (
              <li key={item.id} className="run-inspector__capability-item">
                <button
                  type="button"
                  className="run-inspector__capability-button"
                  aria-expanded={expanded}
                  onClick={() =>
                    setExpandedRuns((current) => ({
                      ...current,
                      [item.id]: !expanded,
                    }))
                  }
                >
                  <ChevronRightIcon className="run-inspector__capability-chevron" />
                  <span className="run-inspector__item-body">
                    <span className="run-inspector__item-title">
                      <span className="run-inspector__item-name">
                        {item.commandName}
                      </span>
                      <span className="run-inspector__item-state">
                        {capabilityStatusLabels[item.status]}
                      </span>
                    </span>
                    <span className="run-inspector__item-meta">
                      {item.summary} · {item.duration}
                    </span>
                  </span>
                </button>
                {expanded ? <CapabilityRunDetails item={item} /> : null}
              </li>
            )
          })}
        </ul>
      </RunInspectorSection>
    </section>
  )
}

function RunInspectorSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="run-inspector__section" aria-labelledby={`run-inspector-${title}`}>
      <h3 id={`run-inspector-${title}`}>{title}</h3>
      {children}
    </section>
  )
}

function CapabilityRunDetails({ item }: { item: RunInspectorCapabilityRunItem }) {
  return (
    <div className="run-inspector__capability-details">
      <KeyValueRecord title="输入" record={item.input} />
      <KeyValueRecord title="输出" record={item.output} />
      {item.artifacts && item.artifacts.length > 0 ? (
        <div className="run-inspector__record">
          <span className="run-inspector__record-title">产物</span>
          <ul>
            {item.artifacts.map((artifact) => (
              <li key={`${item.id}-${artifact.name}`}>
                {artifact.name} · {artifact.kind}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function KeyValueRecord({
  title,
  record,
}: {
  title: string
  record: Record<string, string | string[] | number | boolean>
}) {
  return (
    <div className="run-inspector__record">
      <span className="run-inspector__record-title">{title}</span>
      <dl>
        {Object.entries(record).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default RunInspector
