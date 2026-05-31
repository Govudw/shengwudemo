export type CapabilityEntryKind = 'pipeline' | 'skill' | 'mcp-server' | 'plugin'

export type CapabilityStatus = 'active' | 'draft' | 'inactive' | 'needs-review'

export type CapabilitySource = 'preset' | 'created' | 'installed' | 'system'

export type ProviderConnectionStatus = 'connected' | 'needs-review' | 'inactive'

export type CapabilityMetric = {
  label: string
  value: string
}

export type CapabilityInterface = {
  inputs: string[]
  outputs: string[]
  permissions: string[]
}

export type CapabilitySection = {
  title: string
  items: string[]
}

export type MockCapabilityEntry = {
  id: string
  kind: CapabilityEntryKind
  name: string
  description: string
  status: CapabilityStatus
  source: CapabilitySource
  owner: string
  version: string
  tags: string[]
  enabledForMainAgent?: boolean
  connectionStatus?: ProviderConnectionStatus
  lastUsedAt?: string
  updatedAt: string
  metrics: CapabilityMetric[]
  interface: CapabilityInterface
  sections: CapabilitySection[]
  recentActivity: string[]
  steps?: string[]
  instructions?: string[]
  triggers?: string[]
  examples?: string[]
  tools?: string[]
  resources?: string[]
  presetLocked?: boolean
  placeholderState?: string
}

