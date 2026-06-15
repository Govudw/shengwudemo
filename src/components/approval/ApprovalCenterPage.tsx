import { useMemo, useState, type ReactNode } from 'react'
import {
  approvalAuditEvents,
  approvalCenterSections,
  approvalFlows,
  approvalRecords,
  approvalRules,
  approvalStatusLabels,
  approvalSyncStatusLabels,
  approverGroups,
  externalApprovalConnectors,
  getApprovalOverviewMetrics,
  getApprovalRecordsBySection,
  operationTypeLabels,
  riskLevelLabels,
  routeLabels,
  runApprovalSimulation,
  type ApprovalCenterSectionId,
  type ApprovalRequest,
  type ApprovalStage,
} from '../../data/approvalCenterMockData'

type ApprovalCenterPageProps = {
  onNotify: (message: string) => void
}

type TableColumn<TRecord> = {
  key: string
  header: string
  render: (record: TRecord) => ReactNode
}

const demoActionMessage = '已在 Demo 中记录审批动作'

export default function ApprovalCenterPage({ onNotify }: ApprovalCenterPageProps) {
  const [activeSection, setActiveSection] =
    useState<ApprovalCenterSectionId>('overview')
  const activeSectionLabel =
    approvalCenterSections.find((section) => section.id === activeSection)?.label ??
    '总览'

  return (
    <main className="approval-center" aria-label="审批中心">
      <aside className="approval-center__sidebar" aria-label="审批中心导航">
        <div className="approval-center__brand">审批中心</div>
        <nav className="approval-center__menu" aria-label="审批中心菜单">
          {approvalCenterSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`approval-center__menu-button${
                activeSection === section.id
                  ? ' approval-center__menu-button--active'
                  : ''
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="approval-center__workspace">
        <header className="approval-center__header">
          <div>
            <h1>{activeSection === 'overview' ? '审批中心' : activeSectionLabel}</h1>
            <p>
              管理审批规则、内置流程、外部连接器和不可变审批记录，Demo
              数据仅用于展示治理模型。
            </p>
          </div>
          <span className="approval-center__scope">Organization / Project</span>
        </header>

        {activeSection === 'overview' ? <OverviewSection /> : null}
        {activeSection === 'pending' ? (
          <PendingSection onNotify={onNotify} />
        ) : null}
        {activeSection === 'initiated' ? <InitiatedSection onNotify={onNotify} /> : null}
        {activeSection === 'records' ? <RecordsSection /> : null}
        {activeSection === 'rules' ? <RulesSection onNotify={onNotify} /> : null}
        {activeSection === 'flows' ? <FlowsSection /> : null}
        {activeSection === 'groups' ? <GroupsSection /> : null}
        {activeSection === 'external' ? <ExternalSection /> : null}
        {activeSection === 'audit' ? <AuditSection /> : null}
        {activeSection === 'simulator' ? <SimulatorSection /> : null}
      </section>
    </main>
  )
}

function OverviewSection() {
  const metrics = useMemo(() => getApprovalOverviewMetrics(), [])
  const recentRecords = approvalRecords.slice(0, 5)
  const attentionRules = approvalRules.filter((rule) => rule.route === 'external')

  return (
    <>
      <section className="approval-center__metrics" aria-label="审批中心指标">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className={`approval-center__metric approval-center__metric--${metric.tone}`}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.helper}</small>
          </article>
        ))}
      </section>

      <section className="approval-center__section" aria-label="最近审批记录">
        <div className="approval-center__section-heading">
          <h2>最近审批记录</h2>
          <span>{recentRecords.length} 条</span>
        </div>
        <ApprovalRecordsTable records={recentRecords} />
      </section>

      <div className="approval-center__split">
        <section className="approval-center__section" aria-label="规则关注">
          <div className="approval-center__section-heading">
            <h2>操作规则关注</h2>
          </div>
          <div className="approval-center__list">
            {attentionRules.map((rule) => (
              <article key={rule.id} className="approval-center__list-item">
                <strong>{rule.name}</strong>
                <span>{routeLabels[rule.route]} · {rule.version}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="approval-center__section" aria-label="连接器健康">
          <div className="approval-center__section-heading">
            <h2>外部审批连接器</h2>
          </div>
          <div className="approval-center__list">
            {externalApprovalConnectors.map((connector) => (
              <article key={connector.id} className="approval-center__list-item">
                <strong>{connector.name}</strong>
                <span>
                  {connector.status} · {approvalSyncStatusLabels[connector.lastSyncStatus]}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function PendingSection({ onNotify }: ApprovalCenterPageProps) {
  const records = getApprovalRecordsBySection('pending')

  return (
    <section className="approval-center__section" aria-label="待处理审批">
      <div className="approval-center__section-heading">
        <h2>待处理审批</h2>
        <span>当前用户可处理的审批队列</span>
      </div>
      <DataTable
        minWidth={1120}
        columns={[
          {
            key: 'title',
            header: '审批标题',
            render: (record) => <strong>{record.title}</strong>,
          },
          {
            key: 'operationType',
            header: '操作类型',
            render: (record) => operationTypeLabels[record.operationType],
          },
          { key: 'projectName', header: '项目', render: (record) => record.projectName },
          { key: 'initiator', header: '发起人', render: (record) => record.initiator },
          {
            key: 'currentNode',
            header: '当前节点',
            render: (record) => record.currentNode,
          },
          { key: 'dueAt', header: '截止时间', render: (record) => formatDate(record.dueAt) },
          {
            key: 'riskLevel',
            header: '风险等级',
            render: (record) => (
              <StatusPill tone={getRiskTone(record.riskLevel)}>
                {riskLevelLabels[record.riskLevel]}
              </StatusPill>
            ),
          },
          {
            key: 'status',
            header: '状态',
            render: (record) => approvalStatusLabels[record.status],
          },
          {
            key: 'actions',
            header: '操作',
            render: (record) => (
              <div className="approval-center__actions">
                {getPendingActionLabels(record).map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="approval-center__action"
                    onClick={() => onNotify(demoActionMessage)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ),
          },
        ]}
        records={records}
      />
    </section>
  )
}

function InitiatedSection({ onNotify }: ApprovalCenterPageProps) {
  return (
    <section className="approval-center__section" aria-label="我发起的审批">
      <div className="approval-center__section-heading">
        <h2>我发起的</h2>
        <span>由 zhengjun 或 Agent 代发起的审批</span>
      </div>
      <DataTable
        minWidth={980}
        columns={[
          { key: 'title', header: '审批标题', render: (record) => <strong>{record.title}</strong> },
          {
            key: 'operationType',
            header: '操作类型',
            render: (record) => operationTypeLabels[record.operationType],
          },
          {
            key: 'status',
            header: '当前状态',
            render: (record) => approvalStatusLabels[record.status],
          },
          {
            key: 'handler',
            header: '当前处理人或外部系统状态',
            render: (record) =>
              record.route === 'external'
                ? approvalSyncStatusLabels[record.syncStatus]
                : record.currentAssigneeLabel,
          },
          { key: 'createdAt', header: '发起时间', render: (record) => formatDate(record.createdAt) },
          { key: 'updatedAt', header: '最近更新', render: (record) => formatDate(record.updatedAt) },
          {
            key: 'actions',
            header: '操作',
            render: () => (
              <div className="approval-center__actions">
                {['查看详情', '撤回', '复制资料包'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="approval-center__action"
                    onClick={() => onNotify(demoActionMessage)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ),
          },
        ]}
        records={getApprovalRecordsBySection('initiated')}
      />
    </section>
  )
}

function RecordsSection() {
  return (
    <section className="approval-center__section" aria-label="审批记录">
      <div className="approval-center__section-heading">
        <h2>审批记录</h2>
        <span>已完成决策不可编辑；变更需新建审批或作废旧记录</span>
      </div>
      <ApprovalRecordsTable records={getApprovalRecordsBySection('records')} />
    </section>
  )
}

function RulesSection({ onNotify }: ApprovalCenterPageProps) {
  return (
    <section className="approval-center__section" aria-label="操作规则">
      <div className="approval-center__section-heading">
        <h2>操作规则</h2>
        <span>规则只决定是否进入审批 Gate，不授予资产权限</span>
      </div>
      <DataTable
        minWidth={1040}
        columns={[
          { key: 'name', header: '规则名称', render: (rule) => <strong>{rule.name}</strong> },
          { key: 'scope', header: '适用范围', render: (rule) => scopeLabel(rule.scope) },
          {
            key: 'operationType',
            header: '操作类型',
            render: (rule) => operationTypeLabels[rule.operationType],
          },
          { key: 'conditionSummary', header: '条件摘要', render: (rule) => rule.conditionSummary },
          { key: 'route', header: '审批路线', render: (rule) => routeLabels[rule.route] },
          { key: 'evidenceTemplateId', header: '资料包模板', render: (rule) => rule.evidenceTemplateId },
          { key: 'priority', header: '优先级', render: (rule) => rule.priority },
          {
            key: 'enabled',
            header: '状态',
            render: (rule) => (
              <StatusPill tone={rule.enabled ? 'success' : 'neutral'}>
                {rule.enabled ? '启用' : '停用'}
              </StatusPill>
            ),
          },
          { key: 'version', header: '版本', render: (rule) => rule.version },
          {
            key: 'actions',
            header: '操作',
            render: () => (
              <div className="approval-center__actions">
                {['查看版本', '复制规则'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="approval-center__action"
                    onClick={() => onNotify(demoActionMessage)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ),
          },
        ]}
        records={approvalRules}
      />
    </section>
  )
}

function FlowsSection() {
  return (
    <section className="approval-center__section" aria-label="审批流程">
      <div className="approval-center__section-heading">
        <h2>审批流程</h2>
        <span>BioMap 内置审批路线和节点配置</span>
      </div>
      <div className="approval-center__cards">
        {approvalFlows.map((flow) => (
          <article key={flow.id} className="approval-center__detail-card">
            <div className="approval-center__card-head">
              <strong>{flow.name}</strong>
              <StatusPill tone={flow.status === 'published' ? 'success' : 'neutral'}>
                {flow.status}
              </StatusPill>
            </div>
            <p>{scopeLabel(flow.scope)} · {flow.version}</p>
            <div className="approval-center__stage-grid">
              {flow.stages.map((stage, index) => (
                <article key={stage.id} className="approval-center__stage">
                  <strong>{index + 1}. {stage.name}</strong>
                  <dl>
                    <div>
                      <dt>审批人来源</dt>
                      <dd>{approverSourceLabels[stage.approverSource]}</dd>
                    </div>
                    <div>
                      <dt>审批模式</dt>
                      <dd>{approvalModeLabels[stage.approvalMode]}</dd>
                    </div>
                    <div>
                      <dt>节点顺序</dt>
                      <dd>顺序执行</dd>
                    </div>
                    <div>
                      <dt>超时策略</dt>
                      <dd>{timeoutPolicyLabels[stage.timeoutPolicy]}</dd>
                    </div>
                    <div>
                      <dt>可要求补充</dt>
                      <dd>{stage.canRequestSupplement ? '是' : '否'}</dd>
                    </div>
                    <div>
                      <dt>可转交</dt>
                      <dd>{stage.canDelegate ? '是' : '否'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function GroupsSection() {
  return (
    <section className="approval-center__section" aria-label="审批人组">
      <div className="approval-center__section-heading">
        <h2>审批人组</h2>
        <span>内置审批流程引用的组织或项目审批人集合</span>
      </div>
      <DataTable
        minWidth={820}
        columns={[
          { key: 'name', header: '审批人组', render: (group) => <strong>{group.name}</strong> },
          { key: 'scope', header: '范围', render: (group) => scopeLabel(group.scope) },
          { key: 'members', header: '成员', render: (group) => group.members.join(' / ') },
          { key: 'owner', header: 'Owner', render: (group) => group.owner },
          {
            key: 'usedByFlowIds',
            header: '使用流程',
            render: (group) => group.usedByFlowIds.map(getFlowName).join(' / '),
          },
          {
            key: 'status',
            header: '状态',
            render: (group) => (
              <StatusPill tone={group.status === 'active' ? 'success' : 'neutral'}>
                {group.status === 'active' ? '启用' : '停用'}
              </StatusPill>
            ),
          },
        ]}
        records={approverGroups}
      />
    </section>
  )
}

function ExternalSection() {
  return (
    <section className="approval-center__section" aria-label="外部审批">
      <div className="approval-center__section-heading">
        <h2>外部审批连接器</h2>
        <span>黑盒集成，不展开外部节点</span>
      </div>
      <p className="approval-center__notice">
        外部系统拥有自己的流程、节点和处理人，BioMap 只记录提交/回调/撤回元数据和审计完整度。
      </p>
      <DataTable
        minWidth={1640}
        columns={[
          { key: 'name', header: '连接器', render: (connector) => <strong>{connector.name}</strong> },
          { key: 'provider', header: 'Provider', render: (connector) => connector.provider },
          {
            key: 'status',
            header: '状态',
            render: (connector) => (
              <StatusPill tone={connector.status === 'healthy' ? 'success' : 'warning'}>
                {connector.status}
              </StatusPill>
            ),
          },
          {
            key: 'lastSyncStatus',
            header: '最近同步',
            render: (connector) => approvalSyncStatusLabels[connector.lastSyncStatus],
          },
          { key: 'externalFlowKey', header: '外部流程 Key', render: (connector) => connector.externalFlowKey },
          { key: 'submissionEndpoint', header: '提交端点', render: (connector) => connector.submissionEndpoint },
          { key: 'callbackEndpoint', header: '回调端点', render: (connector) => connector.callbackEndpoint },
          { key: 'withdrawEndpoint', header: '撤回端点', render: (connector) => connector.withdrawEndpoint },
          { key: 'retryPolicy', header: '重试策略', render: (connector) => connector.retryPolicy },
          { key: 'authenticationLabel', header: '认证', render: (connector) => connector.authenticationLabel },
          { key: 'lastSyncAt', header: '最近同步时间', render: (connector) => formatDate(connector.lastSyncAt) },
          {
            key: 'auditCompleteness',
            header: '审计完整度',
            render: (connector) => connector.auditCompleteness,
          },
        ]}
        records={externalApprovalConnectors}
      />
    </section>
  )
}

function AuditSection() {
  return (
    <section className="approval-center__section" aria-label="审计日志">
      <div className="approval-center__section-heading">
        <h2>审计日志</h2>
        <span>审批请求、规则和外部回调事件</span>
      </div>
      <DataTable
        minWidth={940}
        columns={[
          { key: 'time', header: '时间', render: (event) => formatDate(event.time) },
          { key: 'actor', header: '操作者', render: (event) => event.actor },
          { key: 'eventType', header: '事件', render: (event) => event.eventType },
          { key: 'targetObject', header: '对象', render: (event) => event.targetObject },
          { key: 'afterSummary', header: '摘要', render: (event) => event.afterSummary },
          { key: 'source', header: '来源', render: (event) => event.source },
        ]}
        records={approvalAuditEvents}
      />
    </section>
  )
}

function SimulatorSection() {
  const result = runApprovalSimulation({ operationType: 'createCroOrder' })
  const builtInResult = runApprovalSimulation({
    operationType: 'submitExperimentOrder',
    projectId: 'antibody-optimization',
  })

  return (
    <section className="approval-center__section" aria-label="模拟测试">
      <div className="approval-center__section-heading">
        <h2>模拟测试</h2>
        <span>输入高风险操作，预览命中的审批路线</span>
      </div>
      <div className="approval-center__simulator">
        <dl>
          <div>
            <dt>操作类型</dt>
            <dd>{operationTypeLabels.createCroOrder}</dd>
          </div>
          <div>
            <dt>匹配规则</dt>
            <dd>{result.matchedRuleName}</dd>
          </div>
          <div>
            <dt>审批路线</dt>
            <dd>{result.route === 'external' ? '外部审批' : 'BioMap 内置审批'}</dd>
          </div>
          <div>
            <dt>连接器</dt>
            <dd>{result.connectorName ?? '-'}</dd>
          </div>
          <div>
            <dt>资料包模板</dt>
            <dd>{result.evidenceTemplateId}</dd>
          </div>
          <div>
            <dt>待处理人</dt>
            <dd>
              {result.expectedPendingApprovers.length > 0
                ? result.expectedPendingApprovers.join(' / ')
                : '外部系统处理'}
            </dd>
          </div>
        </dl>
        <div className="approval-center__simulation-flow">
          <h3>内置流程预览</h3>
          <p>{builtInResult.matchedRuleName} · {builtInResult.flowName}</p>
          <ol>
            {(builtInResult.flowStages ?? []).map((stage) => (
              <li key={stage.id}>
                {stage.name} / {stage.approverLabel} / {approvalModeLabels[stage.approvalMode]}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function ApprovalRecordsTable({ records }: { records: ApprovalRequest[] }) {
  return (
    <DataTable
      minWidth={1040}
      columns={[
        { key: 'id', header: '审批编号', render: (record) => record.id },
        { key: 'title', header: '审批标题', render: (record) => <strong>{record.title}</strong> },
        {
          key: 'operationType',
          header: '操作类型',
          render: (record) => operationTypeLabels[record.operationType],
        },
        { key: 'projectName', header: '项目', render: (record) => record.projectName },
        { key: 'route', header: '审批路线', render: (record) => routeLabels[record.route] },
        { key: 'resultLabel', header: '结果', render: (record) => record.resultLabel },
        { key: 'initiator', header: '发起人', render: (record) => record.initiator },
        { key: 'completedAt', header: '完成时间', render: (record) => formatDate(record.completedAt) },
        {
          key: 'auditCompleteness',
          header: '审计完整度',
          render: (record) => record.auditCompleteness,
        },
      ]}
      records={records}
    />
  )
}

function DataTable<TRecord>({
  columns,
  records,
  minWidth,
}: {
  columns: TableColumn<TRecord>[]
  records: TRecord[]
  minWidth: number
}) {
  return (
    <div className="approval-center__table-wrap">
      <table className="approval-center__table" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={getRecordKey(record, index)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(record)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'success' | 'warning' | 'danger' | 'neutral'
}) {
  return (
    <span className={`approval-center__status approval-center__status--${tone}`}>
      {children}
    </span>
  )
}

function getRecordKey(record: unknown, index: number): string {
  if (typeof record === 'object' && record !== null && 'id' in record) {
    return String((record as { id: string }).id)
  }

  return String(index)
}

function getRiskTone(riskLevel: ApprovalRequest['riskLevel']) {
  if (riskLevel === 'critical') {
    return 'danger'
  }

  if (riskLevel === 'high' || riskLevel === 'medium') {
    return 'warning'
  }

  return 'success'
}

const approverSourceLabels: Record<ApprovalStage['approverSource'], string> = {
  fixedUsers: '固定用户',
  approverGroup: '审批人组',
  projectRole: '项目角色',
  orgRole: '组织角色',
  manager: '发起人的上级',
  assetOwner: '资产 Owner',
  experimentOwner: 'Experiment Owner',
}

const approvalModeLabels: Record<ApprovalStage['approvalMode'], string> = {
  any: '任一通过',
  all: '全部通过',
}

const timeoutPolicyLabels: Record<ApprovalStage['timeoutPolicy'], string> = {
  remindOnly: '仅提醒',
  escalate: '升级',
  expire: '过期',
}

function getPendingActionLabels(record: ApprovalRequest) {
  if (record.route === 'external') {
    return ['查看资料包', '外部系统跟踪', '重试同步', '撤回状态']
  }

  return ['查看资料包', '通过', '驳回', '要求补充']
}

function getFlowName(flowId: string) {
  return approvalFlows.find((flow) => flow.id === flowId)?.name ?? flowId
}

function scopeLabel(scope: 'organization' | 'project') {
  return scope === 'organization' ? '组织' : '项目'
}

function formatDate(value?: string) {
  if (!value) {
    return '-'
  }

  return value.replace('T', ' ').replace('+08:00', '')
}
