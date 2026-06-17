import { useMemo, type ReactNode } from 'react'
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
  type ExternalApprovalConnector,
} from '../../data/approvalCenterMockData'

type ApprovalCenterPageProps = {
  onNotify: (message: string) => void
  activeSection: ApprovalCenterSectionId
  inspectorOpen: boolean
  selectedObjectId: string | null
  onSectionChange: (section: ApprovalCenterSectionId) => void
  onSelectObject: (objectId: string | null, inspectorOpen?: boolean) => void
}

type ApprovalSelectionProps = Pick<
  ApprovalCenterPageProps,
  'inspectorOpen' | 'selectedObjectId' | 'onSelectObject'
>

type ApprovalSectionProps = Pick<ApprovalCenterPageProps, 'onNotify'> &
  ApprovalSelectionProps

type TableColumn<TRecord> = {
  key: string
  header: string
  render: (record: TRecord) => ReactNode
}

const demoActionMessage = '已在 Demo 中记录审批动作'

const approvalNavigationGroups: Array<{
  label: string
  sectionIds: ApprovalCenterSectionId[]
}> = [
  { label: '审批工作台', sectionIds: ['overview', 'pending', 'initiated'] },
  { label: '记录', sectionIds: ['records', 'audit'] },
  { label: '配置', sectionIds: ['rules', 'flows', 'groups'] },
  { label: '集成', sectionIds: ['external', 'simulator'] },
]