export const capabilityEntries: MockCapabilityEntry[] = [
  {
    id: 'pipeline-egfr-affinity',
    kind: 'pipeline',
    name: 'EGFR Antibody Affinity Optimization',
    description:
      'Coordinates sequence intake, structure scoring, candidate ranking, and wet-lab order drafting for EGFR antibody optimization.',
    status: 'active',
    source: 'preset',
    owner: 'BioMap R&D Platform',
    version: 'v2.3',
    tags: ['antibody', 'EGFR', 'wet-lab'],
    lastUsedAt: '18 hours ago',
    updatedAt: '2026-05-29',
    metrics: [
      { label: 'Steps', value: '7' },
      { label: 'Recent runs', value: '14' },
      { label: 'Approval gates', value: '1' },
    ],
    interface: {
      inputs: ['Target context', 'Candidate sequences', 'Experimental constraints'],
      outputs: ['Ranked candidates', 'Experiment order draft', 'Optimization report'],
      permissions: ['Human confirmation for top candidates', 'Approval for lab order'],
    },
    sections: [
      {
        title: 'Access',
        items: ['Auto-call allowed inside active Threads', 'Lab order submission requires approval'],
      },
      {
        title: 'Usage',
        items: ['Recently used in EGFR 抗体亲和力优化', 'Available across antibody Projects'],
      },
    ],
    recentActivity: [
      'Ran candidate triage in EGFR 抗体亲和力优化',
      'Updated wet-lab order template mapping',
    ],
    steps: [
      'Context intake',
      'Structure analysis',
      'Candidate ranking',
      'Risk review',
      'Wet-lab order drafting',
      'Human confirmation',
      'Report generation',
    ],
  },
  {
    id: 'pipeline-protein-stability',
    kind: 'pipeline',
    name: 'Protein Stability Redesign',
    description:
      'Screens residue-level stability risks and proposes redesign candidates with expression and aggregation safeguards.',
    status: 'active',
    source: 'preset',
    owner: 'Protein Design Team',
    version: 'v1.8',
    tags: ['protein design', 'stability', 'screening'],
    lastUsedAt: '2 days ago',
    updatedAt: '2026-05-22',
    metrics: [
      { label: 'Steps', value: '6' },
      { label: 'Recent runs', value: '9' },
      { label: 'Outputs', value: '4' },
    ],
    interface: {
      inputs: ['Protein sequence', 'Structure model', 'Design constraints'],
      outputs: ['Mutation shortlist', 'Stability report', 'Expression risk table'],
      permissions: ['Human confirmation before downstream validation'],
    },
    sections: [
      { title: 'Access', items: ['Auto-call allowed for read-only analysis'] },
      { title: 'Usage', items: ['Used in enzyme redesign demo Threads'] },
    ],
    recentActivity: ['Added aggregation-risk summary block'],
    steps: ['Sequence intake', 'Structure mapping', 'Mutation proposal', 'Risk ranking', 'Report draft', 'Review'],
  },
  {
    id: 'pipeline-wetlab-order',
    kind: 'pipeline',
    name: 'Wet-lab Validation Order Pipeline',
    description:
      'Turns selected molecules and assay requirements into a reviewable experiment order draft.',
    status: 'needs-review',
    source: 'created',
    owner: 'Experimental Operations',
    version: 'v0.9',
    tags: ['wet-lab', 'order', 'approval'],
    lastUsedAt: '4 days ago',
    updatedAt: '2026-05-20',
    metrics: [
      { label: 'Steps', value: '5' },
      { label: 'Approval gates', value: '2' },
      { label: 'Drafts', value: '6' },
    ],
    interface: {
      inputs: ['Candidate molecules', 'Assay panel', 'Delivery timeline'],
      outputs: ['Experiment order draft', 'Reviewer checklist'],
      permissions: ['Approval required before submission'],
    },
    sections: [
      { title: 'Access', items: ['Draft-only until permissions review is complete'] },
      { title: 'Usage', items: ['Used by antibody validation workflows'] },
    ],
    recentActivity: ['Permissions review requested for CRO connector'],
    steps: ['Candidate validation', 'Assay mapping', 'Order draft', 'Approval gate', 'Submission package'],
  },
  {
    id: 'pipeline-dataset-curation',
    kind: 'pipeline',
    name: 'AI-ready Dataset Curation',
    description:
      'Normalizes experiment tables, labels assay metadata, and prepares AI-ready datasets for model reuse.',
    status: 'active',
    source: 'installed',
    owner: 'Data Assetization Team',
    version: 'v1.4',
    tags: ['dataset', 'assetization', 'metadata'],
    lastUsedAt: '1 week ago',
    updatedAt: '2026-05-18',
    metrics: [
      { label: 'Steps', value: '6' },
      { label: 'Datasets', value: '11' },
      { label: 'Checks', value: '8' },
    ],
    interface: {
      inputs: ['Raw assay tables', 'Project metadata', 'Labeling rules'],
      outputs: ['AI-ready dataset', 'Quality report', 'Schema summary'],
      permissions: ['Read project files', 'Create dataset assets'],
    },
    sections: [
      { title: 'Access', items: ['Can create dataset assets after confirmation'] },
      { title: 'Usage', items: ['Used in Data Assetization Projects'] },
    ],
    recentActivity: ['Generated schema summary for assay panel import'],
    steps: ['File intake', 'Schema inference', 'Data cleaning', 'Metadata labeling', 'Quality checks', 'Asset registration'],
  },
  {
    id: 'pipeline-candidate-triage',
    kind: 'pipeline',
    name: 'Molecule Candidate Triage',
    description:
      'Compares candidate molecules across predicted activity, manufacturability, novelty, and validation readiness.',
    status: 'draft',
    source: 'created',
    owner: 'Discovery Strategy',
    version: 'v0.4',
    tags: ['candidate', 'triage', 'ranking'],
    updatedAt: '2026-05-24',
    metrics: [
      { label: 'Steps', value: '4' },
      { label: 'Draft checks', value: '5' },
      { label: 'Owners', value: '2' },
    ],
    interface: {
      inputs: ['Candidate list', 'Selection criteria', 'Reference assets'],
      outputs: ['Prioritized shortlist', 'Risk summary'],
      permissions: ['Human confirmation before recommendation'],
    },
    sections: [
      { title: 'Access', items: ['Draft pipeline; not auto-callable yet'] },
      { title: 'Usage', items: ['No production demo usage yet'] },
    ],
    recentActivity: ['Drafted ranking criteria from discovery team notes'],
    steps: ['Criteria intake', 'Evidence matching', 'Score normalization', 'Shortlist draft'],
  },
  {
    id: 'skill-protein-design',
    kind: 'skill',
    name: 'Operate Protein Design',
    description:
      'Guides the Main Agent through protein design tasks, from constraint intake to mutation rationale.',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skills',
    version: 'v3.1',
    tags: ['protein design', 'preset'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: 'Today',
    updatedAt: '2026-05-30',
    metrics: [
      { label: 'Triggers', value: '8' },
      { label: 'Examples', value: '6' },
      { label: 'Scope', value: 'Design' },
    ],
    interface: {
      inputs: ['Design goal', 'Sequence or structure context', 'Constraints'],
      outputs: ['Design rationale', 'Candidate changes', 'Next-step plan'],
      permissions: ['Guidance only; no direct execution command'],
    },
    sections: [
      { title: 'Instructions', items: ['Clarify design objective before proposing mutations', 'Separate scientific rationale from execution steps'] },
      { title: 'Usage', items: ['Used when protein design intent is detected'] },
    ],
    recentActivity: ['Loaded during protein stability redesign demo'],
    instructions: [
      'Ask for target, sequence context, and hard constraints before proposing designs.',
      'Explain mutation rationale with structure, expression, and assay tradeoffs.',
    ],
    triggers: ['protein redesign', 'mutation proposal', 'stability optimization'],
    examples: ['Design a safer EGFR variant shortlist', 'Explain why a mutation improves thermal stability'],
  },
  {
    id: 'skill-wetlab',
    kind: 'skill',
    name: 'Operate Wet-lab Experiments',
    description:
      'Helps the Main Agent draft validation plans, assay requests, and experiment handoff notes.',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skills',
    version: 'v2.7',
    tags: ['wet-lab', 'preset'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '18 hours ago',
    updatedAt: '2026-05-28',
    metrics: [
      { label: 'Triggers', value: '7' },
      { label: 'Examples', value: '5' },
      { label: 'Scope', value: 'Lab' },
    ],
    interface: {
      inputs: ['Candidate molecules', 'Assay intent', 'Timeline'],
      outputs: ['Experiment plan', 'Order draft language', 'Review checklist'],
      permissions: ['Approval required for real submission'],
    },
    sections: [
      { title: 'Instructions', items: ['Separate draft orders from submitted orders', 'Call out approval gates before high-impact actions'] },
      { title: 'Usage', items: ['Used in EGFR wet-lab order drafting'] },
    ],
    recentActivity: ['Prepared EGFR validation order wording'],
    instructions: ['Draft orders as reviewable proposals, not submitted orders.', 'Make sample prep and measurement assumptions explicit.'],
    triggers: ['validation plan', 'experiment order', 'wet-lab handoff'],
    examples: ['Draft a BLI validation plan', 'Prepare a CRO handoff note'],
  },
  {
    id: 'skill-experiment-data',
    kind: 'skill',
    name: 'Analyze Experimental Data',
    description:
      'Supports assay table interpretation, outlier review, and result summary drafting.',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skills',
    version: 'v2.2',
    tags: ['analysis', 'assay'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '3 days ago',
    updatedAt: '2026-05-25',
    metrics: [
      { label: 'Triggers', value: '9' },
      { label: 'Examples', value: '4' },
      { label: 'Scope', value: 'Data' },
    ],
    interface: {
      inputs: ['Assay table', 'Controls', 'Analysis question'],
      outputs: ['Interpretation', 'Outlier notes', 'Summary chart brief'],
      permissions: ['Read project files'],
    },
    sections: [
      { title: 'Instructions', items: ['Separate observed data from inferred interpretation', 'Flag missing controls'] },
      { title: 'Usage', items: ['Used in assay result summary Threads'] },
    ],
    recentActivity: ['Summarized BLI affinity table'],
    instructions: ['Check controls and units before summarizing.', 'Make uncertainty visible in the answer.'],
    triggers: ['analyze assay', 'interpret results', 'summarize table'],
    examples: ['Summarize SEC-HPLC purity results', 'Find outliers in BLI sensorgrams'],
  },
  {
    id: 'skill-report',
    kind: 'skill',
    name: 'Prepare R&D Report',
    description:
      'Guides report structure for candidate decisions, experiment results, and project delivery updates.',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skills',
    version: 'v1.9',
    tags: ['report', 'preset'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '5 days ago',
    updatedAt: '2026-05-21',
    metrics: [
      { label: 'Templates', value: '4' },
      { label: 'Examples', value: '5' },
      { label: 'Scope', value: 'Reporting' },
    ],
    interface: {
      inputs: ['Decision context', 'Evidence blocks', 'Audience'],
      outputs: ['Structured report', 'Executive summary', 'Evidence appendix'],
      permissions: ['Read transcript evidence'],
    },
    sections: [
      { title: 'Instructions', items: ['Lead with decision context', 'Tie claims to visible evidence'] },
      { title: 'Usage', items: ['Used for candidate report drafting'] },
    ],
    recentActivity: ['Generated report skeleton for EGFR optimization'],
    instructions: ['Keep conclusions separate from next steps.', 'Use evidence-backed bullets for scientific claims.'],
    triggers: ['prepare report', 'summarize project', 'write delivery update'],
    examples: ['Create an EGFR optimization report outline', 'Summarize experiment outcomes for leadership'],
  },
  {
    id: 'skill-egfr-review',
    kind: 'skill',
    name: 'EGFR Candidate Review Checklist',
    description:
      'Created checklist for reviewing EGFR antibody candidate readiness before wet-lab validation.',
    status: 'active',
    source: 'created',
    owner: 'zhengjun',
    version: 'v0.6',
    tags: ['EGFR', 'checklist'],
    enabledForMainAgent: true,
    lastUsedAt: 'Yesterday',
    updatedAt: '2026-05-30',
    metrics: [
      { label: 'Checklist items', value: '12' },
      { label: 'Examples', value: '3' },
      { label: 'Scope', value: 'Review' },
    ],
    interface: {
      inputs: ['Candidate table', 'Project constraints'],
      outputs: ['Review checklist', 'Risk notes'],
      permissions: ['Guidance only'],
    },
    sections: [
      { title: 'Instructions', items: ['Check affinity, expression, stability, and assay feasibility'] },
      { title: 'Usage', items: ['Created for EGFR optimization demo'] },
    ],
    recentActivity: ['Added expression-risk checkpoint'],
    instructions: ['Review top candidates against affinity, expression, and validation readiness.'],
    triggers: ['EGFR candidate review', 'top candidate checklist'],
    examples: ['Review EGFR-AF-01 before validation'],
  },
  {
    id: 'skill-cro-handoff',
    kind: 'skill',
    name: 'CRO Handoff Formatter',
    description:
      'Installed formatter for creating concise CRO-facing experiment handoff notes.',
    status: 'active',
    source: 'installed',
    owner: 'Experimental Operations',
    version: 'v1.1',
    tags: ['CRO', 'handoff'],
    enabledForMainAgent: false,
    updatedAt: '2026-05-19',
    metrics: [
      { label: 'Formats', value: '3' },
      { label: 'Examples', value: '4' },
      { label: 'Scope', value: 'Ops' },
    ],
    interface: {
      inputs: ['Experiment draft', 'Recipient context'],
      outputs: ['CRO handoff note'],
      permissions: ['External sharing requires review'],
    },
    sections: [
      { title: 'Instructions', items: ['Use concise operational language', 'Flag external sharing review'] },
      { title: 'Usage', items: ['Installed for operations demos'] },
    ],
    recentActivity: ['Disabled for Main Agent pending wording review'],
    instructions: ['Format experiment plans for CRO recipients with clear assumptions and deliverables.'],
    triggers: ['CRO handoff', 'external experiment note'],
    examples: ['Format a BLI assay request for CRO review'],
  },
  {
    id: 'mcp-structure-tools',
    kind: 'mcp-server',
    name: 'BioMap Structure Tools',
    description:
      'Connected provider for structure scoring, surface coloring, and mutation-map resources.',
    status: 'active',
    source: 'system',
    connectionStatus: 'connected',
    owner: 'Platform Integrations',
    version: 'v1.6',
    tags: ['structure', 'MCP'],
    lastUsedAt: '18 hours ago',
    updatedAt: '2026-05-27',
    metrics: [
      { label: 'Tools', value: '8' },
      { label: 'Resources', value: '5' },
      { label: 'Mode', value: 'Read-only' },
    ],
    interface: {
      inputs: ['Structure id', 'Mutation list', 'Scoring request'],
      outputs: ['Structure scores', 'Surface maps', 'Artifact references'],
      permissions: ['Read-only provider', 'No external transmission'],
    },
    sections: [
      { title: 'Access', items: ['Read-only structure tools', 'Auto-call allowed in active Threads'] },
      { title: 'Usage', items: ['Supports EGFR structure analysis replay'] },
    ],
    recentActivity: ['Returned structure_scores.json for EGFR replay'],
    tools: ['structure.analyze', 'structure.colorSurface', 'mutation.map', 'stability.score'],
    resources: ['project-structures', 'mutation-libraries', 'surface-coloring-presets'],
  },
  {
    id: 'mcp-experiment-order',
    kind: 'mcp-server',
    name: 'Experiment Order System',
    description:
      'Provider for drafting experiment orders and checking approval readiness.',
    status: 'needs-review',
    source: 'installed',
    connectionStatus: 'needs-review',
    owner: 'Experimental Operations',
    version: 'v0.8',
    tags: ['order', 'MCP', 'approval'],
    updatedAt: '2026-05-24',
    metrics: [
      { label: 'Tools', value: '5' },
      { label: 'Resources', value: '2' },
      { label: 'Mode', value: 'Draft-only' },
    ],
    interface: {
      inputs: ['Order draft payload', 'Project context'],
      outputs: ['Draft id', 'Approval checklist'],
      permissions: ['Draft-only until review completes'],
    },
    sections: [
      { title: 'Access', items: ['Submission disabled in demo', 'Approval required for real orders'] },
      { title: 'Usage', items: ['Used by Wet-lab Validation Order Pipeline'] },
    ],
    recentActivity: ['Permission review requested'],
    tools: ['order.createDraft', 'order.validate', 'approval.preview'],
    resources: ['assay-catalog', 'order-templates'],
  },
  {
    id: 'mcp-dataset-registry',
    kind: 'mcp-server',
    name: 'Dataset Registry',
    description:
      'Connected provider for discovering and registering AI-ready dataset assets.',
    status: 'active',
    source: 'system',
    connectionStatus: 'connected',
    owner: 'Data Platform',
    version: 'v2.0',
    tags: ['dataset', 'MCP'],
    lastUsedAt: '1 week ago',
    updatedAt: '2026-05-17',
    metrics: [
      { label: 'Tools', value: '6' },
      { label: 'Resources', value: '7' },
      { label: 'Mode', value: 'Create assets' },
    ],
    interface: {
      inputs: ['Dataset schema', 'Metadata labels'],
      outputs: ['Registered asset id', 'Quality report'],
      permissions: ['Create dataset assets after confirmation'],
    },
    sections: [
      { title: 'Access', items: ['Can register dataset assets with confirmation'] },
      { title: 'Usage', items: ['Supports AI-ready Dataset Curation'] },
    ],
    recentActivity: ['Registered assay dataset demo asset'],
    tools: ['dataset.search', 'dataset.register', 'schema.validate'],
    resources: ['registered-datasets', 'schema-library', 'quality-rules'],
  },
  {
    id: 'mcp-literature',
    kind: 'mcp-server',
    name: 'Literature Search Gateway',
    description:
      'Installed provider for scoped literature lookups and citation handoff summaries.',
    status: 'inactive',
    source: 'installed',
    connectionStatus: 'inactive',
    owner: 'Knowledge Systems',
    version: 'v0.5',
    tags: ['literature', 'MCP'],
    updatedAt: '2026-05-12',
    metrics: [
      { label: 'Tools', value: '3' },
      { label: 'Resources', value: '1' },
      { label: 'Mode', value: 'Disabled' },
    ],
    interface: {
      inputs: ['Research query', 'Scope constraints'],
      outputs: ['Citation shortlist', 'Evidence summary'],
      permissions: ['External lookup disabled in demo'],
    },
    sections: [
      { title: 'Access', items: ['Inactive provider', 'Requires review before use'] },
      { title: 'Usage', items: ['No recent demo usage'] },
    ],
    recentActivity: ['Disabled during demo hardening'],
    tools: ['literature.search', 'citation.extract', 'evidence.summarize'],
    resources: ['literature-cache'],
  },
  {
    id: 'plugin-sequence-viewer',
    kind: 'plugin',
    name: 'Sequence Viewer Plugin',
    description:
      'Preview extension point for inspecting sequence alignments and annotated protein regions.',
    status: 'inactive',
    source: 'system',
    owner: 'BioMap Extensions',
    version: 'preview',
    tags: ['plugin', 'sequence'],
    updatedAt: '2026-05-10',
    metrics: [
      { label: 'State', value: 'Preview' },
      { label: 'Actions', value: 'Request' },
      { label: 'Install', value: 'Soon' },
    ],
    interface: {
      inputs: ['Sequence set', 'Annotation tracks'],
      outputs: ['Viewer panel', 'Region notes'],
      permissions: ['Placeholder only'],
    },
    sections: [
      { title: 'Access', items: ['Coming soon placeholder', 'No real installation in demo'] },
      { title: 'Usage', items: ['Reserved for sequence-heavy workflows'] },
    ],
    recentActivity: ['Preview placeholder added to Capabilities demo'],
    placeholderState: 'Coming soon',
  },
  {
    id: 'plugin-molecule-viz',
    kind: 'plugin',
    name: 'Molecule Visualization Plugin',
    description:
      'Preview plugin slot for richer molecule visualization and comparison surfaces.',
    status: 'inactive',
    source: 'system',
    owner: 'BioMap Extensions',
    version: 'preview',
    tags: ['plugin', 'visualization'],
    updatedAt: '2026-05-10',
    metrics: [
      { label: 'State', value: 'Preview' },
      { label: 'Actions', value: 'Request' },
      { label: 'Install', value: 'Soon' },
    ],
    interface: {
      inputs: ['Molecule ids', 'Visualization mode'],
      outputs: ['Interactive view placeholder'],
      permissions: ['Placeholder only'],
    },
    sections: [
      { title: 'Access', items: ['Coming soon placeholder', 'No real installation in demo'] },
      { title: 'Usage', items: ['Reserved for molecule comparison workflows'] },
    ],
    recentActivity: ['Preview placeholder added to Capabilities demo'],
    placeholderState: 'Coming soon',
  },
  {
    id: 'plugin-cro-connector',
    kind: 'plugin',
    name: 'External CRO Connector',
    description:
      'Preview extension for future CRO-facing package exchange and status updates.',
    status: 'needs-review',
    source: 'installed',
    owner: 'Experimental Operations',
    version: 'preview',
    tags: ['plugin', 'CRO'],
    updatedAt: '2026-05-13',
    metrics: [
      { label: 'State', value: 'Preview' },
      { label: 'Review', value: 'Needed' },
      { label: 'Install', value: 'Soon' },
    ],
    interface: {
      inputs: ['Experiment package', 'Recipient metadata'],
      outputs: ['Connector handoff placeholder'],
      permissions: ['External sharing review required'],
    },
    sections: [
      { title: 'Access', items: ['Preview only', 'External sharing disabled in demo'] },
      { title: 'Usage', items: ['Reserved for CRO handoff flows'] },
    ],
    recentActivity: ['Marked for future connector review'],
    placeholderState: 'Preview',
  },
]

export const capabilityTypeLabels: Record<CapabilityEntryKind, string> = {
  pipeline: 'Pipelines',
  skill: 'Skills',
  'mcp-server': 'MCP Servers',
  plugin: 'Plugins',
}

export const capabilityTypeDescriptions: Record<CapabilityEntryKind, string> = {
  pipeline:
    'Manage biological pipelines that the Main Agent can run or adapt during R&D work.',
  skill:
    'Manage reusable Skills, including BioMap presets, user-created skills, and installed skills.',
  'mcp-server':
    'Review connected MCP servers, exposed tools, resources, and permission boundaries.',
  plugin:
    'Manage additional plugin extensions. Placeholder entries are shown for the demo.',
}

export const capabilityTypeOrder: CapabilityEntryKind[] = [
  'pipeline',
  'skill',
  'mcp-server',
  'plugin',
]