export default function ApprovalCenterPage({
  activeSection,
  inspectorOpen,
  onNotify,
  onSectionChange,
  onSelectObject,
  selectedObjectId,
}: ApprovalCenterPageProps) {
  const activeSectionLabel =
    approvalCenterSections.find((section) => section.id === activeSection)?.label ??
    '总览'

  return (
    <main className="approval-center" aria-label="审批中心">
      <aside className="approval-center__sidebar" aria-label="审批中心导航">
        <div className="approval-center__brand">审批中心</div>
        <nav className="approval-center__menu" aria-label="审批中心菜单">
          {approvalNavigationGroups.map((group) => (
            <div key={group.label} className="approval-center__menu-group">
              <span className="approval-center__menu-label">{group.label}</span>
              {group.sectionIds.map((sectionId) => {
                const section = getApprovalCenterSection(sectionId)

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`approval-center__menu-button${
                      activeSection === section.id
                        ? ' approval-center__menu-button--active'
                        : ''
                    }`}
                    aria-current={activeSection === section.id ? 'page' : undefined}
                    onClick={() => onSectionChange(section.id)}
                  >
                    {section.label}
                  </button>
                )
              })}
            </div>
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

        {activeSection === 'overview' ? (
          <OverviewSection
            inspectorOpen={inspectorOpen}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
          />
        ) : null}
        {activeSection === 'pending' ? (
          <PendingSection
            inspectorOpen={inspectorOpen}
            selectedObjectId={selectedObjectId}
            onNotify={onNotify}
            onSelectObject={onSelectObject}
          />
        ) : null}
        {activeSection === 'initiated' ? (
          <InitiatedSection
            inspectorOpen={inspectorOpen}
            selectedObjectId={selectedObjectId}
            onNotify={onNotify}
            onSelectObject={onSelectObject}
          />
        ) : null}
        {activeSection === 'records' ? (
          <RecordsSection
            inspectorOpen={inspectorOpen}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
          />
        ) : null}
        {activeSection === 'rules' ? <RulesSection onNotify={onNotify} /> : null}
        {activeSection === 'flows' ? <FlowsSection /> : null}
        {activeSection === 'groups' ? <GroupsSection /> : null}
        {activeSection === 'external' ? (
          <ExternalSection
            inspectorOpen={inspectorOpen}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
          />
        ) : null}
        {activeSection === 'audit' ? <AuditSection /> : null}
        {activeSection === 'simulator' ? <SimulatorSection /> : null}
      </section>
    </main>
  )
}

function OverviewSection({
  inspectorOpen,
  onSelectObject,
  selectedObjectId,
}: ApprovalSelectionProps) {
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
        <ApprovalRecordsTable
          records={recentRecords}
          inspectorOpen={inspectorOpen}
          selectedObjectId={selectedObjectId}
          onSelectObject={onSelectObject}
        />
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
                  {connectorStatusLabels[connector.status]} ·{' '}
                  {approvalSyncStatusLabels[connector.lastSyncStatus]}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function PendingSection({
  inspectorOpen,
  onNotify,
  onSelectObject,
  selectedObjectId,
}: ApprovalSectionProps) {
  const records = getApprovalRecordsBySection('pending')
  const selectedRecord = inspectorOpen
    ? records.find((record) => record.id === selectedObjectId)
    : undefined

  return (
    <section className="approval-center__section" aria-label="待处理审批">
      <div className="approval-center__section-heading">
        <h2>待处理审批</h2>
        <span>当前用户可处理的审批队列</span>
      </div>
      <div className={getDetailLayoutClass(Boolean(selectedRecord))}>
        <ApprovalRequestsTable
          records={records}
          progressHeader="当前节点"
          renderProgress={(record) => record.currentNode}
          renderActions={(record) => (
            <div className="approval-center__actions">
              <button
                type="button"
                className="approval-center__action"
                aria-label={getApprovalActionAriaLabel('查看详情', record)}
                onClick={() => onSelectObject(record.id, true)}
              >
                查看详情
              </button>
              {getPendingActionLabels(record).map((label) => (
                <button
                  key={label}
                  type="button"
                  className="approval-center__action"
                  aria-label={getApprovalActionAriaLabel(label, record)}
                  onClick={() => onNotify(demoActionMessage)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        />
        {selectedRecord ? (
          <ApprovalRequestInspector
            record={selectedRecord}
            onClose={() => onSelectObject(null, false)}
          />
        ) : null}
      </div>
    </section>
  )
}

function InitiatedSection({
  inspectorOpen,
  onNotify,
  onSelectObject,
  selectedObjectId,
}: ApprovalSectionProps) {
  const records = getApprovalRecordsBySection('initiated')
  const selectedRecord = inspectorOpen
    ? records.find((record) => record.id === selectedObjectId)
    : undefined

  return (
    <section className="approval-center__section" aria-label="我发起的审批">
      <div className="approval-center__section-heading">
        <h2>我发起的</h2>
        <span>由 zhengjun 或 Agent 代发起的审批</span>
      </div>
      <div className={getDetailLayoutClass(Boolean(selectedRecord))}>
        <ApprovalRequestsTable
          records={records}
          progressHeader="当前节点"
          renderProgress={(record) =>
            record.route === 'external'
              ? approvalSyncStatusLabels[record.syncStatus]
              : record.currentNode
          }
          renderActions={(record) => (
            <div className="approval-center__actions">
              <button
                type="button"
                className="approval-center__action"
                aria-label={getApprovalActionAriaLabel('查看详情', record)}
                onClick={() => onSelectObject(record.id, true)}
              >
                查看详情
              </button>
              {(record.route === 'external'
                ? ['撤回通知', '复制资料包']
                : ['撤回', '复制资料包']
              ).map((label) => (
                <button
                  key={label}
                  type="button"
                  className="approval-center__action"
                  aria-label={getApprovalActionAriaLabel(label, record)}
                  onClick={() => onNotify(demoActionMessage)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        />
        {selectedRecord ? (
          <ApprovalRequestInspector
            record={selectedRecord}
            onClose={() => onSelectObject(null, false)}
          />
        ) : null}
      </div>
    </section>
  )
}

function RecordsSection({
  inspectorOpen,
  onSelectObject,
  selectedObjectId,
}: ApprovalSelectionProps) {
  return (
    <section className="approval-center__section" aria-label="审批记录">
      <div className="approval-center__section-heading">
        <h2>审批记录</h2>
        <span>已完成决策不可编辑；变更需新建审批或作废旧记录</span>
      </div>
      <ApprovalRecordsTable
        records={getApprovalRecordsBySection('records')}
        inspectorOpen={inspectorOpen}
        selectedObjectId={selectedObjectId}
        onSelectObject={onSelectObject}
      />
    </section>
  )
}

function RulesSection({ onNotify }: Pick<ApprovalCenterPageProps, 'onNotify'>) {
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
            render: (rule) => (
              <div className="approval-center__actions">
                {['查看版本', '复制规则'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="approval-center__action"
                    aria-label={`${label} ${rule.name}`}
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

function ExternalSection({
  inspectorOpen,
  onSelectObject,
  selectedObjectId,
}: ApprovalSelectionProps) {
  const selectedConnector = inspectorOpen
    ? externalApprovalConnectors.find(
        (connector) => connector.id === selectedObjectId,
      )
    : undefined

  return (
    <section className="approval-center__section" aria-label="外部审批">
      <div className="approval-center__section-heading">
        <h2>外部审批连接器</h2>
        <span>黑盒集成，不展开外部节点</span>
      </div>
      <p className="approval-center__notice">
        外部系统拥有自己的流程、节点和处理人，BioMap 只记录提交/回调/撤回元数据和审计完整度。
      </p>
      <div className={getDetailLayoutClass(Boolean(selectedConnector))}>
        <DataTable
          minWidth={900}
          columns={[
            { key: 'name', header: '连接器', render: (connector) => <strong>{connector.name}</strong> },
            {
              key: 'provider',
              header: '来源',
              render: (connector) => connectorProviderLabels[connector.provider],
            },
            {
              key: 'status',
              header: '状态',
              render: (connector) => (
                <StatusPill tone={getConnectorStatusTone(connector.status)}>
                  {connectorStatusLabels[connector.status]}
                </StatusPill>
              ),
            },
            {
              key: 'externalFlowKey',
              header: '外部流程',
              render: (connector) => (
                <span className="approval-center__cell-stack">
                  <strong>{connector.externalFlowKey}</strong>
                  <small>已配置 3 个端点</small>
                </span>
              ),
            },
            {
              key: 'syncPolicy',
              header: '同步策略',
              render: (connector) => (
                <span className="approval-center__cell-stack">
                  <strong>{approvalSyncStatusLabels[connector.lastSyncStatus]}</strong>
                  <small>{connector.retryPolicy}</small>
                </span>
              ),
            },
            {
              key: 'auditCompleteness',
              header: '审计',
              render: (connector) => auditCompletenessLabels[connector.auditCompleteness],
            },
            {
              key: 'actions',
              header: '更多',
              render: (connector) => (
                <button
                  type="button"
                  className="approval-center__action"
                  aria-label={`查看 ${connector.name} 详情`}
                  onClick={() => onSelectObject(connector.id, true)}
                >
                  查看详情
                </button>
              ),
            },
          ]}
          records={externalApprovalConnectors}
        />
        {selectedConnector ? (
          <ExternalConnectorInspector
            connector={selectedConnector}
            onClose={() => onSelectObject(null, false)}
          />
        ) : null}
      </div>
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

function ApprovalRecordsTable({
  inspectorOpen,
  onSelectObject,
  records,
  selectedObjectId,
}: {
  records: ApprovalRequest[]
} & ApprovalSelectionProps) {
  const selectedRecord = inspectorOpen
    ? records.find((record) => record.id === selectedObjectId)
    : undefined

  return (
    <div className={getDetailLayoutClass(Boolean(selectedRecord))}>
      <ApprovalRequestsTable
        records={records}
        progressHeader="结果"
        renderProgress={(record) => record.resultLabel}
        renderActions={(record) => (
          <button
            type="button"
            className="approval-center__action"
            aria-label={getApprovalActionAriaLabel('查看详情', record)}
            onClick={() => onSelectObject(record.id, true)}
          >
            查看详情
          </button>
        )}
      />
      {selectedRecord ? (
        <ApprovalRequestInspector
          record={selectedRecord}
          onClose={() => onSelectObject(null, false)}
        />
      ) : null}
    </div>
  )
}

function ApprovalRequestsTable({
  records,
  progressHeader,
  renderProgress,
  renderActions,
}: {
  records: ApprovalRequest[]
  progressHeader: string
  renderProgress: (record: ApprovalRequest) => ReactNode
  renderActions: (record: ApprovalRequest) => ReactNode
}) {
  return (
    <DataTable
      minWidth={820}
      columns={[
        { key: 'title', header: '标题', render: (record) => <strong>{record.title}</strong> },
        {
          key: 'operationType',
          header: '类型',
          render: (record) => operationTypeLabels[record.operationType],
        },
        {
          key: 'status',
          header: '状态',
          render: (record) => (
            <StatusPill tone={getApprovalStatusTone(record.status)}>
              {approvalStatusLabels[record.status]}
            </StatusPill>
          ),
        },
        { key: 'progress', header: progressHeader, render: renderProgress },
        { key: 'updatedAt', header: '更新时间', render: (record) => formatDate(record.updatedAt) },
        { key: 'actions', header: '更多', render: renderActions },
      ]}
      records={records}
    />
  )
}

function ApprovalRequestInspector({
  record,
  onClose,
}: {
  record: ApprovalRequest
  onClose: () => void
}) {
  const connector = record.connectorId
    ? externalApprovalConnectors.find((item) => item.id === record.connectorId)
    : undefined
  const rule = approvalRules.find(
    (item) => record.ruleVersion === `${item.name} ${item.version}`,
  )

  return (
    <aside className="approval-center__inspector" aria-label={`${record.title} 详情`}>
      <div className="approval-center__inspector-head">
        <div>
          <h3>审批详情</h3>
          <p>{record.title}</p>
        </div>
        <button
          type="button"
          className="approval-center__action"
          aria-label={`关闭 ${record.title} 详情`}
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      <dl>
        <div>
          <dt>审批编号</dt>
          <dd>{record.id}</dd>
        </div>
        <div>
          <dt>项目</dt>
          <dd>{record.projectName}</dd>
        </div>
        <div>
          <dt>发起人</dt>
          <dd>{record.initiator}</dd>
        </div>
        <div>
          <dt>审批路线</dt>
          <dd>{routeLabels[record.route]}</dd>
        </div>
        <div>
          <dt>风险等级</dt>
          <dd>
            <StatusPill tone={getRiskTone(record.riskLevel)}>
              {riskLevelLabels[record.riskLevel]}
            </StatusPill>
          </dd>
        </div>
        <div>
          <dt>资料包模板</dt>
          <dd>{rule?.evidenceTemplateId ?? '-'}</dd>
        </div>
        <div>
          <dt>资料包编号</dt>
          <dd>{record.evidencePackageId}</dd>
        </div>
        <div>
          <dt>审计完整度</dt>
          <dd>{auditCompletenessLabels[record.auditCompleteness]}</dd>
        </div>
        <div>
          <dt>规则版本</dt>
          <dd>{record.ruleVersion}</dd>
        </div>
        <div>
          <dt>{record.route === 'external' ? '外部流程编号' : '流程版本'}</dt>
          <dd>
            {record.route === 'external'
              ? connector?.externalFlowKey ?? record.connectorName ?? '-'
              : record.flowVersion ?? '-'}
          </dd>
        </div>
      </dl>
      <section className="approval-center__inspector-block" aria-label="时间状态">
        <h4>时间状态</h4>
        <dl>
          <div>
            <dt>当前状态</dt>
            <dd>
              <StatusPill tone={getApprovalStatusTone(record.status)}>
                {approvalStatusLabels[record.status]}
              </StatusPill>
            </dd>
          </div>
          <div>
            <dt>同步状态</dt>
            <dd>{approvalSyncStatusLabels[record.syncStatus]}</dd>
          </div>
          <div>
            <dt>创建时间</dt>
            <dd>{formatDate(record.createdAt)}</dd>
          </div>
          <div>
            <dt>更新时间</dt>
            <dd>{formatDate(record.updatedAt)}</dd>
          </div>
          <div>
            <dt>截止时间</dt>
            <dd>{formatDate(record.dueAt)}</dd>
          </div>
          <div>
            <dt>完成时间</dt>
            <dd>{formatDate(record.completedAt)}</dd>
          </div>
        </dl>
      </section>
    </aside>
  )
}

function ExternalConnectorInspector({
  connector,
  onClose,
}: {
  connector: ExternalApprovalConnector
  onClose: () => void
}) {
  return (
    <aside className="approval-center__inspector" aria-label={`${connector.name} 详情`}>
      <div className="approval-center__inspector-head">
        <div>
          <h3>连接器详情</h3>
          <p>{connector.name}</p>
        </div>
        <button
          type="button"
          className="approval-center__action"
          aria-label={`关闭 ${connector.name} 详情`}
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      <p>{connector.blackBoxDescription}</p>
      <dl>
        <div>
          <dt>提交端点</dt>
          <dd>{connector.submissionEndpoint}</dd>
        </div>
        <div>
          <dt>回调端点</dt>
          <dd>{connector.callbackEndpoint}</dd>
        </div>
        <div>
          <dt>撤回端点</dt>
          <dd>{connector.withdrawEndpoint}</dd>
        </div>
        <div>
          <dt>最近同步时间</dt>
          <dd>{formatDate(connector.lastSyncAt)}</dd>
        </div>
        <div>
          <dt>错误策略</dt>
          <dd>{connector.retryPolicy}</dd>
        </div>
        <div>
          <dt>认证</dt>
          <dd>{connector.authenticationLabel}</dd>
        </div>
        <div>
          <dt>审计策略</dt>
          <dd>{auditCompletenessLabels[connector.auditCompleteness]}</dd>
        </div>
        <div>
          <dt>撤回说明</dt>
          <dd>BioMap 向外部系统发送撤回通知并记录结果，不建模为内部 Approval Flow。</dd>
        </div>
      </dl>
    </aside>
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
              <th key={column.key} data-column-key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={getRecordKey(record, index)}>
              {columns.map((column) => (
                <td key={column.key} data-column-key={column.key}>
                  {column.render(record)}
                </td>
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

function getDetailLayoutClass(inspectorOpen: boolean) {
  return `approval-center__detail-layout${
    inspectorOpen ? ' approval-center__detail-layout--inspector-open' : ''
  }`
}

function getApprovalActionAriaLabel(label: string, record: ApprovalRequest) {
  if (label === '查看详情') {
    return `查看 ${record.title} 详情`
  }

  if (label === '查看资料包') {
    return `查看 ${record.title} 资料包`
  }

  return `${label} ${record.title}`
}

function getApprovalCenterSection(sectionId: ApprovalCenterSectionId) {
  const section = approvalCenterSections.find((item) => item.id === sectionId)

  if (!section) {
    throw new Error(`Unknown approval center section: ${sectionId}`)
  }

  return section
}

function getApprovalStatusTone(status: ApprovalRequest['status']) {
  if (status === 'approved') {
    return 'success'
  }

  if (status === 'rejected' || status === 'expired' || status === 'voided') {
    return 'danger'
  }

  if (status === 'pending') {
    return 'warning'
  }

  return 'neutral'
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

function getConnectorStatusTone(status: ExternalApprovalConnector['status']) {
  if (status === 'healthy') {
    return 'success'
  }

  if (status === 'warning') {
    return 'warning'
  }

  return 'neutral'
}

const connectorProviderLabels: Record<ExternalApprovalConnector['provider'], string> = {
  wecom: '企业微信',
  feishu: '飞书',
  dingtalk: '钉钉',
  webhook: 'Webhook',
  custom: '自定义',
}

const connectorStatusLabels: Record<ExternalApprovalConnector['status'], string> = {
  healthy: '正常',
  warning: '异常',
  disabled: '停用',
}

const auditCompletenessLabels: Record<ApprovalRequest['auditCompleteness'], string> = {
  complete: '完整审计',
  'node-level': '节点级',
  'result-level': '结果级',
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
