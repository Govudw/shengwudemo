import egfrAntibodyAntigenComplex from '../assets/mock-science/egfr/egfr-antibody-antigen-complex.png'
import egfrBliSensorgram from '../assets/mock-science/egfr/egfr-bli-sensorgram.png'
import egfrCandidateHeatmap from '../assets/mock-science/egfr/egfr-candidate-heatmap.png'
import egfrCdrMutationMap from '../assets/mock-science/egfr/egfr-cdr-mutation-map.png'
import egfrOrderWorkflow from '../assets/mock-science/egfr/egfr-order-workflow.png'
import egfrParetoOptimization from '../assets/mock-science/egfr/egfr-pareto-optimization.png'
import egfrResultSummaryChart from '../assets/mock-science/egfr/egfr-result-summary-chart.png'
import egfrSecHplcChromatogram from '../assets/mock-science/egfr/egfr-sec-hplc-chromatogram.png'
import il17aCdrSiteEvidenceMap from '../assets/mock-science/il17a/il17a-cdr-site-evidence-map.png'
import il17aDiscordancePlot from '../assets/mock-science/il17a/il17a-discordance-plot.png'
import il17aHypothesisTriageDiagram from '../assets/mock-science/il17a/il17a-hypothesis-triage-diagram.png'
import il17aLibraryAssayDesignMatrix from '../assets/mock-science/il17a/il17a-library-assay-design-matrix.png'
import il17aVariantEvidenceHeatmap from '../assets/mock-science/il17a/il17a-variant-evidence-heatmap.png'
import her2ExperimentOrderExecutionFlow from '../assets/mock-science/her2/her2-experiment-order-execution-flow.png'
import her2ExperimentResultPackageSummary from '../assets/mock-science/her2/her2-experiment-result-package-summary.png'
import her2ExpressionPurificationQc from '../assets/mock-science/her2/her2-expression-purification-qc.png'
import her2SamplePlateMap from '../assets/mock-science/her2/her2-sample-plate-map.png'
import her2SecDsfBliQcDashboard from '../assets/mock-science/her2/her2-sec-dsf-bli-qc-dashboard.png'
import her2CurveFitDiagnostics from '../assets/mock-science/her2-post-analysis/her2-curve-fit-diagnostics.png'
import her2ModelConsensusAnalysis from '../assets/mock-science/her2-post-analysis/her2-model-consensus-analysis.png'
import her2ResultPackageQcOverview from '../assets/mock-science/her2-post-analysis/her2-result-package-qc-overview.png'
import her2StructuralHypothesisMap from '../assets/mock-science/her2-post-analysis/her2-structural-hypothesis-map.png'
import her2UncertaintySensitivityAnalysis from '../assets/mock-science/her2-post-analysis/her2-uncertainty-sensitivity-analysis.png'
import type { ConversationTurn, RunInspectorData } from './conversationTypes'

export type Thread = {
  id: string
  title: string
  lastActivity: string
  transcript?: ConversationTurn[]
  runInspector?: RunInspectorData
}

export type Project = {
  id: string
  name: string
  threads: Thread[]
}

export type CapabilityChip = {
  id: string
  label: string
  prompt?: string
}

export type UseCaseCard = {
  id: string
  icon: 'target' | 'flask' | 'database' | 'brain' | 'report' | 'package'
  tone: 'cyan' | 'blue' | 'teal' | 'violet' | 'amber'
  title: string
  summary: string
  input: string
  output: string
  prompt: string
}

export const egfrAffinityTranscript: ConversationTurn[] = [
  {
    id: 'egfr-turn-001',
    role: 'user',
    markdown:
      '帮我把 EGFR 抗体亲和力优化到 1 nM 以下，优先不要牺牲表达量和稳定性。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'EGFR_parent_antibody_baseline.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Inputs',
        note: 'XLSX · 42 KB · 已保存为 Project File',
      },
    ],
  },
  {
    id: 'egfr-turn-002',
    role: 'mainAgent',
    markdown:
      '我读取了当前项目和你上传的基线表。这个对话里已有一个 parent antibody，可以复用上一轮 MOO 结果和实验基线。\n\n目标约束：\n\n- 主目标：BLI KD < **1 nM**\n- 表达量：不低于 **35 mg/L**\n- SEC-HPLC monomer：不低于 **95%**\n- Tm 下降：不超过 **2 C**\n- 聚集风险：排除 High',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'FileReader.extractBaseline',
        status: 'success',
        summary: '提取 parent antibody 和上一轮实验基线',
        defaultCollapsed: true,
        input: {
          file: 'EGFR_parent_antibody_baseline.xlsx',
          project: 'Antibody Optimization / EGFR 抗体亲和力优化',
        },
        output: {
          parentAntibody: 'EGFR-P0',
          historicalBliKd: '8.4 nM',
          expression: '42 mg/L',
          secHplcMonomer: '96.8%',
          tm: '66.1 C',
        },
        duration: '4.8s',
        artifacts: [
          {
            name: 'EGFR_baseline_extract.json',
            kind: 'json',
            description: 'Parent antibody、历史 BLI、表达量、纯度和 Tm 基线。',
          },
        ],
      },
    ],
  },
  {
    id: 'egfr-turn-003',
    role: 'mainAgent',
    markdown:
      '我先检查 parent antibody 与 EGFR-ECD 的复合物结构，重点看 CDR 接触面和可变区风险位点。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'StructureAnalyzer.run',
        status: 'success',
        summary: '识别 7 个抗原接触位点',
        defaultCollapsed: true,
        input: {
          structure: 'BM-EGFR-01_AF2_complex.pdb',
          antigen: 'EGFR_ECD',
          chains: ['heavy', 'light', 'antigen'],
        },
        output: {
          contactSites: 7,
          priorityRegions: ['HCDR3', 'LCDR1'],
          excludedRegions: ['framework'],
        },
        duration: '12.4s',
        artifacts: [
          {
            name: 'EGFR_structure_contact_map.json',
            kind: 'json',
            description: '抗原接触位点、CDR 接触区域和结构风险摘要。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'egfr-antibody-antigen-complex',
        title: 'EGFR antibody-antigen complex',
        description: '抗体可变区与 EGFR-ECD 复合物结构，标出主要 CDR 接触面。',
        imagegenPrompt:
          'Scientific report-style molecular visualization of an antibody-antigen complex, EGFR extracellular domain bound by an antibody variable region, highlighted contact interface, clean white background, soft blue antibody, teal antigen, annotated CDR loops, high-resolution biomedical illustration, no brand UI, no real sequence text.',
        placeholder: '图片：抗体-抗原复合物结构图，突出 EGFR-ECD 和 CDR 接触界面。',
        src: egfrAntibodyAntigenComplex,
        width: 720,
        height: 480,
        alt: 'Scientific illustration of an EGFR antibody-antigen complex with highlighted CDR contact interface',
      },
    ],
  },
  {
    id: 'egfr-turn-004',
    role: 'mainAgent',
    markdown:
      '结构检查显示，HCDR3 和 LCDR1 是主要可优化区域。HCDR3 Y102 附近存在可增强疏水接触的空间，但不建议大幅增加侧链体积。\n\n我会把候选限制在低风险小步突变：\n\n- 优先 HCDR3: Y102 / D100a\n- 次优先 LCDR1: S31\n- 避免 framework 区域突变\n- 避免引入明显聚集热点',
  },
  {
    id: 'egfr-turn-005',
    role: 'mainAgent',
    markdown: '我把 CDR 区域的可设计位点和禁用位点标注出来，用于约束候选生成。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'MutationSiteMapper.mapCdrHotspots',
        status: 'success',
        summary: '标注 5 个可设计位点和 3 个禁用位点',
        defaultCollapsed: true,
        input: {
          structureMap: 'EGFR_structure_contact_map.json',
          sequence: 'BM-EGFR-01_heavy_light.fasta',
          cdrDefinition: 'IMGT',
        },
        output: {
          designSites: ['H:Y102', 'H:D100a', 'L:S31', 'L:N92', 'H:T57'],
          disabledSites: ['H:W47', 'L:F36', 'H:C22'],
          priority: ['HCDR3', 'LCDR1'],
        },
        duration: '7.9s',
        artifacts: [
          {
            name: 'EGFR_cdr_hotspots.csv',
            kind: 'csv',
            description: 'CDR 位点、优先级、接触证据和风险标签。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'egfr-cdr-mutation-map',
        title: 'CDR mutation hotspot map',
        description: 'HCDR3 和 LCDR1 的优先设计位点、禁用风险位点和界面位置。',
        imagegenPrompt:
          'Scientific diagram showing antibody CDR mutation hotspot map, HCDR3 and LCDR1 highlighted, colored markers for priority design sites and disabled risk sites, clean biomedical report figure, labels large enough to imply regions but not requiring exact readable text.',
        placeholder: '图片：CDR 突变位点标注图，包含优先设计位点和禁用风险位点。',
        src: egfrCdrMutationMap,
        width: 780,
        height: 520,
        alt: 'Scientific CDR mutation hotspot map for EGFR antibody optimization',
      },
    ],
  },
  {
    id: 'egfr-turn-006',
    role: 'mainAgent',
    markdown: '我基于结构约束、上一轮实验基线和自然性评分生成候选组合，并用多目标优化排序。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'AffinityOptimizer.generateCandidates',
        status: 'success',
        summary: '生成 64 个候选并筛出 8 个低风险组合',
        defaultCollapsed: true,
        input: {
          parent: 'EGFR-P0',
          targetKd: '<1 nM',
          expressionFloor: '35 mg/L',
          stabilityDropLimit: '2 C',
          excludedRisk: 'High',
        },
        output: {
          generatedCandidates: 64,
          lowRiskCandidates: 8,
          topCandidates: ['EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03', 'EGFR-AF-04'],
        },
        duration: '31.6s',
        artifacts: [
          {
            name: 'EGFR_affinity_candidate_ranking.xlsx',
            kind: 'xlsx',
            description: '候选突变组合、预测 KD、表达风险、稳定性风险和综合排序。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'egfr-pareto-optimization',
        title: 'Pareto optimization frontier',
        description: '亲和力预测与 developability 风险的多目标优化结果，Top candidates 已高亮。',
        imagegenPrompt:
          'Multi-objective optimization Pareto scatter plot for antibody candidates, axes for predicted affinity and developability risk, highlighted top candidates, professional scientific data visualization, clean grid, muted colors, no brand UI, synthetic data.',
        placeholder: '图片：Pareto 多目标优化散点图，突出 EGFR-AF-01 到 EGFR-AF-04。',
        src: egfrParetoOptimization,
        width: 780,
        height: 520,
        alt: 'Pareto scatter plot for predicted EGFR antibody affinity and developability risk',
      },
    ],
  },
  {
    id: 'egfr-turn-007',
    role: 'mainAgent',
    markdown:
      '候选分子初筛结果：\n\n| Candidate | Mutation | Predicted KD | Expression risk | Stability risk | Recommendation |\n| --- | --- | ---: | --- | --- | --- |\n| EGFR-AF-01 | H:Y102F + L:S31Y | 0.42 nM | Low | Low | Top 1 |\n| EGFR-AF-02 | H:D100aN + H:Y102W | 0.55 nM | Medium | Medium | Top 2 |\n| EGFR-AF-03 | L:S31Y + L:N92D | 0.68 nM | Low | Low | Top 3 |\n| EGFR-AF-04 | H:Y102F + H:T57S | 0.74 nM | Low | Medium | Backup |\n\n我建议先推进 EGFR-AF-01、EGFR-AF-02、EGFR-AF-03。EGFR-AF-04 保留为备选，不进入第一批湿实验。',
    contentBlocks: [
      {
        type: 'scientificFigure',
        figureId: 'egfr-candidate-heatmap',
        title: 'Candidate scoring heatmap',
        description: '候选分子在预测 KD、表达风险、稳定性风险和综合推荐上的评分热力图。',
        imagegenPrompt:
          'Scientific heatmap comparing antibody candidate scores across predicted affinity, expression risk, stability risk, aggregation risk, and recommendation rank, clean biomedical report style, synthetic values, no brand UI.',
        placeholder: '图片：候选分子综合评分热力图。',
        src: egfrCandidateHeatmap,
        width: 900,
        height: 450,
        alt: 'Heatmap comparing EGFR antibody candidate predicted affinity and developability scores',
      },
    ],
  },
  {
    id: 'egfr-turn-008',
    role: 'mainAgent',
    markdown: '已记录候选选择，后续湿实验验证只推进 Top 3 候选。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · 选择 Top 3 候选进入湿实验验证',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-05-28 14:16',
        decision: 'EGFR-AF-01、EGFR-AF-02、EGFR-AF-03 进入湿实验验证',
      },
    ],
  },
  {
    id: 'egfr-turn-009',
    role: 'mainAgent',
    markdown:
      '我开始生成 Experiment Order Draft。验证项目包括表达、小量纯化、BLI、SEC-HPLC 和 DSF。\n\n失败原因不是系统异常，而是当前样本需求和验证范围不匹配。我会调整样本量和 replicate 设计后重试。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentOrderDraft.create',
        status: 'failed',
        summary: '样本量不足，无法覆盖 3 个候选的 BLI 三重复',
        defaultCollapsed: true,
        input: {
          molecules: ['EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03'],
          assays: ['expression', 'small-scale purification', 'BLI', 'SEC-HPLC', 'DSF'],
          bliRepeats: 3,
        },
        output: {
          failureReason: 'sample requirement mismatch',
          requiredAntigenMass: 'higher than current allocation',
          suggestedAction: 'recalculate sample requirements and batch design',
        },
        duration: '5.2s',
      },
    ],
  },
  {
    id: 'egfr-turn-010',
    role: 'mainAgent',
    markdown:
      '我保留 BLI 三重复，因为这是亲和力优化判断的核心证据。表达和纯化采用独立小量批次，避免 AF-02 的潜在表达风险影响其他候选。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'SampleRequirementEstimator.recalculate',
        status: 'success',
        summary: '将 BLI 三重复保留，表达和纯化按候选分子独立批次执行',
        defaultCollapsed: true,
        input: {
          molecules: 4,
          controls: ['EGFR-P0'],
          requiredAssays: ['expression', 'purification', 'BLI', 'SEC-HPLC', 'DSF'],
        },
        output: {
          bliRepeats: 3,
          expressionBatches: 'independent per molecule',
          purifiedProteinTarget: '0.35 mg per molecule',
          antigenAllocation: 'within available amount',
        },
        duration: '6.1s',
      },
    ],
  },
  {
    id: 'egfr-turn-011',
    role: 'mainAgent',
    markdown:
      'Experiment Order Draft：\n\n- Order ID: `BM-LAB-EGFR-20260528-001`\n- Molecules: EGFR-P0, EGFR-AF-01, EGFR-AF-02, EGFR-AF-03\n- Assays: expression, small-scale purification, BLI, SEC-HPLC, DSF\n- BLI design: 3 repeats, EGFR-ECD antigen, kinetic fit by 1:1 binding model\n- Acceptance criteria: KD < 1 nM, monomer > 95%, expression > 35 mg/L',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentOrderDraft.create',
        status: 'success',
        summary: '生成 Experiment Order Draft',
        defaultCollapsed: true,
        input: {
          orderId: 'BM-LAB-EGFR-20260528-001',
          molecules: ['EGFR-P0', 'EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03'],
          acceptanceCriteria: ['KD < 1 nM', 'monomer > 95%', 'expression > 35 mg/L'],
        },
        output: {
          status: 'draft',
          route: 'CRO validated antibody expression and binding workflow',
          estimatedTurnaround: '7 days',
        },
        duration: '8.5s',
        artifacts: [
          {
            name: 'BM-LAB-EGFR-20260528-001_draft.md',
            kind: 'md',
            description: '实验订单草稿、样本需求和验收标准。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'egfr-order-workflow',
        title: 'Experiment order workflow',
        description: '从候选分子到表达、纯化、BLI、SEC-HPLC 和 DSF 的实验订单设计流程。',
        imagegenPrompt:
          'Clean scientific workflow diagram for antibody experiment order draft, showing candidate selection, expression, purification, BLI binding assay, SEC-HPLC, DSF, and result return, no brand UI, biomedical report style.',
        placeholder: '图片：Experiment Order Draft 设计流程图。',
        src: egfrOrderWorkflow,
        width: 900,
        height: 450,
        alt: 'Workflow diagram for EGFR antibody experiment order validation assays',
      },
    ],
  },
  {
    id: 'egfr-turn-012',
    role: 'mainAgent',
    markdown: '实验订单提交已通过审批，当前对话继续记录提交和执行回放。',
    contentBlocks: [
      {
        type: 'approvalRequestReplay',
        title: 'approval.approved · 提交 Experiment Order',
        approvalType: 'experimentOrder',
        status: 'approved',
        decidedBy: 'zhengjun',
        decidedAt: '2026-05-28 14:24',
        decision: '确认提交 BM-LAB-EGFR-20260528-001',
        requestSummary:
          '提交 EGFR-AF-01、EGFR-AF-02、EGFR-AF-03 与 parent control 的表达、小量纯化、BLI、SEC-HPLC 和 DSF 验证。',
      },
    ],
  },
  {
    id: 'egfr-turn-013',
    role: 'mainAgent',
    markdown:
      '订单已提交。接下来进入湿实验执行阶段，预计 7 天返回表达、纯化、BLI、SEC-HPLC 和 DSF 数据。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentOrder.submit',
        status: 'success',
        summary: '已提交 Experiment Order 并锁定 CRO 路由',
        defaultCollapsed: true,
        input: {
          orderId: 'BM-LAB-EGFR-20260528-001',
          approvalStatus: 'approved',
          route: 'validated CRO route',
        },
        output: {
          submittedAt: '2026-05-28 14:25',
          executionStatus: 'queued',
          expectedResultReturn: '2026-06-04',
        },
        duration: '3.4s',
      },
    ],
  },
  {
    id: 'egfr-turn-014',
    role: 'mainAgent',
    markdown: '湿实验执行已完成，结果文件已回传到当前项目。',
    contentBlocks: [
      {
        type: 'elapsedWorkReplay',
        target: 'waiting · ExperimentTask.execution',
        elapsed: '7 days',
        status: 'completed',
        summary: '表达、小量纯化、BLI、SEC-HPLC、DSF 已完成，结果文件已回传。',
      },
    ],
  },
  {
    id: 'egfr-turn-015',
    role: 'mainAgent',
    markdown: '我导入实验结果，先检查 BLI sensorgram 和拟合结果是否支持 KD 判断。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentResultReader.importResults',
        status: 'success',
        summary: '导入 4 个分子的表达、BLI、SEC-HPLC 和 DSF 结果',
        defaultCollapsed: true,
        input: {
          orderId: 'BM-LAB-EGFR-20260528-001',
          files: ['round2_expression.xlsx', 'round2_bli.xlsx', 'round2_sec_hplc.xlsx', 'round2_dsf.xlsx'],
        },
        output: {
          molecules: ['EGFR-P0', 'EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03'],
          assayGroups: ['expression', 'BLI', 'SEC-HPLC', 'DSF'],
          importWarnings: 0,
        },
        duration: '9.7s',
        artifacts: [
          {
            name: 'EGFR_round2_raw_assay_bundle.xlsx',
            kind: 'xlsx',
            description: '表达、BLI、SEC-HPLC 和 DSF 原始结果集合。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'egfr-bli-sensorgram',
        title: 'BLI sensorgram',
        description: 'Parent 与 Top 3 候选对 EGFR-ECD 的结合和解离曲线。',
        imagegenPrompt:
          'BLI sensorgram plot comparing parent antibody and three EGFR affinity optimized candidates binding to EGFR-ECD, association and dissociation curves, clean scientific chart, synthetic data, no brand UI.',
        placeholder: '图片：BLI sensorgram 曲线，比较 EGFR-P0 与 EGFR-AF-01 到 EGFR-AF-03。',
        src: egfrBliSensorgram,
        width: 780,
        height: 520,
        alt: 'BLI sensorgram curves comparing EGFR parent antibody and optimized candidates',
      },
    ],
  },
  {
    id: 'egfr-turn-016',
    role: 'mainAgent',
    markdown:
      '实验结果摘要：\n\n| Molecule | BLI KD | Expression | SEC-HPLC monomer | Tm | Decision |\n| --- | ---: | ---: | ---: | ---: | --- |\n| EGFR-P0 | 8.4 nM | 42 mg/L | 96.8% | 66.1 C | Baseline |\n| EGFR-AF-01 | 0.61 nM | 39 mg/L | 96.2% | 65.4 C | 推荐推进 |\n| EGFR-AF-02 | 0.48 nM | 28 mg/L | 91.7% | 63.2 C | 暂缓 |\n| EGFR-AF-03 | 0.79 nM | 41 mg/L | 95.9% | 65.7 C | 推荐推进 |\n\nAF-02 的亲和力最好，但表达量和 SEC-HPLC monomer 同时下降，不建议直接进入下一轮开发。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'BioDataAnalyzer.summarizeAssays',
        status: 'success',
        summary: '汇总亲和力、表达量、纯度和稳定性结果',
        defaultCollapsed: true,
        input: {
          normalizedResults: 'EGFR_round2_raw_assay_bundle.xlsx',
          baseline: 'EGFR-P0',
          criteria: ['KD < 1 nM', 'expression > 35 mg/L', 'monomer > 95%'],
        },
        output: {
          recommended: ['EGFR-AF-01', 'EGFR-AF-03'],
          deferred: ['EGFR-AF-02'],
          bestKd: 'EGFR-AF-02 0.48 nM',
          bestOverall: 'EGFR-AF-01',
        },
        duration: '14.2s',
        artifacts: [
          {
            name: 'EGFR_round2_assay_summary.csv',
            kind: 'csv',
            description: '归一化后的亲和力、表达量、纯度、Tm 和推荐结论。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'egfr-sec-hplc-chromatogram',
        title: 'SEC-HPLC chromatogram',
        description: 'Parent 与 Top 3 候选的 SEC-HPLC 单体峰和聚集风险对比。',
        imagegenPrompt:
          'SEC-HPLC chromatogram curves for parent antibody and three EGFR optimized candidates, monomer peak comparison, subtle aggregate shoulder for one candidate, clean scientific report chart, synthetic data, no brand UI.',
        placeholder: '图片：SEC-HPLC chromatogram 曲线，显示单体峰和聚集风险。',
        src: egfrSecHplcChromatogram,
        width: 900,
        height: 493,
        alt: 'SEC-HPLC chromatogram comparing monomer peaks for EGFR antibody candidates',
      },
    ],
  },
  {
    id: 'egfr-turn-017',
    role: 'mainAgent',
    markdown:
      '综合判断：\n\n- EGFR-AF-01 达到 KD < 1 nM，表达量和稳定性损失可接受，是当前最稳妥的推进候选。\n- EGFR-AF-03 同样达到目标，且开发风险最低，适合作为下一轮 backup lead。\n- EGFR-AF-02 虽然亲和力最好，但表达和纯度风险明显，不建议直接推进。',
    contentBlocks: [
      {
        type: 'scientificFigure',
        figureId: 'egfr-result-summary-chart',
        title: 'Round 2 result summary',
        description: '表达量、SEC-HPLC monomer、Tm 和 BLI KD 的综合结果对比。',
        imagegenPrompt:
          'Scientific summary chart comparing antibody candidates across expression, purity, thermal stability, and BLI affinity, highlighted recommended leads, clean biomedical report figure, synthetic data, no brand UI.',
        placeholder: '图片：表达量、纯度、稳定性和亲和力综合结果图。',
        src: egfrResultSummaryChart,
        width: 900,
        height: 493,
        alt: 'Summary chart comparing EGFR antibody candidate expression purity stability and affinity',
      },
    ],
  },
  {
    id: 'egfr-turn-018',
    role: 'mainAgent',
    markdown:
      '`ProjectFile.save` 已写回实验结果摘要、优化报告和下一轮设计计划。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ProjectFile.save',
        status: 'success',
        summary: '已写回实验结果摘要、优化报告和下一轮设计计划',
        defaultCollapsed: true,
        input: {
          project: 'Antibody Optimization',
          files: [
            'EGFR_affinity_optimization_report.md',
            'EGFR_round2_experiment_results.csv',
            'EGFR_next_round_design_plan.md',
          ],
        },
        output: {
          savedFiles: 3,
          report: 'EGFR_affinity_optimization_report.md',
          assayTable: 'EGFR_round2_experiment_results.csv',
          nextPlan: 'EGFR_next_round_design_plan.md',
        },
        duration: '2.6s',
        artifacts: [
          {
            name: 'EGFR_affinity_optimization_report.md',
            kind: 'md',
            description: 'Round 2 亲和力优化报告，包含候选推荐和开发风险说明。',
          },
          {
            name: 'EGFR_round2_experiment_results.csv',
            kind: 'csv',
            description: '归一化实验结果表，包含 BLI、表达量、SEC-HPLC 和 DSF 指标。',
          },
          {
            name: 'EGFR_next_round_design_plan.md',
            kind: 'md',
            description: '下一轮 developability profiling 和局部优化计划。',
          },
        ],
      },
      {
        type: 'projectFile',
        fileName: 'EGFR_affinity_optimization_report.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: 'Round 2 亲和力优化报告，包含候选推荐和开发风险说明。',
      },
      {
        type: 'projectFile',
        fileName: 'EGFR_round2_experiment_results.csv',
        fileKind: 'csv',
        location: 'Antibody Optimization / Files / Assays',
        note: '归一化实验结果表，包含 BLI、表达量、SEC-HPLC 和 DSF 指标。',
      },
      {
        type: 'projectFile',
        fileName: 'EGFR_next_round_design_plan.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Plans',
        note: '下一轮 developability profiling 和局部优化计划。',
      },
    ],
  },
  {
    id: 'egfr-turn-019',
    role: 'mainAgent',
    markdown:
      '这个闭环已经完成。\n\n最终建议：\n\n1. 推进 `EGFR-AF-01` 作为主候选进入下一轮 developability profiling。\n2. 保留 `EGFR-AF-03` 作为 backup lead。\n3. 暂缓 `EGFR-AF-02`，除非下一轮专门解决表达量和 SEC-HPLC 纯度问题。\n\n下一步行动：\n\n- 对 EGFR-AF-01 做更完整的 developability panel。\n- 对 EGFR-AF-03 做确认性 BLI 和热稳定性复测。\n- 基于 AF-01 的 H:Y102F + L:S31Y 组合，生成更保守的第三轮局部优化方案。\n\n已保存到项目文件区：\n\n- `EGFR_affinity_optimization_report.md`\n- `EGFR_round2_experiment_results.csv`\n- `EGFR_next_round_design_plan.md`',
  },
]

export const egfrRunInspector: RunInspectorData = {
  summary: {
    stage: '已完成干湿闭环',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 6,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'context',
      title: '读取上下文',
      status: 'done',
      detail: '提取 parent antibody 和历史实验基线。',
    },
    {
      id: 'structure',
      title: '结构分析',
      status: 'done',
      detail: '识别 EGFR-ECD 接触位点和 CDR 优先区域。',
    },
    {
      id: 'candidate-generation',
      title: '候选生成',
      status: 'done',
      detail: '生成并排序低风险亲和力优化候选。',
    },
    {
      id: 'candidate-confirmation',
      title: '候选确认',
      status: 'done',
      detail: '确认 Top 3 候选进入湿实验验证。',
    },
    {
      id: 'experiment-order',
      title: '实验订单',
      status: 'done',
      detail: '生成、审批并提交 Experiment Order。',
    },
    {
      id: 'wet-lab-results',
      title: '湿实验结果',
      status: 'done',
      detail: '导入表达、BLI、SEC-HPLC 和 DSF 结果。',
    },
    {
      id: 'reporting',
      title: '结果沉淀',
      status: 'done',
      detail: '写回报告、结果表和下一轮设计计划。',
    },
  ],
  outputs: [
    {
      id: 'order-draft',
      name: 'BM-LAB-EGFR-20260528-001_draft.md',
      kind: 'projectFile',
      location: 'Antibody Optimization / Files / Orders',
      status: 'saved',
    },
    {
      id: 'experiment-order',
      name: 'BM-LAB-EGFR-20260528-001',
      kind: 'experimentOrder',
      location: 'CRO validated antibody expression and binding workflow',
      status: 'submitted',
    },
    {
      id: 'raw-assay-bundle',
      name: 'EGFR_round2_raw_assay_bundle.xlsx',
      kind: 'dataset',
      location: 'Antibody Optimization / Files / Assays',
      status: 'completed',
    },
    {
      id: 'report',
      name: 'EGFR_affinity_optimization_report.md',
      kind: 'report',
      location: 'Antibody Optimization / Files / Reports',
      status: 'saved',
    },
    {
      id: 'assay-summary',
      name: 'EGFR_round2_experiment_results.csv',
      kind: 'dataset',
      location: 'Antibody Optimization / Files / Assays',
      status: 'saved',
    },
    {
      id: 'figures',
      name: 'EGFR_scientific_figures.png',
      kind: 'figure',
      location: 'Antibody Optimization / Files / Figures',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'top3-confirmation',
      kind: 'humanConfirmation',
      title: '选择 Top 3 候选进入湿实验验证',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-05-28 14:16',
    },
    {
      id: 'experiment-order-approval',
      kind: 'approvalRequest',
      title: '提交 Experiment Order',
      status: 'approved',
      actor: 'zhengjun',
      decidedAt: '2026-05-28 14:24',
    },
  ],
  capabilityRuns: [
    {
      id: 'file-reader',
      commandName: 'FileReader.extractBaseline',
      status: 'success',
      summary: '提取 parent antibody 和上一轮实验基线',
      duration: '4.8s',
      input: {
        file: 'EGFR_parent_antibody_baseline.xlsx',
        project: 'Antibody Optimization / EGFR 抗体亲和力优化',
      },
      output: {
        parentAntibody: 'EGFR-P0',
        historicalBliKd: '8.4 nM',
        expression: '42 mg/L',
        secHplcMonomer: '96.8%',
        tm: '66.1 C',
      },
      artifacts: [
        {
          name: 'EGFR_baseline_extract.json',
          kind: 'json',
        },
      ],
    },
    {
      id: 'structure-analyzer',
      commandName: 'StructureAnalyzer.run',
      status: 'success',
      summary: '识别 7 个抗原接触位点',
      duration: '12.4s',
      input: {
        structure: 'BM-EGFR-01_AF2_complex.pdb',
        antigen: 'EGFR_ECD',
        chains: ['heavy', 'light', 'antigen'],
      },
      output: {
        contactSites: 7,
        priorityRegions: ['HCDR3', 'LCDR1'],
        excludedRegions: ['framework'],
      },
    },
    {
      id: 'mutation-site-mapper',
      commandName: 'MutationSiteMapper.mapCdrHotspots',
      status: 'success',
      summary: '标注 5 个可设计位点和 3 个禁用位点',
      duration: '7.9s',
      input: {
        structureMap: 'EGFR_structure_contact_map.json',
        sequence: 'BM-EGFR-01_heavy_light.fasta',
        cdrDefinition: 'IMGT',
      },
      output: {
        designSites: ['H:Y102', 'H:D100a', 'L:S31', 'L:N92', 'H:T57'],
        disabledSites: ['H:W47', 'L:F36', 'H:C22'],
        priority: ['HCDR3', 'LCDR1'],
      },
    },
    {
      id: 'affinity-optimizer',
      commandName: 'AffinityOptimizer.generateCandidates',
      status: 'success',
      summary: '生成 64 个候选并筛出 8 个低风险组合',
      duration: '31.6s',
      input: {
        parent: 'EGFR-P0',
        targetKd: '<1 nM',
        expressionFloor: '35 mg/L',
        stabilityDropLimit: '2 C',
        excludedRisk: 'High',
      },
      output: {
        generatedCandidates: 64,
        lowRiskCandidates: 8,
        topCandidates: ['EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03', 'EGFR-AF-04'],
      },
    },
    {
      id: 'order-draft-failed',
      commandName: 'ExperimentOrderDraft.create',
      status: 'failed',
      summary: '样本量不足，无法覆盖 3 个候选的 BLI 三重复',
      duration: '5.2s',
      input: {
        molecules: ['EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03'],
        assays: ['expression', 'small-scale purification', 'BLI', 'SEC-HPLC', 'DSF'],
        bliRepeats: 3,
      },
      output: {
        failureReason: 'sample requirement mismatch',
        requiredAntigenMass: 'higher than current allocation',
        suggestedAction: 'recalculate sample requirements and batch design',
      },
    },
    {
      id: 'sample-requirement',
      commandName: 'SampleRequirementEstimator.recalculate',
      status: 'success',
      summary: '将 BLI 三重复保留，表达和纯化按候选分子独立批次执行',
      duration: '6.1s',
      input: {
        molecules: 4,
        controls: ['EGFR-P0'],
        requiredAssays: ['expression', 'purification', 'BLI', 'SEC-HPLC', 'DSF'],
      },
      output: {
        bliRepeats: 3,
        expressionBatches: 'independent per molecule',
        purifiedProteinTarget: '0.35 mg per molecule',
        antigenAllocation: 'within available amount',
      },
    },
    {
      id: 'order-draft-success',
      commandName: 'ExperimentOrderDraft.create',
      status: 'success',
      summary: '生成 Experiment Order Draft',
      duration: '8.5s',
      input: {
        orderId: 'BM-LAB-EGFR-20260528-001',
        molecules: ['EGFR-P0', 'EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03'],
        acceptanceCriteria: ['KD < 1 nM', 'monomer > 95%', 'expression > 35 mg/L'],
      },
      output: {
        status: 'draft',
        route: 'CRO validated antibody expression and binding workflow',
        estimatedTurnaround: '7 days',
      },
    },
    {
      id: 'order-submit',
      commandName: 'ExperimentOrder.submit',
      status: 'success',
      summary: '已提交 Experiment Order 并锁定 CRO 路由',
      duration: '3.4s',
      input: {
        orderId: 'BM-LAB-EGFR-20260528-001',
        approvalStatus: 'approved',
        route: 'validated CRO route',
      },
      output: {
        submittedAt: '2026-05-28 14:25',
        executionStatus: 'queued',
        expectedResultReturn: '2026-06-04',
      },
    },
    {
      id: 'result-reader',
      commandName: 'ExperimentResultReader.importResults',
      status: 'success',
      summary: '导入 4 个分子的表达、BLI、SEC-HPLC 和 DSF 结果',
      duration: '9.7s',
      input: {
        orderId: 'BM-LAB-EGFR-20260528-001',
        files: [
          'round2_expression.xlsx',
          'round2_bli.xlsx',
          'round2_sec_hplc.xlsx',
          'round2_dsf.xlsx',
        ],
      },
      output: {
        molecules: ['EGFR-P0', 'EGFR-AF-01', 'EGFR-AF-02', 'EGFR-AF-03'],
        assayGroups: ['expression', 'BLI', 'SEC-HPLC', 'DSF'],
        importWarnings: 0,
      },
    },
    {
      id: 'bio-data-analyzer',
      commandName: 'BioDataAnalyzer.summarizeAssays',
      status: 'success',
      summary: '汇总亲和力、表达量、纯度和稳定性结果',
      duration: '14.2s',
      input: {
        normalizedResults: 'EGFR_round2_raw_assay_bundle.xlsx',
        baseline: 'EGFR-P0',
        criteria: ['KD < 1 nM', 'expression > 35 mg/L', 'monomer > 95%'],
      },
      output: {
        recommended: ['EGFR-AF-01', 'EGFR-AF-03'],
        deferred: ['EGFR-AF-02'],
        bestKd: 'EGFR-AF-02 0.48 nM',
        bestOverall: 'EGFR-AF-01',
      },
    },
    {
      id: 'project-file-save',
      commandName: 'ProjectFile.save',
      status: 'success',
      summary: '已写回实验结果摘要、优化报告和下一轮设计计划',
      duration: '2.6s',
      input: {
        project: 'Antibody Optimization',
        files: [
          'EGFR_affinity_optimization_report.md',
          'EGFR_round2_experiment_results.csv',
          'EGFR_next_round_design_plan.md',
        ],
      },
      output: {
        savedFiles: 3,
        report: 'EGFR_affinity_optimization_report.md',
        assayTable: 'EGFR_round2_experiment_results.csv',
        nextPlan: 'EGFR_next_round_design_plan.md',
      },
    },
  ],
}

export const il17aAffinityDesignTranscript: ConversationTurn[] = [
  {
    id: 'il17a-turn-001',
    role: 'user',
    markdown:
      '我们准备做 IL-17A 中和抗体下一轮亲和力成熟。先不要直接下实验订单，帮我基于历史变体数据做实验前分析设计，重点看为什么 KD 变好以后 cell potency 没有同步提升。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'IL17A_parent_and_variant_history.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Inputs',
        note: 'XLSX · parent + 12 个历史变体 · BLI、ELISA、cell potency、表达、SEC-HPLC 和 Tm。',
      },
      {
        type: 'projectFile',
        fileName: 'IL17A_variant_sequences.fasta',
        fileKind: 'fasta',
        location: 'Antibody Optimization / Files / Inputs',
        note: 'FASTA · heavy/light variable region 序列，用于位点和 CDR 证据映射。',
      },
      {
        type: 'projectFile',
        fileName: 'IL17A_assay_notes.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Notes',
        note: 'MD · 细胞 assay 噪声、历史团队观察和实验边界说明。',
      },
    ],
  },
  {
    id: 'il17a-turn-002',
    role: 'mainAgent',
    markdown:
      '我先把三个 Project Files 作为同一个输入文件束读取。当前数据适合做下一轮实验设计，但不适合直接推出“最佳突变组合”。\n\n初始观察：\n\n- Parent `IL17A-P0` 的 BLI KD 约 **18 nM**。\n- 历史变体中已有 4 个把 KD 推到 **2-4 nM**。\n- 细胞中和 IC50 的改善并没有和 KD 等比例同步。\n- 一部分高亲和力变体出现表达量或 Tm 风险。\n\n我会先把问题拆成 evidence、hypothesis 和 design constraint，而不是直接给单一候选结论。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ProjectFileReader.extractIl17aHistory',
        status: 'success',
        summary: '读取 IL-17A parent、12 个历史变体和 assay notes',
        defaultCollapsed: true,
        input: {
          files: [
            'IL17A_parent_and_variant_history.xlsx',
            'IL17A_variant_sequences.fasta',
            'IL17A_assay_notes.md',
          ],
          project: 'Antibody Optimization / IL-17A 亲和力成熟实验设计',
        },
        output: {
          parentAntibody: 'IL17A-P0',
          historicalVariants: 12,
          baselineBliKd: '18 nM',
          bestHistoricalKdRange: '2-4 nM',
          availableReadouts: ['BLI', 'competition ELISA', 'cell neutralization', 'expression', 'SEC-HPLC', 'Tm'],
        },
        duration: '5.1s',
        artifacts: [
          {
            name: 'IL17A_history_extract.json',
            kind: 'json',
            description: 'Parent、历史变体、readout 字段和 assay notes 摘要。',
          },
        ],
      },
    ],
  },
  {
    id: 'il17a-turn-003',
    role: 'mainAgent',
    markdown:
      '输入文件束质控结果：数据量不大，但足够支持“区分假设”的实验设计。\n\n我不会把它当成可训练预测模型的数据集。这里更合理的用法是：\n\n- 找出 readout 之间的冲突。\n- 看哪些位点和 readout 变化有一致信号。\n- 明确哪些结论只能作为假设。\n- 设计下一轮实验去验证这些假设。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'InputBundleQc.checkCompleteness',
        status: 'warning',
        summary: '数据可用于实验设计，但不足以做确定性预测',
        defaultCollapsed: true,
        input: {
          variants: 12,
          readouts: ['BLI KD', 'ELISA IC50', 'cell IC50', 'expression', 'SEC monomer', 'Tm'],
          sequenceCoverage: 'VH/VL variable regions',
        },
        output: {
          completeness: 'usable for design',
          replicateCoverage: 'mixed',
          causalCertainty: 'low',
          recommendedUse: 'hypothesis-driven experiment design',
        },
        duration: '4.7s',
        artifacts: [
          {
            name: 'IL17A_input_bundle_qc.md',
            kind: 'md',
            description: '输入文件完整性、缺口和可用边界。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'il17a-variant-evidence-heatmap',
        title: 'Variant evidence heatmap',
        description: '12 个历史变体在 BLI、ELISA blocking、cell potency、表达、SEC-HPLC、Tm 和序列风险上的证据矩阵。',
        imagegenPrompt:
          'Scientific heatmap for IL-17A antibody historical variants across BLI KD, ELISA blocking, cell potency, expression, SEC monomer, thermal stability, and sequence liability risk; clean biomedical report style, synthetic data, uncertainty-aware, no brand UI.',
        placeholder: '图片：IL-17A 历史变体 evidence heatmap。',
        src: il17aVariantEvidenceHeatmap,
        width: 900,
        height: 494,
        alt: 'Heatmap of IL-17A antibody historical variant evidence across affinity function and developability readouts',
      },
    ],
  },
  {
    id: 'il17a-turn-004',
    role: 'mainAgent',
    markdown:
      '我把 BLI KD 和 cell neutralization IC50 放在同一张图里看。主冲突很明显：一组变体 KD 明显更好，但 cell potency 仍然弱；另一组变体 KD 只中等改善，但 cell potency 反而更好。\n\n这说明下一轮不能只做 affinity hotspot scanning。更合理的是设计一组能区分以下问题的实验：binding kinetics、epitope blocking、细胞 assay context 哪一个更限制功能。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'AssayDiscordanceAnalyzer.compareBindingAndFunction',
        status: 'success',
        summary: '识别 BLI KD 与 cell potency 不一致的历史变体组',
        defaultCollapsed: true,
        input: {
          bindingReadout: 'BLI KD',
          functionalReadout: 'IL-17A cell neutralization IC50',
          historicalVariants: 12,
        },
        output: {
          discordantHighAffinityVariants: ['IL17A-H03', 'IL17A-H04', 'IL17A-H07'],
          moderateBindingFunctionalVariants: ['IL17A-H05', 'IL17A-H09'],
          evidenceStrength: 'moderate',
          remainingUncertainty: 'epitope geometry and assay context are not separated',
        },
        duration: '9.4s',
        artifacts: [
          {
            name: 'IL17A_binding_function_discordance.csv',
            kind: 'csv',
            description: 'BLI KD、cell IC50 和 discordance 分组。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'il17a-discordance-plot',
        title: 'BLI vs cell potency discordance',
        description: 'KD 变好但细胞中和活性没有同步提升的变体被单独标出。',
        imagegenPrompt:
          'BLI KD versus IL-17A cell neutralization potency scatter plot showing discordant antibody variants, clean scientific report chart, synthetic data, no brand UI.',
        placeholder: '图片：BLI KD 与 cell potency 的 discordance plot。',
        src: il17aDiscordancePlot,
        width: 900,
        height: 600,
        alt: 'Scatter plot showing discordance between IL-17A antibody BLI affinity and cell neutralization potency',
      },
    ],
  },
  {
    id: 'il17a-turn-005',
    role: 'user',
    markdown:
      '对，这轮不要单纯追 KD。我们更关心 cell potency，而且之前团队感觉 HCDR3 附近的变体对 ELISA blocking 的影响比 KD 更明显。稳定性也不能明显掉。',
  },
  {
    id: 'il17a-turn-006',
    role: 'mainAgent',
    markdown:
      '我把目标函数改成“功能优先、亲和力和 developability 约束”。\n\n修正后的设计目标：\n\n- Primary：cell neutralization IC50 至少改善 **3x**。\n- Secondary：BLI KD 进入 **<5 nM** 或 koff 有明确改善。\n- Blocking：competition ELISA 需要和 cell potency 同向变化。\n- Developability gate：表达量不低于 parent 的 **80%**，SEC monomer 不低于 **95%**，Tm 下降不超过 **2 C**。\n\n这样下一轮实验要服务于判断，而不是只筛一个表面上 KD 最好的分子。',
  },
  {
    id: 'il17a-turn-007',
    role: 'mainAgent',
    markdown:
      '我把历史变体序列变化映射到 CDR 和 framework 邻近区域。当前证据支持优先看 HCDR3、HCDR2 与 LCDR3 的界面邻近位点；framework-proximal 位点只作为 rescue 或 rollback 设计，不作为主要亲和力优化区域。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'SequenceEvidenceMapper.mapCdrSignals',
        status: 'success',
        summary: '将历史变体信号映射到 CDR/site 证据区域',
        defaultCollapsed: true,
        input: {
          sequences: 'IL17A_variant_sequences.fasta',
          readoutTable: 'IL17A_parent_and_variant_history.xlsx',
          cdrDefinition: 'IMGT',
        },
        output: {
          priorityRegions: ['HCDR3', 'HCDR2', 'LCDR3'],
          cautionRegions: ['LCDR2 periphery', 'framework-proximal VH'],
          excludedSignals: ['high hydrophobicity patches', 'Tm penalty cluster'],
          evidenceStrength: 'moderate',
        },
        duration: '11.6s',
        artifacts: [
          {
            name: 'IL17A_cdr_site_evidence.csv',
            kind: 'csv',
            description: 'CDR/site 区域、readout 关联和风险标签。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'il17a-cdr-site-evidence-map',
        title: 'CDR and site evidence map',
        description: 'HCDR3、HCDR2 和 LCDR3 的优先证据区域，以及需要排除的高风险位点。',
        imagegenPrompt:
          'Scientific CDR and site evidence map for IL-17A antibody affinity maturation, priority CDR loops, excluded high-risk regions, uncertainty markers, clean biomedical report style, no real sequence text.',
        placeholder: '图片：IL-17A CDR/site evidence map。',
        src: il17aCdrSiteEvidenceMap,
        width: 900,
        height: 600,
        alt: 'CDR and site evidence map for IL-17A antibody affinity maturation design',
      },
    ],
  },
  {
    id: 'il17a-turn-008',
    role: 'mainAgent',
    markdown:
      '我把当前证据分成 3 个互斥但都可能成立的假设：\n\n1. **Affinity-limited**：亲和力或 koff 仍然限制功能。\n2. **Epitope/blocking-limited**：抗体结合了 IL-17A，但没有充分遮挡功能表位。\n3. **Assay/context-limited**：细胞体系、局部浓度或 readout 噪声掩盖了 binding gain。\n\n当前最值得优先验证的是第二个假设，但证据还不足以把另外两个排除。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'HypothesisTriage.rankUncertainty',
        status: 'success',
        summary: '对 binding-function discordance 的候选解释分层',
        defaultCollapsed: true,
        input: {
          discordanceGroups: ['high affinity / weak cell potency', 'moderate affinity / stronger cell potency'],
          userContext: 'HCDR3 variants changed ELISA blocking more than KD',
        },
        output: {
          leadingHypothesis: 'epitope/blocking-limited',
          alternateHypotheses: ['affinity-limited', 'assay/context-limited'],
          evidenceStrength: 'moderate',
          remainingUncertainty: 'needs orthogonal blocking and cell assay confirmation',
        },
        duration: '8.2s',
        artifacts: [
          {
            name: 'IL17A_hypothesis_triage_summary.md',
            kind: 'md',
            description: '假设分层、证据强度和下一轮验证逻辑。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'il17a-hypothesis-triage-diagram',
        title: 'Hypothesis triage',
        description: '把 affinity、epitope/blocking 和 assay/context 三类解释拆开，并标出剩余不确定性。',
        imagegenPrompt:
          'Scientific hypothesis triage diagram for IL-17A antibody binding-function discordance with three competing hypotheses, evidence strength, remaining uncertainty, recommended validation, clean biomedical report style.',
        placeholder: '图片：IL-17A hypothesis triage diagram。',
        src: il17aHypothesisTriageDiagram,
        width: 900,
        height: 600,
        alt: 'Hypothesis triage diagram for IL-17A antibody binding function discordance',
      },
    ],
  },
  {
    id: 'il17a-turn-009',
    role: 'user',
    markdown:
      '这个判断方向对。补充一下：之前 HCDR3 有两个变体在 blocking ELISA 里更好，但 cell assay 波动比较大。我们不想只因为一批细胞数据就完全放弃这个方向。',
  },
  {
    id: 'il17a-turn-010',
    role: 'mainAgent',
    markdown:
      '我会把 HCDR3 blocking 信号保留为主线，但不把它当成已证明机制。\n\n更新后的解释方式：\n\n- HCDR3 方向：优先验证，因为它同时触及 ELISA blocking 和 cell potency 的可疑差异。\n- HCDR2/LCDR3：作为界面几何和组合补偿的第二层。\n- 单纯降低 KD 的设计：保留少量对照，用来判断 affinity gain 是否真的不转化为功能。\n- Assay/context：通过重复、orthogonal blocking 和 negative control 来隔离噪声。\n\n下一轮实验的价值是区分这些解释，而不是提前宣布哪条解释正确。',
  },
  {
    id: 'il17a-turn-011',
    role: 'mainAgent',
    markdown:
      '我先草拟设计空间，分成四类变体：\n\n| Group | Intent | Design logic | What it tests |\n| --- | --- | --- | --- |\n| G1 | Binding-focused | HCDR3/HCDR2 小步亲和力扫描 | KD 或 koff 改善是否能转成 cell potency |\n| G2 | Epitope/blocking-focused | 保留中等 KD，优化 blocking geometry | ELISA blocking 是否比 KD 更接近功能读数 |\n| G3 | Developability-safe rescue | 避免疏水堆积，降低 Tm/表达风险 | 功能改善能否不牺牲可开发性 |\n| G4 | Controls/recombinations | rollback、parent、组合和阴性设计 | 区分真实信号和 assay/context 噪声 |\n\n这里还不是实验订单，只是 Experiment Design Package 的设计空间。',
  },
  {
    id: 'il17a-turn-012',
    role: 'user',
    markdown:
      '边界明确一下：这轮最多 48 个表达构建，不要高疏水突变，不要去碰 framework core。BLI、ELISA blocking、cell neutralization 都要保留。也不要直接替我选一个“最佳突变组合”，我更想知道怎么设计实验把问题问清楚。',
  },
  {
    id: 'il17a-turn-013',
    role: 'mainAgent',
    markdown:
      '按你的边界，我把设计收敛到 **48 个变体**，四组各 12 个。\n\n- G1：12 个 binding-focused variants，作为 affinity/koff 是否仍限制功能的检验组。\n- G2：12 个 epitope/blocking-focused variants，优先覆盖 HCDR3 和 HCDR2/LCDR3 组合。\n- G3：12 个 developability-safe rescue variants，避免高疏水和 framework core 变化。\n- G4：12 个 controls、recombinations 和 rollback variants，用于解释 assay/context 噪声。\n\n这套设计不会假定某个突变必然成功，而是让下一轮数据能告诉我们哪类设计逻辑值得继续。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'LibraryDesignPlanner.composeVariantGroups',
        status: 'success',
        summary: '将实验边界收敛为 48-variant library strategy',
        defaultCollapsed: true,
        input: {
          maxExpressionConstructs: 48,
          requiredReadouts: ['BLI', 'competition ELISA', 'cell neutralization'],
          excludedDesigns: ['high hydrophobicity', 'framework core mutations'],
        },
        output: {
          variantGroups: ['G1 binding-focused', 'G2 epitope/blocking-focused', 'G3 developability-safe rescue', 'G4 controls/recombinations/rollback'],
          variantsPerGroup: 12,
          totalVariants: 48,
          recommendedValidation: 'compare group-level readout concordance before selecting leads',
        },
        duration: '18.8s',
        artifacts: [
          {
            name: 'IL17A_library_design_matrix.csv',
            kind: 'csv',
            description: '48 个变体的分组、设计意图、readout 和风险门控。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'il17a-library-assay-design-matrix',
        title: '48-variant library and assay design matrix',
        description: '四组 48 个变体、关键 readout、controls、replicates 和 decision gate。',
        imagegenPrompt:
          'Scientific experiment planning matrix for 48 IL-17A antibody variants, four design groups, readouts, controls, replicates, decision gates, clean biomedical report style, not an experiment order.',
        placeholder: '图片：48-variant library and assay design matrix。',
        src: il17aLibraryAssayDesignMatrix,
        width: 900,
        height: 600,
        alt: 'Matrix showing 48 variant library and assay panel design for IL-17A antibody affinity maturation',
      },
    ],
  },
  {
    id: 'il17a-turn-014',
    role: 'mainAgent',
    markdown:
      'Assay panel 我建议保持三层 readout：\n\n1. **Binding layer**：BLI kinetics，拆 KD、kon、koff，避免只看单个 KD 数值。\n2. **Blocking layer**：competition ELISA，判断是否遮挡功能相关表位。\n3. **Function layer**：IL-17A cell neutralization，作为 primary decision readout。\n\nDevelopability gate 放在同一轮：表达量、SEC-HPLC monomer、DSF/Tm。这样可以防止下一轮只筛出“功能好但不可开发”的变体。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'AssayPanelDesigner.defineReadouts',
        status: 'success',
        summary: '定义 affinity、blocking、function 和 developability readout',
        defaultCollapsed: true,
        input: {
          librarySize: 48,
          primaryQuestion: 'why affinity gain does not consistently improve cell potency',
          requiredAssays: ['BLI', 'competition ELISA', 'cell neutralization'],
        },
        output: {
          primaryReadout: 'IL-17A cell neutralization IC50',
          secondaryReadouts: ['BLI kinetics', 'competition ELISA IC50'],
          developabilityGates: ['expression >= 80% parent', 'SEC monomer >= 95%', 'Tm drop <= 2 C'],
          remainingUncertainty: 'cell assay context still needs replicate confirmation',
        },
        duration: '10.3s',
        artifacts: [
          {
            name: 'IL17A_assay_readout_plan.xlsx',
            kind: 'xlsx',
            description: 'Assay panel、controls、replicates、acceptance thresholds 和解释规则。',
          },
        ],
      },
    ],
  },
  {
    id: 'il17a-turn-015',
    role: 'mainAgent',
    markdown:
      '我会把下一轮结果解释成“假设更新”，而不是简单 winner ranking：\n\n- 如果 G1 提升 KD 但不提升 cell potency，affinity-limited 假设降权。\n- 如果 G2 的 ELISA blocking 和 cell potency 同步改善，epitope/blocking-limited 假设升权。\n- 如果同一变体 cell readout replicate 差异大，但 BLI/ELISA 稳定，assay/context-limited 假设升权。\n- 如果 G3 保住稳定性且功能改善，下一轮可以把它作为更稳的 design backbone。\n\n这能避免把一次 noisy cell assay 误读成确定机制。',
  },
  {
    id: 'il17a-turn-016',
    role: 'mainAgent',
    markdown:
      '关于你说的“不要直接选一个最佳突变组合”：我同意。\n\n当前 12 个历史变体只支持设计一个能区分机制的实验，不支持直接锁定最优突变。原因有三点：\n\n- KD 与 cell potency 已经出现 discordance，单一 score 会掩盖问题。\n- HCDR3 blocking 信号来自有限历史数据，证据强度是 moderate，不是 proof。\n- 细胞 assay 有已知波动，必须用重复和正交 readout 保护解释。\n\n所以这里的 Main Agent 输出是 Experiment Design Package，不是 lead nomination。',
  },
  {
    id: 'il17a-turn-017',
    role: 'mainAgent',
    markdown:
      '最终 decision rules：\n\n| Rule | Advance if | De-prioritize if |\n| --- | --- | --- |\n| Function | cell IC50 improves >= 3x | cell IC50 unchanged across replicates |\n| Blocking | ELISA blocking improves with function | KD improves but blocking stays flat |\n| Binding | koff improves without developability loss | KD gain requires risky sequence features |\n| Developability | expression >= 80% parent, monomer >= 95% | Tm drop > 2 C or aggregation risk rises |\n\n如果结果只支持某一条 readout，我会建议补验证；如果 function、blocking 和 developability 同向，才进入下一步湿实验 Workflow。',
  },
  {
    id: 'il17a-turn-018',
    role: 'mainAgent',
    markdown:
      '`ProjectFile.save` 已写回 IL-17A 的 Experiment Design Package 和两个支持文件。\n\n保存内容：\n\n- `IL17A_affinity_maturation_design_package.md`\n- `IL17A_library_design_matrix.csv`\n- `IL17A_assay_readout_plan.xlsx`\n\n这些文件可以作为后续 wet-lab Workflow 的输入，但当前 Thread 不提交 Experiment Order。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ProjectFile.save',
        status: 'success',
        summary: '写回 Experiment Design Package 和支持文件',
        defaultCollapsed: true,
        input: {
          project: 'Antibody Optimization',
          files: [
            'IL17A_affinity_maturation_design_package.md',
            'IL17A_library_design_matrix.csv',
            'IL17A_assay_readout_plan.xlsx',
          ],
        },
        output: {
          savedFiles: 3,
          package: 'IL17A_affinity_maturation_design_package.md',
          matrix: 'IL17A_library_design_matrix.csv',
          assayPlan: 'IL17A_assay_readout_plan.xlsx',
          nextWorkflowInput: true,
        },
        duration: '3.2s',
        artifacts: [
          {
            name: 'IL17A_affinity_maturation_design_package.md',
            kind: 'md',
            description: '假设、约束、48-variant strategy、assay panel 和 decision rules。',
          },
          {
            name: 'IL17A_library_design_matrix.csv',
            kind: 'csv',
            description: '48 个变体分组、设计意图、位点策略和风险门控。',
          },
          {
            name: 'IL17A_assay_readout_plan.xlsx',
            kind: 'xlsx',
            description: 'Assay readouts、controls、replicates 和阈值。',
          },
        ],
      },
      {
        type: 'projectFile',
        fileName: 'IL17A_affinity_maturation_design_package.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: 'Experiment Design Package：包含假设分层、实验边界、48-variant strategy 和 decision rules。',
      },
      {
        type: 'projectFile',
        fileName: 'IL17A_library_design_matrix.csv',
        fileKind: 'csv',
        location: 'Antibody Optimization / Files / Design Matrices',
        note: '48-variant library matrix，按 binding、blocking、rescue 和 controls 分组。',
      },
      {
        type: 'projectFile',
        fileName: 'IL17A_assay_readout_plan.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Assay Plans',
        note: 'BLI、competition ELISA、cell neutralization 和 developability gate 的 readout plan。',
      },
    ],
  },
  {
    id: 'il17a-turn-019',
    role: 'mainAgent',
    markdown:
      '已记录最终确认。\n\n下一步建议：\n\n1. 用 `IL17A_library_design_matrix.csv` 进入构建设计评审。\n2. 用 `IL17A_assay_readout_plan.xlsx` 对齐 CRO 或内部实验平台的 readout 和 replicate。\n3. 只有在人工确认物料、预算和审批边界后，再从这个 Experiment Design Package 启动后续 wet-lab Workflow。\n\n当前 Thread 到这里停止，不模拟实验执行，也不返回湿实验结果。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · 确认 Experiment Design Package',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-05-29 17:40',
        decision:
          '确认 IL17A_affinity_maturation_design_package.md 可作为后续 wet-lab Workflow 的输入；当前不提交 Experiment Order。',
      },
    ],
  },
]

export const il17aRunInspector: RunInspectorData = {
  summary: {
    stage: '实验前分析设计完成',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 4,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'input-qc',
      title: '输入文件导入与质控',
      status: 'done',
      detail: '读取 parent、12 个历史变体、序列和 assay notes。',
    },
    {
      id: 'discordance',
      title: 'Assay discordance 分析',
      status: 'done',
      detail: '识别 BLI KD 与 cell potency 不一致的变体组。',
    },
    {
      id: 'site-evidence',
      title: '序列和位点证据归因',
      status: 'done',
      detail: '将 readout 信号映射到 HCDR3、HCDR2 和 LCDR3 等区域。',
    },
    {
      id: 'hypothesis-triage',
      title: '假设分层与不确定性标注',
      status: 'done',
      detail: '区分 affinity、epitope/blocking 和 assay/context 三类解释。',
    },
    {
      id: 'human-goal',
      title: '用户目标修正',
      status: 'done',
      detail: '将目标从单纯追 KD 修正为 cell potency 优先。',
    },
    {
      id: 'library-assay',
      title: 'Library 和 assay panel 设计',
      status: 'done',
      detail: '收敛为 48 个变体、三层 readout 和 developability gate。',
    },
    {
      id: 'project-files',
      title: 'Experiment Design Package 写回项目文件',
      status: 'done',
      detail: '保存设计包、library matrix 和 assay readout plan。',
    },
  ],
  outputs: [
    {
      id: 'design-package',
      name: 'IL17A_affinity_maturation_design_package.md',
      kind: 'report',
      location: 'Antibody Optimization / Files / Reports',
      status: 'saved',
    },
    {
      id: 'library-matrix',
      name: 'IL17A_library_design_matrix.csv',
      kind: 'dataset',
      location: 'Antibody Optimization / Files / Design Matrices',
      status: 'saved',
    },
    {
      id: 'assay-plan',
      name: 'IL17A_assay_readout_plan.xlsx',
      kind: 'projectFile',
      location: 'Antibody Optimization / Files / Assay Plans',
      status: 'saved',
    },
    {
      id: 'scientific-figures',
      name: 'IL17A_scientific_figures.png',
      kind: 'figure',
      location: 'Antibody Optimization / Files / Figures',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'design-package-confirmation',
      kind: 'humanConfirmation',
      title: '确认 Experiment Design Package',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-05-29 17:40',
    },
  ],
  capabilityRuns: [
    {
      id: 'project-file-reader',
      commandName: 'ProjectFileReader.extractIl17aHistory',
      status: 'success',
      summary: '读取 IL-17A parent、12 个历史变体和 assay notes',
      duration: '5.1s',
      input: {
        files: [
          'IL17A_parent_and_variant_history.xlsx',
          'IL17A_variant_sequences.fasta',
          'IL17A_assay_notes.md',
        ],
        project: 'Antibody Optimization / IL-17A 亲和力成熟实验设计',
      },
      output: {
        parentAntibody: 'IL17A-P0',
        historicalVariants: 12,
        baselineBliKd: '18 nM',
        availableReadouts: ['BLI', 'competition ELISA', 'cell neutralization', 'expression', 'SEC-HPLC', 'Tm'],
      },
      artifacts: [
        {
          name: 'IL17A_history_extract.json',
          kind: 'json',
        },
      ],
    },
    {
      id: 'input-bundle-qc',
      commandName: 'InputBundleQc.checkCompleteness',
      status: 'warning',
      summary: '数据可用于实验设计，但不足以做确定性预测',
      duration: '4.7s',
      input: {
        variants: 12,
        sequenceCoverage: 'VH/VL variable regions',
      },
      output: {
        completeness: 'usable for design',
        causalCertainty: 'low',
        recommendedUse: 'hypothesis-driven experiment design',
      },
      artifacts: [
        {
          name: 'IL17A_input_bundle_qc.md',
          kind: 'md',
        },
      ],
    },
    {
      id: 'discordance-analyzer',
      commandName: 'AssayDiscordanceAnalyzer.compareBindingAndFunction',
      status: 'success',
      summary: '识别 BLI KD 与 cell potency 不一致的历史变体组',
      duration: '9.4s',
      input: {
        bindingReadout: 'BLI KD',
        functionalReadout: 'IL-17A cell neutralization IC50',
        historicalVariants: 12,
      },
      output: {
        discordantHighAffinityVariants: ['IL17A-H03', 'IL17A-H04', 'IL17A-H07'],
        moderateBindingFunctionalVariants: ['IL17A-H05', 'IL17A-H09'],
        evidenceStrength: 'moderate',
        remainingUncertainty: 'epitope geometry and assay context are not separated',
      },
      artifacts: [
        {
          name: 'IL17A_binding_function_discordance.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'sequence-evidence-mapper',
      commandName: 'SequenceEvidenceMapper.mapCdrSignals',
      status: 'success',
      summary: '将历史变体信号映射到 CDR/site 证据区域',
      duration: '11.6s',
      input: {
        sequences: 'IL17A_variant_sequences.fasta',
        cdrDefinition: 'IMGT',
      },
      output: {
        priorityRegions: ['HCDR3', 'HCDR2', 'LCDR3'],
        cautionRegions: ['LCDR2 periphery', 'framework-proximal VH'],
        excludedSignals: ['high hydrophobicity patches', 'Tm penalty cluster'],
        evidenceStrength: 'moderate',
      },
    },
    {
      id: 'hypothesis-triage',
      commandName: 'HypothesisTriage.rankUncertainty',
      status: 'success',
      summary: '对 binding-function discordance 的候选解释分层',
      duration: '8.2s',
      input: {
        discordanceGroups: ['high affinity / weak cell potency', 'moderate affinity / stronger cell potency'],
        userContext: 'HCDR3 variants changed ELISA blocking more than KD',
      },
      output: {
        leadingHypothesis: 'epitope/blocking-limited',
        alternateHypotheses: ['affinity-limited', 'assay/context-limited'],
        evidenceStrength: 'moderate',
        remainingUncertainty: 'needs orthogonal blocking and cell assay confirmation',
      },
    },
    {
      id: 'library-design-planner',
      commandName: 'LibraryDesignPlanner.composeVariantGroups',
      status: 'success',
      summary: '将实验边界收敛为 48-variant library strategy',
      duration: '18.8s',
      input: {
        maxExpressionConstructs: 48,
        requiredReadouts: ['BLI', 'competition ELISA', 'cell neutralization'],
        excludedDesigns: ['high hydrophobicity', 'framework core mutations'],
      },
      output: {
        variantGroups: ['G1 binding-focused', 'G2 epitope/blocking-focused', 'G3 developability-safe rescue', 'G4 controls/recombinations/rollback'],
        variantsPerGroup: 12,
        totalVariants: 48,
        recommendedValidation: 'compare group-level readout concordance before selecting leads',
      },
    },
    {
      id: 'assay-panel-designer',
      commandName: 'AssayPanelDesigner.defineReadouts',
      status: 'success',
      summary: '定义 affinity、blocking、function 和 developability readout',
      duration: '10.3s',
      input: {
        librarySize: 48,
        primaryQuestion: 'why affinity gain does not consistently improve cell potency',
        requiredAssays: ['BLI', 'competition ELISA', 'cell neutralization'],
      },
      output: {
        primaryReadout: 'IL-17A cell neutralization IC50',
        secondaryReadouts: ['BLI kinetics', 'competition ELISA IC50'],
        developabilityGates: ['expression >= 80% parent', 'SEC monomer >= 95%', 'Tm drop <= 2 C'],
        remainingUncertainty: 'cell assay context still needs replicate confirmation',
      },
    },
    {
      id: 'project-file-save-il17a',
      commandName: 'ProjectFile.save',
      status: 'success',
      summary: '写回 Experiment Design Package 和支持文件',
      duration: '3.2s',
      input: {
        project: 'Antibody Optimization',
        files: [
          'IL17A_affinity_maturation_design_package.md',
          'IL17A_library_design_matrix.csv',
          'IL17A_assay_readout_plan.xlsx',
        ],
      },
      output: {
        savedFiles: 3,
        package: 'IL17A_affinity_maturation_design_package.md',
        matrix: 'IL17A_library_design_matrix.csv',
        assayPlan: 'IL17A_assay_readout_plan.xlsx',
        nextWorkflowInput: true,
      },
    },
  ],
}

export const her2WetlabExecutionTranscript: ConversationTurn[] = [
  {
    id: 'her2-turn-001',
    role: 'user',
    markdown:
      '请基于已有 HER2 候选和物料文件，推进一次湿实验验证执行。输入 Project Files 是 `HER2_candidate_antibody_manifest.xlsx`、`HER2_material_inventory.csv` 和 `HER2_validation_sop.pdf`。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'HER2_candidate_antibody_manifest.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Inputs',
        note: 'XLSX · HER2 候选抗体清单、批次、浓度和待验证 readouts。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_material_inventory.csv',
        fileKind: 'csv',
        location: 'Antibody Optimization / Files / Inputs',
        note: 'CSV · 抗原、cells、buffer、plate、sensor 和 controls 库存。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_validation_sop.pdf',
        fileKind: 'pdf',
        location: 'Antibody Optimization / Files / SOPs',
        note: 'PDF · HER2 wet-lab validation SOP、acceptance criteria 和记录模板。',
      },
    ],
  },
  {
    id: 'her2-turn-002',
    role: 'mainAgent',
    markdown:
      '我会把这条 Thread 作为 HER2 wet-lab execution flow 处理：这是执行流，不是 candidate analysis、不是 redesign，也不是新的 Workflow object。\n\n执行边界：\n\n- 只读取已给定候选、物料和 SOP。\n- 只准备并提交 Experiment Order。\n- 只回放 Experiment Task 的执行状态和结果导入。\n- 不做机制解释、候选排序、突变设计或后续建议。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ProjectFileReader.extractHer2ExecutionInputs',
        status: 'success',
        summary: '读取 HER2 候选、物料库存和验证 SOP',
        defaultCollapsed: true,
        input: {
          files: [
            'HER2_candidate_antibody_manifest.xlsx',
            'HER2_material_inventory.csv',
            'HER2_validation_sop.pdf',
          ],
          project: 'Antibody Optimization / HER2 抗体候选湿实验验证',
        },
        output: {
          candidateCount: 8,
          assays: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI'],
          controls: ['HER2-parent', 'blank', 'isotype-control'],
          sopCriteriaLoaded: true,
        },
        duration: '4.9s',
        artifacts: [
          {
            name: 'HER2_execution_input_extract.json',
            kind: 'json',
            description: '候选、物料、assay 和 SOP criteria 摘要。',
          },
        ],
      },
    ],
  },
  {
    id: 'her2-turn-003',
    role: 'user',
    markdown:
      '确认 scope：只做这些候选的验证执行，沿用 SOP 里的固定标准。不要把 Experiment Task 单独放到侧边栏，也不要自动生成 Asset。',
  },
  {
    id: 'her2-turn-004',
    role: 'mainAgent',
    markdown:
      '已确认 scope。我把执行拆成 7 个步骤：输入确认、样本需求、controls、订单审批、任务回放、结果导入、预设 QC 和归档。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · HER2 scope confirmation',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-05-31 09:18',
        decision:
          '确认 HER2 Thread 只做湿实验验证执行流，不创建新的 Workflow object，不暴露 Experiment Task 到侧边栏。',
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-experiment-order-execution-flow',
        title: 'HER2 experiment order execution flow',
        description: 'HER2 从 Project Files、Experiment Order、Experiment Task 回放到 Result Package 归档的执行流。',
        imagegenPrompt:
          'Scientific operations flow diagram for HER2 antibody wet-lab validation, project files to experiment order to task replay to result package archive, clean biomedical workflow figure, no product UI.',
        placeholder: '图片：HER2 Experiment Order execution flow。',
        src: her2ExperimentOrderExecutionFlow,
        width: 900,
        height: 540,
        alt: 'HER2 wet-lab experiment order execution flow diagram',
      },
    ],
  },
  {
    id: 'her2-turn-005',
    role: 'mainAgent',
    markdown:
      '样本需求估算完成：8 个候选加 parent、blank 和 isotype control；每个候选覆盖表达、纯化、SEC-HPLC、DSF 和 BLI。当前库存满足一次标准验证批次，但需要锁定 plate、sensor 和 HER2-ECD 批号。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'SampleRequirementEstimator.calculate',
        status: 'success',
        summary: '计算 HER2 验证批次样本、reagent 和 consumable 需求',
        defaultCollapsed: true,
        input: {
          candidateCount: 8,
          controls: ['HER2-parent', 'blank', 'isotype-control'],
          assays: ['expression', 'SEC-HPLC', 'DSF', 'BLI'],
        },
        output: {
          expressionConstructs: 8,
          controlWells: 12,
          bliSensorsReserved: 96,
          her2EcdLot: 'HER2-ECD-2605-L03',
        },
        duration: '6.4s',
        artifacts: [
          {
            name: 'HER2_sample_requirement_estimate.csv',
            kind: 'csv',
            description: '样本、controls、reagent 和 consumable 需求。',
          },
        ],
      },
    ],
  },
  {
    id: 'her2-turn-006',
    role: 'user',
    markdown:
      '预算和排期可以按一次标准验证批次走。BLI 必须包含 parent 和 isotype control，DSF 和 SEC-HPLC 也要跟 SOP 阈值对齐。',
  },
  {
    id: 'her2-turn-007',
    role: 'mainAgent',
    markdown:
      '已确认预算、排期和 assay 约束。我生成 plate map，只用于执行排布和 controls 检查。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · budget schedule assay constraints',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-05-31 09:27',
        decision:
          '确认按一次标准验证批次执行；BLI、DSF 和 SEC-HPLC 必须使用 SOP 中的固定阈值。',
      },
      {
        type: 'capabilityRunReplay',
        commandName: 'PlateMapDesigner.createLayout',
        status: 'success',
        summary: '生成 HER2 验证批次 plate map 和 controls 布局',
        defaultCollapsed: true,
        input: {
          candidates: 8,
          plateFormat: 96,
          requiredControls: ['HER2-parent', 'blank', 'isotype-control'],
        },
        output: {
          plates: 1,
          sampleWells: 64,
          controlWells: 12,
          layoutId: 'HER2-PLATEMAP-20260531-001',
        },
        duration: '8.6s',
        artifacts: [
          {
            name: 'HER2_sample_plate_map.csv',
            kind: 'csv',
            description: '96-well sample、replicate 和 control 布局。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-sample-plate-map',
        title: 'HER2 sample plate map',
        description: 'HER2 候选、parent、blank 和 isotype control 的 plate map。',
        imagegenPrompt:
          'Scientific 96-well plate map for HER2 antibody validation with samples and controls, clean lab report figure, readable colored groups but no exact tiny text.',
        placeholder: '图片：HER2 sample plate map。',
        src: her2SamplePlateMap,
        width: 900,
        height: 600,
        alt: 'HER2 sample plate map with candidate and control wells',
      },
    ],
  },
  {
    id: 'her2-turn-008',
    role: 'mainAgent',
    markdown:
      'Controls 检查完成：parent、blank、isotype control、buffer control 和 HER2-ECD lot 都已覆盖。这个检查只确认执行完整性，不产生候选优先级。',
  },
  {
    id: 'her2-turn-009',
    role: 'mainAgent',
    markdown:
      'controls 要求已准备好，可以进入 Experiment Order 草稿。订单里会写清楚结果只归档成 Project Files。',
  },
  {
    id: 'her2-turn-010',
    role: 'mainAgent',
    markdown:
      '我已生成 Experiment Order draft `BM-LAB-HER2-20260531-001`，等待审批后提交到实验执行队列。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · HER2 control requirements',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-05-31 09:35',
        decision:
          '确认 parent、blank、isotype control、buffer control 和 HER2-ECD lot 要求完整。',
      },
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentOrderDraft.create',
        status: 'success',
        summary: '创建 HER2 Experiment Order draft',
        defaultCollapsed: true,
        input: {
          project: 'Antibody Optimization',
          candidates: 8,
          resultHandling: 'save as Project Files',
        },
        output: {
          orderId: 'BM-LAB-HER2-20260531-001',
          status: 'draft',
          assays: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI'],
        },
        duration: '5.8s',
        artifacts: [
          {
            name: 'BM-LAB-HER2-20260531-001_draft.md',
            kind: 'md',
            description: 'HER2 Experiment Order draft。',
          },
        ],
      },
      {
        type: 'experimentOrderDraft',
        title: 'HER2 Experiment Order Draft',
        orderId: 'BM-LAB-HER2-20260531-001',
        status: 'draft',
        items: [
          { label: 'Candidates', value: '8 HER2 antibody candidates' },
          { label: 'Assays', value: 'Expression, purification, SEC-HPLC, DSF, BLI' },
          { label: 'Controls', value: 'Parent, blank, isotype, buffer control' },
          { label: 'Result handling', value: 'Archive Experiment Result Package as Project Files' },
        ],
      },
    ],
  },
  {
    id: 'her2-turn-011',
    role: 'user',
    markdown:
      '审批通过，提交 HER2 Experiment Order。后续只回放执行状态和保存结果文件。',
    contentBlocks: [
      {
        type: 'approvalRequestReplay',
        title: '提交 HER2 Experiment Order',
        approvalType: 'experimentOrder',
        status: 'approved',
        decidedBy: 'zhengjun',
        decidedAt: '2026-05-31 09:42',
        decision: '批准提交 Experiment Order `BM-LAB-HER2-20260531-001`。',
        requestSummary:
          '提交 HER2 wet-lab validation order，结果仅作为 Project Files 归档。',
      },
    ],
  },
  {
    id: 'her2-turn-012',
    role: 'mainAgent',
    markdown:
      'Experiment Order 已提交，系统返回 Experiment Task `HER2-EXPTASK-20260531-001`。我开始同步执行状态，只在当前 Thread 中回放。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentOrder.submit',
        status: 'success',
        summary: '提交 HER2 Experiment Order',
        defaultCollapsed: true,
        input: {
          orderId: 'BM-LAB-HER2-20260531-001',
          approvedBy: 'zhengjun',
          resultHandling: 'Project Files only',
        },
        output: {
          orderId: 'BM-LAB-HER2-20260531-001',
          status: 'submitted',
          experimentTaskId: 'HER2-EXPTASK-20260531-001',
        },
        duration: '3.1s',
      },
      {
        type: 'elapsedWorkReplay',
        target: 'HER2-EXPTASK-20260531-001',
        elapsed: '0h-12h',
        status: 'completed',
        summary: '样本接收、plate setup、表达启动和初始记录完成。',
      },
    ],
  },
  {
    id: 'her2-turn-013',
    role: 'mainAgent',
    markdown:
      '继续同步 `HER2-EXPTASK-20260531-001`：表达、纯化、SEC-HPLC、DSF 和 BLI 数据采集已完成，结果包进入导入阶段。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentTaskReplay.syncStatus',
        status: 'success',
        summary: '同步 HER2 Experiment Task 执行状态',
        defaultCollapsed: true,
        input: {
          experimentTaskId: 'HER2-EXPTASK-20260531-001',
          orderId: 'BM-LAB-HER2-20260531-001',
        },
        output: {
          experimentTaskId: 'HER2-EXPTASK-20260531-001',
          status: 'completed',
          completedAssays: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI'],
          rawBundleReady: true,
        },
        duration: '7.4s',
      },
      {
        type: 'elapsedWorkReplay',
        target: 'HER2-EXPTASK-20260531-001',
        elapsed: '12h-48h',
        status: 'completed',
        summary: '表达 harvest、protein A purification、SEC-HPLC、DSF 和 BLI acquisition 完成。',
      },
    ],
  },
  {
    id: 'her2-turn-014',
    role: 'mainAgent',
    markdown:
      '我导入原始结果文件束，并生成表达、纯化和 SEC-HPLC 的执行摘要。这里仅描述 assay 文件完整性和预设指标结果。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ExperimentResultReader.importResults',
        status: 'success',
        summary: '导入 HER2 湿实验原始结果文件束',
        defaultCollapsed: true,
        input: {
          experimentTaskId: 'HER2-EXPTASK-20260531-001',
          rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
        },
        output: {
          importedFiles: 5,
          rows: 96,
          missingValues: 0,
          rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
        },
        duration: '9.2s',
        artifacts: [
          {
            name: 'HER2_wetlab_raw_result_bundle.xlsx',
            kind: 'xlsx',
            description: '表达、纯化、SEC-HPLC、DSF 和 BLI 原始结果。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-expression-purification-qc',
        title: 'HER2 expression and purification QC',
        description: 'HER2 候选表达量、纯化回收率和 SEC-HPLC monomer 的预设 QC 摘要。',
        imagegenPrompt:
          'Scientific QC dashboard for HER2 antibody expression purification and SEC-HPLC, pass fail thresholds, clean biomedical report chart, synthetic lab data.',
        placeholder: '图片：HER2 expression purification QC。',
        src: her2ExpressionPurificationQc,
        width: 900,
        height: 600,
        alt: 'HER2 expression purification and SEC-HPLC QC summary',
      },
    ],
  },
  {
    id: 'her2-turn-015',
    role: 'mainAgent',
    markdown:
      'SEC、DSF 和 BLI dashboard 已生成，用于后续 Preset QC Check。图中只展示 SOP 字段和阈值状态。',
    contentBlocks: [
      {
        type: 'scientificFigure',
        figureId: 'her2-sec-dsf-bli-qc-dashboard',
        title: 'HER2 SEC DSF BLI QC dashboard',
        description: 'SEC-HPLC monomer、DSF Tm 和 BLI control fit 的预设 QC dashboard。',
        imagegenPrompt:
          'Scientific QC dashboard combining SEC-HPLC monomer percent, DSF Tm and BLI fit quality for HER2 antibody validation, pass fail criteria, clean report figure.',
        placeholder: '图片：HER2 SEC DSF BLI QC dashboard。',
        src: her2SecDsfBliQcDashboard,
        width: 900,
        height: 600,
        alt: 'HER2 SEC DSF and BLI QC dashboard with pass fail criteria',
      },
    ],
  },
  {
    id: 'her2-turn-016',
    role: 'mainAgent',
    markdown:
      'Preset QC Check\n\n| Predefined criterion | Result |\n| --- | --- |\n| Expression file complete | PASS |\n| Purification recovery recorded | PASS |\n| SEC-HPLC monomer >= SOP threshold | PASS |\n| DSF Tm within SOP window | PASS |\n| BLI parent control valid | PASS |\n| BLI isotype control valid | PASS |\n| Missing required assay file | FAIL |\n\n结论只限于预定义 pass/fail QC，不扩展为候选解释。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'PresetQcChecker.evaluateAssayFiles',
        status: 'success',
        summary: '按 SOP 预设阈值执行 pass/fail QC',
        defaultCollapsed: true,
        input: {
          rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
          criteriaSource: 'HER2_validation_sop.pdf',
        },
        output: {
          evaluatedCriteria: 7,
          passRows: 6,
          failRows: 1,
          qcReport: 'HER2_experiment_qc_report.md',
        },
        duration: '5.7s',
        artifacts: [
          {
            name: 'HER2_experiment_qc_report.md',
            kind: 'md',
            description: '预设 QC pass/fail 检查表。',
          },
        ],
      },
    ],
  },
  {
    id: 'her2-turn-017',
    role: 'user',
    markdown:
      '请只归档 Experiment Result Package，不要产生 next-round design advice，也不要把结果自动变成 Asset。',
  },
  {
    id: 'her2-turn-018',
    role: 'mainAgent',
    markdown:
      '`ProjectFile.save` 已保存 HER2 Experiment Result Package 的 Project Files。\n\n保存内容：\n\n- `HER2_wetlab_raw_result_bundle.xlsx`\n- `HER2_experiment_qc_report.md`\n- `HER2_experiment_summary_report.md`\n- `HER2_experiment_result_package_figures.png`\n\n这些文件只进入 Project Files，不自动发布为 Asset。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ProjectFile.save',
        status: 'success',
        summary: '保存 HER2 Experiment Result Package Project Files',
        defaultCollapsed: true,
        input: {
          project: 'Antibody Optimization',
          files: [
            'HER2_wetlab_raw_result_bundle.xlsx',
            'HER2_experiment_qc_report.md',
            'HER2_experiment_summary_report.md',
            'HER2_experiment_result_package_figures.png',
          ],
        },
        output: {
          savedFiles: 4,
          rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
          qcReport: 'HER2_experiment_qc_report.md',
          summaryReport: 'HER2_experiment_summary_report.md',
          figures: 'HER2_experiment_result_package_figures.png',
        },
        duration: '3.6s',
        artifacts: [
          {
            name: 'HER2_wetlab_raw_result_bundle.xlsx',
            kind: 'xlsx',
            description: 'HER2 wet-lab 原始结果文件束。',
          },
          {
            name: 'HER2_experiment_qc_report.md',
            kind: 'md',
            description: 'HER2 预设 QC 报告。',
          },
          {
            name: 'HER2_experiment_summary_report.md',
            kind: 'md',
            description: 'HER2 实验结果摘要报告。',
          },
          {
            name: 'HER2_experiment_result_package_figures.png',
            kind: 'png',
            description: 'HER2 实验结果包图集。',
          },
        ],
      },
      {
        type: 'projectFile',
        fileName: 'HER2_wetlab_raw_result_bundle.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Assays',
        note: 'HER2 expression、purification、SEC-HPLC、DSF 和 BLI 原始结果。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_experiment_qc_report.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: 'Preset QC Check pass/fail 报告。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_experiment_summary_report.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: 'Experiment Result Package 摘要报告。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_experiment_result_package_figures.png',
        fileKind: 'png',
        location: 'Antibody Optimization / Files / Figures',
        note: 'HER2 Experiment Result Package 图集。',
      },
    ],
  },
  {
    id: 'her2-turn-019',
    role: 'mainAgent',
    markdown:
      'HER2 Experiment Result Package 已归档完成。当前 Thread 到这里停止：不生成设计建议、不创建 Asset、不把 Experiment Task 暴露为侧边栏对象。',
    contentBlocks: [
      {
        type: 'scientificFigure',
        figureId: 'her2-experiment-result-package-summary',
        title: 'HER2 experiment result package summary',
        description: 'HER2 Experiment Result Package 的文件组成、QC 状态和归档位置摘要。',
        imagegenPrompt:
          'Scientific result package summary figure for HER2 antibody wet-lab validation, archived project files, QC status, clean biomedical report layout.',
        placeholder: '图片：HER2 Experiment Result Package summary。',
        src: her2ExperimentResultPackageSummary,
        width: 900,
        height: 600,
        alt: 'HER2 experiment result package summary figure',
      },
    ],
  },
]

export const her2WetlabRunInspector: RunInspectorData = {
  summary: {
    stage: '湿实验验证完成',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 5,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'input-confirmation',
      title: '候选与订单输入确认',
      status: 'done',
      detail: '读取 HER2 候选、物料库存和 SOP。',
    },
    {
      id: 'sample-controls',
      title: '样本需求和 controls 检查',
      status: 'done',
      detail: '计算样本需求并生成 plate map。',
    },
    {
      id: 'order-approval',
      title: 'Experiment Order 审批',
      status: 'done',
      detail: '审批并提交 BM-LAB-HER2-20260531-001。',
    },
    {
      id: 'task-replay',
      title: 'Experiment Task 执行回放',
      status: 'done',
      detail: '同步 HER2-EXPTASK-20260531-001 的执行状态。',
    },
    {
      id: 'result-import',
      title: '结果文件导入',
      status: 'done',
      detail: '导入 HER2 wet-lab raw result bundle。',
    },
    {
      id: 'preset-qc',
      title: '预设 QC 检查',
      status: 'done',
      detail: '按 SOP criteria 执行 pass/fail QC。',
    },
    {
      id: 'result-package',
      title: 'Experiment Result Package 归档',
      status: 'done',
      detail: '将结果包保存为 Project Files。',
    },
  ],
  outputs: [
    {
      id: 'her2-experiment-order',
      name: 'BM-LAB-HER2-20260531-001',
      kind: 'experimentOrder',
      location: 'Antibody Optimization / Experiment Orders',
      status: 'submitted',
    },
    {
      id: 'her2-raw-result-bundle',
      name: 'HER2_wetlab_raw_result_bundle.xlsx',
      kind: 'dataset',
      location: 'Antibody Optimization / Files / Assays',
      status: 'completed',
    },
    {
      id: 'her2-qc-report',
      name: 'HER2_experiment_qc_report.md',
      kind: 'report',
      location: 'Antibody Optimization / Files / Reports',
      status: 'saved',
    },
    {
      id: 'her2-summary-report',
      name: 'HER2_experiment_summary_report.md',
      kind: 'report',
      location: 'Antibody Optimization / Files / Reports',
      status: 'saved',
    },
    {
      id: 'her2-figures',
      name: 'HER2_experiment_result_package_figures.png',
      kind: 'figure',
      location: 'Antibody Optimization / Files / Figures',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'her2-scope-confirmation',
      kind: 'humanConfirmation',
      title: '确认 HER2 execution scope',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-05-31 09:18',
    },
    {
      id: 'her2-budget-schedule-confirmation',
      kind: 'humanConfirmation',
      title: '确认预算、排期和 assay 约束',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-05-31 09:27',
    },
    {
      id: 'her2-control-confirmation',
      kind: 'humanConfirmation',
      title: '确认 control requirements',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-05-31 09:35',
    },
    {
      id: 'her2-order-approval',
      kind: 'approvalRequest',
      title: '提交 HER2 Experiment Order',
      status: 'approved',
      actor: 'zhengjun',
      decidedAt: '2026-05-31 09:42',
    },
  ],
  capabilityRuns: [
    {
      id: 'her2-input-reader',
      commandName: 'ProjectFileReader.extractHer2ExecutionInputs',
      status: 'success',
      summary: '读取 HER2 候选、物料库存和验证 SOP',
      duration: '4.9s',
      input: {
        files: [
          'HER2_candidate_antibody_manifest.xlsx',
          'HER2_material_inventory.csv',
          'HER2_validation_sop.pdf',
        ],
        project: 'Antibody Optimization / HER2 抗体候选湿实验验证',
      },
      output: {
        candidateCount: 8,
        assays: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI'],
        controls: ['HER2-parent', 'blank', 'isotype-control'],
        sopCriteriaLoaded: true,
      },
      artifacts: [
        {
          name: 'HER2_execution_input_extract.json',
          kind: 'json',
        },
      ],
    },
    {
      id: 'her2-order-draft',
      commandName: 'ExperimentOrderDraft.create',
      status: 'success',
      summary: '创建 HER2 Experiment Order draft',
      duration: '5.8s',
      input: {
        project: 'Antibody Optimization',
        candidates: 8,
        resultHandling: 'save as Project Files',
      },
      output: {
        orderId: 'BM-LAB-HER2-20260531-001',
        status: 'draft',
        assayCount: 5,
      },
      artifacts: [
        {
          name: 'BM-LAB-HER2-20260531-001_draft.md',
          kind: 'md',
        },
      ],
    },
    {
      id: 'her2-sample-estimator',
      commandName: 'SampleRequirementEstimator.calculate',
      status: 'success',
      summary: '计算 HER2 验证批次样本需求',
      duration: '6.4s',
      input: {
        candidateCount: 8,
        controls: ['HER2-parent', 'blank', 'isotype-control'],
        assayCount: 5,
      },
      output: {
        expressionConstructs: 8,
        controlWells: 12,
        bliSensorsReserved: 96,
        her2EcdLot: 'HER2-ECD-2605-L03',
      },
    },
    {
      id: 'her2-plate-map',
      commandName: 'PlateMapDesigner.createLayout',
      status: 'success',
      summary: '生成 HER2 验证批次 plate map',
      duration: '8.6s',
      input: {
        candidates: 8,
        plateFormat: 96,
        requiredControls: ['HER2-parent', 'blank', 'isotype-control'],
      },
      output: {
        plates: 1,
        sampleWells: 64,
        controlWells: 12,
        layoutId: 'HER2-PLATEMAP-20260531-001',
      },
      artifacts: [
        {
          name: 'HER2_sample_plate_map.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'her2-order-submit',
      commandName: 'ExperimentOrder.submit',
      status: 'success',
      summary: '提交 HER2 Experiment Order',
      duration: '3.1s',
      input: {
        orderId: 'BM-LAB-HER2-20260531-001',
        approvedBy: 'zhengjun',
        resultHandling: 'Project Files only',
      },
      output: {
        orderId: 'BM-LAB-HER2-20260531-001',
        status: 'submitted',
        experimentTaskId: 'HER2-EXPTASK-20260531-001',
      },
    },
    {
      id: 'her2-task-replay',
      commandName: 'ExperimentTaskReplay.syncStatus',
      status: 'success',
      summary: '同步 HER2 Experiment Task 执行状态',
      duration: '7.4s',
      input: {
        experimentTaskId: 'HER2-EXPTASK-20260531-001',
        orderId: 'BM-LAB-HER2-20260531-001',
      },
      output: {
        experimentTaskId: 'HER2-EXPTASK-20260531-001',
        status: 'completed',
        completedAssays: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI'],
        rawBundleReady: true,
      },
    },
    {
      id: 'her2-result-reader',
      commandName: 'ExperimentResultReader.importResults',
      status: 'success',
      summary: '导入 HER2 湿实验原始结果文件束',
      duration: '9.2s',
      input: {
        experimentTaskId: 'HER2-EXPTASK-20260531-001',
        rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
      },
      output: {
        importedFiles: 5,
        rows: 96,
        missingValues: 0,
        rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
      },
      artifacts: [
        {
          name: 'HER2_wetlab_raw_result_bundle.xlsx',
          kind: 'xlsx',
        },
      ],
    },
    {
      id: 'her2-preset-qc',
      commandName: 'PresetQcChecker.evaluateAssayFiles',
      status: 'success',
      summary: '按 SOP 预设阈值执行 pass/fail QC',
      duration: '5.7s',
      input: {
        rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
        criteriaSource: 'HER2_validation_sop.pdf',
      },
      output: {
        evaluatedCriteria: 7,
        passRows: 6,
        failRows: 1,
        qcReport: 'HER2_experiment_qc_report.md',
      },
      artifacts: [
        {
          name: 'HER2_experiment_qc_report.md',
          kind: 'md',
        },
      ],
    },
    {
      id: 'her2-project-file-save',
      commandName: 'ProjectFile.save',
      status: 'success',
      summary: '保存 HER2 Experiment Result Package Project Files',
      duration: '3.6s',
      input: {
        project: 'Antibody Optimization',
        files: [
          'HER2_wetlab_raw_result_bundle.xlsx',
          'HER2_experiment_qc_report.md',
          'HER2_experiment_summary_report.md',
          'HER2_experiment_result_package_figures.png',
        ],
      },
      output: {
        savedFiles: 4,
        rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
        qcReport: 'HER2_experiment_qc_report.md',
        summaryReport: 'HER2_experiment_summary_report.md',
        figures: 'HER2_experiment_result_package_figures.png',
      },
      artifacts: [
        {
          name: 'HER2_wetlab_raw_result_bundle.xlsx',
          kind: 'xlsx',
        },
        {
          name: 'HER2_experiment_qc_report.md',
          kind: 'md',
        },
        {
          name: 'HER2_experiment_summary_report.md',
          kind: 'md',
        },
        {
          name: 'HER2_experiment_result_package_figures.png',
          kind: 'png',
        },
      ],
    },
  ],
}

export const her2PostExperimentAnalysisTranscript: ConversationTurn[] = [
  {
    id: 'her2-analysis-turn-001',
    role: 'user',
    markdown:
      'HER2 wet-lab 的 Experiment Result Package 已经归档了。现在不要再走实验执行流程，帮我做实验之后的纯分析：把 BLI、ELISA、SEC-HPLC、DSF、expression 的结果用各种分析模型综合一下，重点告诉我哪些结论稳、哪些只是模型假设。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'HER2_wetlab_raw_result_bundle.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Assays',
        note: 'XLSX · HER2 wet-lab returned raw result bundle，包含 expression、SEC-HPLC、DSF、BLI 和 ELISA sheet。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_experiment_qc_report.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: 'MD · 预设 QC 检查结果，记录 DSF missing values 和 ELISA outlier 标记。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_experiment_summary_report.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: 'MD · 实验执行摘要，只作为分析输入，不作为模型结论。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_experiment_result_package_figures.png',
        fileKind: 'png',
        location: 'Antibody Optimization / Files / Figures',
        note: 'PNG · 湿实验结果包里的执行和 QC 图集。',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-002',
    role: 'mainAgent',
    markdown:
      '我会把这个 Thread 限定在实验后的分析，不创建新的实验订单，也不模拟新的 lab execution。\n\n分析目标分成三层：\n\n- **Data layer**：先确认 Experiment Result Package 是否完整，哪些点需要标记为低置信。\n- **Model layer**：分别跑 curve fitting、developability scoring、multi-model consensus 和结构假设解释。\n- **Judgment layer**：把稳健信号、脆弱信号和需要人工判断的地方分开。\n\n最终输出是分析报告和假设日志，不会把模型分数当作确定生物学事实。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ResultPackageReader.loadHer2Package',
        status: 'success',
        summary: '读取 HER2 Experiment Result Package',
        defaultCollapsed: true,
        input: {
          packageFiles: [
            'HER2_wetlab_raw_result_bundle.xlsx',
            'HER2_experiment_qc_report.md',
            'HER2_experiment_summary_report.md',
            'HER2_experiment_result_package_figures.png',
          ],
          project: 'Antibody Optimization / HER2 实验结果多模型分析',
        },
        output: {
          assaySheets: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI', 'ELISA'],
          candidateCount: 8,
          packageStatus: 'loaded',
          analysisMode: 'post-experiment only',
        },
        duration: '4.1s',
        artifacts: [
          {
            name: 'HER2_result_package_manifest.json',
            kind: 'json',
            description: '结果包文件、assay sheet 和分析输入清单。',
          },
        ],
      },
    ],
  },
  {
    id: 'her2-analysis-turn-003',
    role: 'mainAgent',
    markdown:
      'Package completeness 是可用的：预期文件都在，关键 assay sheet 没有整表缺失。需要注意的是 DSF 有少量 missing values，ELISA 有一个 replicate 被 QC 标记为 outlier。\n\n我会先保留 outlier 标记，不直接删除；后面在 sensitivity analysis 里分别比较“保留”和“排除”的影响。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ResultPackageQc.auditCompleteness',
        status: 'warning',
        summary: '结果包完整，但存在一个非关键 outlier 标记',
        defaultCollapsed: true,
        input: {
          rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
          qcReport: 'HER2_experiment_qc_report.md',
        },
        output: {
          expectedFiles: 19,
          importedFiles: 19,
          missingCriticalFiles: 0,
          flaggedOutliers: 1,
          dsfMissingRate: '2.1%',
        },
        duration: '5.5s',
        artifacts: [
          {
            name: 'HER2_result_package_qc_audit.md',
            kind: 'md',
            description: '结果包完整性、缺失值、outlier 标记和可分析性判断。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-result-package-qc-overview',
        title: 'Experiment Result Package QC overview',
        description: '结果包完整性、assay 文件状态、missing value 检查和 QC pass/warning 概览。',
        imagegenPrompt:
          'HER2 experiment result package QC overview dashboard, imported file checklist, assay QC matrix, missing value checks, pass warning markers, professional biomedical report figure, synthetic data.',
        placeholder: '图片：HER2 Experiment Result Package QC overview。',
        src: her2ResultPackageQcOverview,
        width: 900,
        height: 600,
        alt: 'HER2 experiment result package QC overview dashboard',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-004',
    role: 'mainAgent',
    markdown:
      '我把原始 assay 表统一成 analysis-ready table：每个 molecule 一行，readout 按 parent-normalized z-score 和原始单位同时保留。\n\n这样后续模型不会只依赖一个综合分数，仍然可以回看每个 readout 的证据来源。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'AssayTableNormalizer.buildAnalysisMatrix',
        status: 'success',
        summary: '构建 HER2 analysis-ready assay matrix',
        defaultCollapsed: true,
        input: {
          rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
          baseline: 'HER2-P0',
          flaggedRows: ['ELISA replicate HZ-03 R2'],
        },
        output: {
          analysisRows: 9,
          normalizedReadouts: ['BLI KD', 'BLI koff', 'ELISA IC50', 'cell-free binding response', 'expression', 'SEC monomer', 'Tm'],
          retainedFlags: ['ELISA outlier', 'DSF missing values'],
          auditTrail: 'HER2_analysis_assumption_log.md',
        },
        duration: '7.6s',
        artifacts: [
          {
            name: 'HER2_analysis_ready_matrix.csv',
            kind: 'csv',
            description: '模型分析输入矩阵，保留原始值、标准化值和 QC flag。',
          },
        ],
      },
    ],
  },
  {
    id: 'her2-analysis-turn-005',
    role: 'mainAgent',
    markdown:
      '我先分别拟合 BLI kinetics 和 ELISA dose-response。这里的模型用途是检查曲线质量和参数稳定性，不是直接宣布分子机制。\n\n初步结果：\n\n- BLI 拟合整体稳定，两个候选的 koff 改善比 KD 单点值更有解释力。\n- ELISA 曲线中有一个 replicate 对 IC50 影响偏大。\n- 如果不处理 outlier，ELISA 与 BLI 的排序一致性会下降。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'KineticsModel.fitBliCurves',
        status: 'success',
        summary: '拟合 HER2 BLI sensorgram 并输出 kinetics 参数',
        defaultCollapsed: true,
        input: {
          assaySheet: 'BLI',
          fittingModel: '1:1 binding with robust residual check',
          candidates: 8,
        },
        output: {
          fitPassRate: '8/8',
          stableKoffSignals: ['HER2-A01', 'HER2-A02', 'HER2-A08'],
          weakFitRegions: ['early association for HER2-A06'],
          evidenceStrength: 'moderate-high',
        },
        duration: '13.8s',
        artifacts: [
          {
            name: 'HER2_bli_curve_fit_parameters.csv',
            kind: 'csv',
            description: 'BLI KD、kon、koff、residual 和 fit quality flags。',
          },
        ],
      },
      {
        type: 'capabilityRunReplay',
        commandName: 'ElisaCurveModel.fitDoseResponse',
        status: 'warning',
        summary: '拟合 ELISA dose-response 并保留 outlier flag',
        defaultCollapsed: true,
        input: {
          assaySheet: 'ELISA',
          model: 'four-parameter logistic',
          outlierPolicy: 'flag first, compare later',
        },
        output: {
          fitPassRate: '7/8',
          flaggedReplicates: 1,
          sensitiveCandidates: ['HER2-A03', 'HER2-A05'],
          evidenceStrength: 'moderate',
        },
        duration: '12.2s',
        artifacts: [
          {
            name: 'HER2_elisa_curve_fit_parameters.csv',
            kind: 'csv',
            description: 'ELISA IC50、confidence interval、residual 和 outlier 标记。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-curve-fit-diagnostics',
        title: 'Curve fitting diagnostics',
        description: 'BLI sensorgram、ELISA dose-response、residual diagnostics 和参数表的模型拟合结果。',
        imagegenPrompt:
          'HER2 antibody assay curve fitting diagnostics, BLI sensorgram fits, ELISA dose response curves, residual plots, fitted parameter table, professional scientific report figure, synthetic data.',
        placeholder: '图片：HER2 BLI 和 ELISA curve fitting diagnostics。',
        src: her2CurveFitDiagnostics,
        width: 900,
        height: 600,
        alt: 'HER2 antibody BLI and ELISA curve fitting diagnostics',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-006',
    role: 'user',
    markdown:
      'ELISA 那个 outlier 先不要直接删。请做两套分析：保留原始数据一套，排除这个 QC 标记点一套。报告里要写清楚它对结论的影响。',
  },
  {
    id: 'her2-analysis-turn-007',
    role: 'mainAgent',
    markdown:
      '收到。我会把 outlier handling 当成人工决策边界记录下来：主报告展示 baseline analysis，同时在 sensitivity section 里比较排除 flagged replicate 后的变化。\n\n这可以避免两种误差：一是被单个异常点带偏，二是过度清洗导致报告看起来过于确定。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · 确认异常点处理边界',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-06-01 16:18',
        decision:
          '保留原始数据分析，并增加排除 ELISA flagged replicate 的 sensitivity comparison；报告中必须显式记录影响。',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-008',
    role: 'mainAgent',
    markdown:
      'Developability 模型把 expression、SEC-HPLC monomer、DSF/Tm 和纯化收率合并看。这里的稳健信号不是“谁最好”，而是哪些 readout 之间互相支持。\n\n当前比较稳的模式：\n\n- `HER2-A01` 和 `HER2-A08` 在 BLI、SEC monomer、Tm 上比较一致。\n- `HER2-A02` 的 binding 信号强，但 developability margin 较窄。\n- `HER2-A06` 在多个模型里分歧大，不适合做强结论。\n\n这些都是分析层判断，不能替代后续项目决策。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'DevelopabilitySignalModel.scoreHer2Readouts',
        status: 'success',
        summary: '整合 expression、SEC-HPLC、DSF 和 purification readouts',
        defaultCollapsed: true,
        input: {
          analysisMatrix: 'HER2_analysis_ready_matrix.csv',
          gates: ['expression >= 30 mg/L', 'SEC monomer >= 95%', 'Tm >= parent - 2 C'],
        },
        output: {
          robustDevelopabilitySignals: ['HER2-A01', 'HER2-A08'],
          narrowMarginSignals: ['HER2-A02'],
          highDisagreementSignals: ['HER2-A06'],
          evidenceStrength: 'moderate',
        },
        duration: '10.8s',
        artifacts: [
          {
            name: 'HER2_developability_signal_table.csv',
            kind: 'csv',
            description: '表达、纯度、热稳定性和模型一致性评分。',
          },
        ],
      },
    ],
  },
  {
    id: 'her2-analysis-turn-009',
    role: 'mainAgent',
    markdown:
      '我又跑了结构兼容性模型，把 wet-lab readout 和 HER2 epitope 接触面放在一起解释。这个模块只能产生**假设性解释**：它能提示哪些几何变化可能与 BLI/ELISA 信号一致，但不能证明机制。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'StructuralHypothesisModel.mapReadoutsToEpitope',
        status: 'success',
        summary: '生成 HER2 readout 的结构假设解释',
        defaultCollapsed: true,
        input: {
          structureModel: 'HER2_candidate_complex_panel.pdb',
          readouts: ['BLI kinetics', 'ELISA IC50', 'SEC monomer', 'Tm'],
          interpretationMode: 'hypothesis only',
        },
        output: {
          plausibleHypotheses: ['epitope contact geometry shift', 'reduced off-rate without broad stability penalty'],
          unsupportedClaims: ['causal mechanism', 'confirmed epitope relocation'],
          evidenceStrength: 'low-moderate',
          requiredValidation: 'orthogonal structural or competition assay evidence',
        },
        duration: '16.4s',
        artifacts: [
          {
            name: 'HER2_structural_hypothesis_notes.md',
            kind: 'md',
            description: '结构假设、支持证据和不可声称内容。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-structural-hypothesis-map',
        title: 'Structural hypothesis map',
        description: '把 HER2 epitope 接触面、wet-lab readouts 和结构解释假设放在同一张图中。',
        imagegenPrompt:
          'HER2 antibody structural interpretation hypothesis map, antibody variable region and HER2 epitope surface, evidence callouts, confidence and uncertainty markers, professional biomedical report figure.',
        placeholder: '图片：HER2 structural hypothesis map。',
        src: her2StructuralHypothesisMap,
        width: 900,
        height: 600,
        alt: 'HER2 antibody structural hypothesis map for post-experiment analysis',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-010',
    role: 'mainAgent',
    markdown:
      '我会在报告里把“模型解释”和“实验事实”分开写：\n\n| Layer | 可以写 | 不能写 |\n| --- | --- | --- |\n| Raw result | 文件完整、QC 状态、曲线拟合质量 | 推断真实作用机制 |\n| Model result | 模型一致性、置信区间、分歧来源 | 单一模型决定项目走向 |\n| Structural hypothesis | 哪些 readout 与结构假设相容 | 证明 HER2 表位或机制变化 |\n| Human judgment | outlier policy、解释边界、归档确认 | 把人工判断伪装成模型自动结论 |\n\n这会让 Demo 更真实：Agent 做复杂分析，但关键边界仍需要人确认。',
  },
  {
    id: 'her2-analysis-turn-011',
    role: 'mainAgent',
    markdown:
      '我现在把模型结果做 multi-model consensus。这里不是投票选冠军，而是看不同模型是否指向同一类信号，以及不一致来自哪里。\n\n共识结果摘要：\n\n- 稳健区间：BLI kinetics 与 developability 同向的分子族。\n- 分歧区间：ELISA outlier 和 DSF gate 会改变部分排序。\n- 低置信区间：结构解释与 wet-lab readout 只有弱到中等支持。\n\n报告会保留每个模型的独立输出和综合矩阵。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ModelConsensusAnalyzer.integrateSignals',
        status: 'success',
        summary: '整合 kinetics、ELISA、developability 和结构假设模型',
        defaultCollapsed: true,
        input: {
          modelInputs: [
            'HER2_bli_curve_fit_parameters.csv',
            'HER2_elisa_curve_fit_parameters.csv',
            'HER2_developability_signal_table.csv',
            'HER2_structural_hypothesis_notes.md',
          ],
          consensusPolicy: 'show agreement and disagreement',
        },
        output: {
          robustSignals: ['HER2-A01 family', 'HER2-A08 family'],
          disagreementDrivers: ['ELISA flagged replicate', 'DSF gate strictness', 'structural model uncertainty'],
          modelConsensus: 'context-dependent',
          confidenceUse: 'report intervals, not a single deterministic call',
        },
        duration: '14.9s',
        artifacts: [
          {
            name: 'HER2_model_consensus_score_table.csv',
            kind: 'csv',
            description: '各模型分数、置信区间、分歧来源和综合解释。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-model-consensus-analysis',
        title: 'Multi-model consensus analysis',
        description: '多模型评分热图、模型分歧、置信区间和决策边界说明。',
        imagegenPrompt:
          'HER2 antibody multi-model consensus analysis figure, model score heatmap, disagreement bars, uncertainty intervals, decision boundary notes, synthetic data, scientific report style.',
        placeholder: '图片：HER2 multi-model consensus analysis。',
        src: her2ModelConsensusAnalysis,
        width: 900,
        height: 600,
        alt: 'HER2 antibody multi-model consensus analysis figure',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-012',
    role: 'mainAgent',
    markdown:
      '当前可写入报告的分析结论是：\n\n| Finding | Confidence | Why it matters |\n| --- | --- | --- |\n| BLI fitting quality overall acceptable | High | kinetics 参数可用于后续比较 |\n| ELISA signal sensitive to one flagged replicate | Medium | 需要在报告中展示 sensitivity |\n| Developability readouts support a stable subgroup | Medium | 表达、SEC 和 Tm 没有全部互相冲突 |\n| Structural interpretation remains hypothesis-level | Low-Medium | 只能解释相容性，不能证明因果 |\n| Overall consensus is useful for review, not automatic nomination | Medium | 支持人工审阅和项目决策 |\n\n我不会把这些压成一个单一结论，因为那会掩盖模型分歧。',
  },
  {
    id: 'her2-analysis-turn-013',
    role: 'user',
    markdown:
      '结构解释就按 hypothesis 写，不要写成机制证明。multi-model consensus 可以作为 review input，但不能看起来像 Agent 自动决定了项目方向。',
  },
  {
    id: 'her2-analysis-turn-014',
    role: 'mainAgent',
    markdown:
      '已记录。报告里会使用这套边界：\n\n- `Observed result`：来自实验结果包和曲线拟合。\n- `Model-supported pattern`：多个模型共同支持，但仍有置信区间。\n- `Hypothesis`：结构或表位层面的解释，只作为后续讨论输入。\n- `Human review required`：涉及项目取舍、异常点处理和是否推进的判断。\n\n这样不会把 Agent 的模型分析包装成自动决策。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · 确认模型解释边界',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-06-01 16:31',
        decision:
          '结构解释只写为 hypothesis；multi-model consensus 作为 review input，不作为自动项目决策。',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-015',
    role: 'mainAgent',
    markdown:
      '我跑了 sensitivity analysis，比较三种关键选择对结论的影响：\n\n1. 排除 ELISA flagged replicate。\n2. 使用 robust BLI fit weighting。\n3. 收紧 developability gate，尤其是 Tm threshold。\n\n结果显示：BLI 相关信号比较稳；ELISA 和 Tm gate 对综合评分影响较大。也就是说，报告可以写“有稳定信号”，但不能写成“模型已经确定了唯一答案”。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'UncertaintyAnalyzer.runSensitivityCheck',
        status: 'success',
        summary: '评估 outlier、BLI weighting 和 developability gate 对结论的影响',
        defaultCollapsed: true,
        input: {
          scenarios: ['baseline', 'exclude flagged ELISA replicate', 'robust BLI weighting', 'stricter Tm gate'],
          consensusTable: 'HER2_model_consensus_score_table.csv',
        },
        output: {
          robustSignals: ['BLI kinetics direction', 'package-level QC completeness'],
          sensitiveSignals: ['ELISA IC50 estimate', 'Tm gate strictness'],
          fragileClaims: ['structure-level causal explanation'],
          recommendedReportLanguage: 'evidence-weighted and assumption-aware',
        },
        duration: '11.7s',
        artifacts: [
          {
            name: 'HER2_uncertainty_sensitivity_summary.md',
            kind: 'md',
            description: '关键假设、敏感性结果和报告措辞建议。',
          },
        ],
      },
      {
        type: 'scientificFigure',
        figureId: 'her2-uncertainty-sensitivity-analysis',
        title: 'Uncertainty and sensitivity analysis',
        description: '比较 outlier handling、BLI weighting 和 developability gate 对分析结论的影响。',
        imagegenPrompt:
          'HER2 antibody uncertainty and sensitivity analysis figure, scenario comparison, tornado sensitivity chart, outlier influence plot, assumption log summary, scientific report style.',
        placeholder: '图片：HER2 uncertainty and sensitivity analysis。',
        src: her2UncertaintySensitivityAnalysis,
        width: 900,
        height: 600,
        alt: 'HER2 antibody uncertainty and sensitivity analysis figure',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-016',
    role: 'mainAgent',
    markdown:
      '我把 assumption log 单独整理出来，避免主报告里只看到漂亮图：\n\n- ELISA outlier policy：主分析保留，sensitivity 分析排除。\n- DSF missing values：缺失率低，不触发整表排除。\n- Structural model：只能提供相容性解释。\n- Consensus score：用于审阅排序和分歧定位，不是自动决策。\n- Human boundary：涉及项目推进的判断留给 reviewer。\n\n这个 log 会和分析报告一起保存。',
  },
  {
    id: 'her2-analysis-turn-017',
    role: 'mainAgent',
    markdown:
      '我已把 HER2 实验后多模型分析写回 Project Files。\n\n保存内容：\n\n- `HER2_post_experiment_multimodel_analysis_report.md`\n- `HER2_model_consensus_score_table.csv`\n- `HER2_curve_fit_and_qc_summary.xlsx`\n- `HER2_post_analysis_figure_bundle.png`\n- `HER2_analysis_assumption_log.md`\n\n报告中的结论按 evidence strength 分层，结构解释写为 hypothesis，sensitivity section 会展示 outlier handling 对结论的影响。',
    contentBlocks: [
      {
        type: 'capabilityRunReplay',
        commandName: 'ProjectFile.save',
        status: 'success',
        summary: '保存 HER2 实验后多模型分析报告和支持文件',
        defaultCollapsed: true,
        input: {
          project: 'Antibody Optimization',
          files: [
            'HER2_post_experiment_multimodel_analysis_report.md',
            'HER2_model_consensus_score_table.csv',
            'HER2_curve_fit_and_qc_summary.xlsx',
            'HER2_post_analysis_figure_bundle.png',
            'HER2_analysis_assumption_log.md',
          ],
        },
        output: {
          savedFiles: 5,
          report: 'HER2_post_experiment_multimodel_analysis_report.md',
          consensusTable: 'HER2_model_consensus_score_table.csv',
          curveFitSummary: 'HER2_curve_fit_and_qc_summary.xlsx',
          figureBundle: 'HER2_post_analysis_figure_bundle.png',
          assumptionLog: 'HER2_analysis_assumption_log.md',
        },
        duration: '3.4s',
        artifacts: [
          {
            name: 'HER2_post_experiment_multimodel_analysis_report.md',
            kind: 'md',
            description: '实验后多模型分析报告，包含 QC、模型共识、假设解释和 sensitivity analysis。',
          },
          {
            name: 'HER2_model_consensus_score_table.csv',
            kind: 'csv',
            description: '模型分数、置信区间、分歧来源和综合解释矩阵。',
          },
          {
            name: 'HER2_curve_fit_and_qc_summary.xlsx',
            kind: 'xlsx',
            description: 'BLI、ELISA 和 QC summary 的结构化结果。',
          },
          {
            name: 'HER2_post_analysis_figure_bundle.png',
            kind: 'png',
            description: '实验后分析图集。',
          },
          {
            name: 'HER2_analysis_assumption_log.md',
            kind: 'md',
            description: '异常点、模型边界、结构假设和人工判断记录。',
          },
        ],
      },
      {
        type: 'projectFile',
        fileName: 'HER2_post_experiment_multimodel_analysis_report.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: '实验后多模型分析报告：包含结果包 QC、curve fitting、multi-model consensus、结构假设和 sensitivity analysis。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_model_consensus_score_table.csv',
        fileKind: 'csv',
        location: 'Antibody Optimization / Files / Analysis Results',
        note: '多模型共识评分表：保留各模型独立输出、置信区间和分歧来源。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_curve_fit_and_qc_summary.xlsx',
        fileKind: 'xlsx',
        location: 'Antibody Optimization / Files / Analysis Results',
        note: 'BLI、ELISA curve fitting 和 QC summary 的结构化结果。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_post_analysis_figure_bundle.png',
        fileKind: 'png',
        location: 'Antibody Optimization / Files / Figures',
        note: '实验后分析图集：QC overview、curve fitting、consensus、结构假设和 uncertainty analysis。',
      },
      {
        type: 'projectFile',
        fileName: 'HER2_analysis_assumption_log.md',
        fileKind: 'md',
        location: 'Antibody Optimization / Files / Reports',
        note: '记录 outlier policy、模型解释边界和人工确认事项。',
      },
    ],
  },
  {
    id: 'her2-analysis-turn-018',
    role: 'user',
    markdown:
      '可以。把这版报告和 assumption log 归档就好。不要在这个 Thread 里继续延伸成新的实验建议。',
  },
  {
    id: 'her2-analysis-turn-019',
    role: 'mainAgent',
    markdown:
      '已归档。\n\n这个 Thread 的最终边界如下：\n\n- 完成了 HER2 Experiment Result Package 的实验后分析。\n- 生成了 curve fitting、developability、结构假设、multi-model consensus 和 uncertainty/sensitivity 的分析证据。\n- 保存了报告、评分表、曲线/QC 摘要、图集和 assumption log。\n- 所有结构层解释都按 hypothesis 记录，没有写成确定机制。\n- 当前 Thread 到这里停止，不继续扩展为新的实验方案。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: 'human.confirmed · 确认分析报告归档',
        confirmedBy: 'zhengjun',
        confirmedAt: '2026-06-01 16:46',
        decision:
          '确认 HER2_post_experiment_multimodel_analysis_report.md 和 HER2_analysis_assumption_log.md 归档；当前 Thread 停止在实验后分析交付。',
      },
    ],
  },
]

export const her2PostExperimentAnalysisRunInspector: RunInspectorData = {
  summary: {
    stage: '实验后结果分析完成',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 5,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'result-package-load',
      title: '结果包导入',
      status: 'done',
      detail: '读取 HER2 wet-lab raw bundle、QC report、summary report 和 figure package。',
    },
    {
      id: 'qc-audit',
      title: '结果 QC 和异常点审阅',
      status: 'done',
      detail: '确认文件完整性、DSF missing values 和 ELISA outlier 标记。',
    },
    {
      id: 'model-analysis',
      title: '多模型分析执行',
      status: 'done',
      detail: '运行 BLI/ELISA 拟合、developability、结构假设和模型共识分析。',
    },
    {
      id: 'human-outlier-policy',
      title: '异常点处理确认',
      status: 'done',
      detail: '用户确认保留原始分析并加入排除 outlier 的 sensitivity comparison。',
    },
    {
      id: 'interpretation-boundary',
      title: '模型解释边界确认',
      status: 'done',
      detail: '结构解释只作为 hypothesis，multi-model consensus 作为 review input。',
    },
    {
      id: 'uncertainty-analysis',
      title: '不确定性和敏感性分析',
      status: 'done',
      detail: '比较 outlier policy、BLI weighting 和 developability gate 对结论的影响。',
    },
    {
      id: 'analysis-archive',
      title: '分析报告归档',
      status: 'done',
      detail: '保存报告、评分表、curve fit summary、figure bundle 和 assumption log。',
    },
  ],
  outputs: [
    {
      id: 'her2-post-analysis-report',
      name: 'HER2_post_experiment_multimodel_analysis_report.md',
      kind: 'report',
      location: 'Antibody Optimization / Files / Reports',
      status: 'saved',
    },
    {
      id: 'her2-consensus-table',
      name: 'HER2_model_consensus_score_table.csv',
      kind: 'dataset',
      location: 'Antibody Optimization / Files / Analysis Results',
      status: 'saved',
    },
    {
      id: 'her2-curve-fit-summary',
      name: 'HER2_curve_fit_and_qc_summary.xlsx',
      kind: 'projectFile',
      location: 'Antibody Optimization / Files / Analysis Results',
      status: 'saved',
    },
    {
      id: 'her2-post-analysis-figures',
      name: 'HER2_post_analysis_figure_bundle.png',
      kind: 'figure',
      location: 'Antibody Optimization / Files / Figures',
      status: 'saved',
    },
    {
      id: 'her2-assumption-log',
      name: 'HER2_analysis_assumption_log.md',
      kind: 'report',
      location: 'Antibody Optimization / Files / Reports',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'her2-outlier-policy-confirmation',
      kind: 'humanConfirmation',
      title: '确认异常点处理边界',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-06-01 16:18',
    },
    {
      id: 'her2-interpretation-boundary-confirmation',
      kind: 'humanConfirmation',
      title: '确认模型解释边界',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-06-01 16:31',
    },
    {
      id: 'her2-analysis-archive-confirmation',
      kind: 'humanConfirmation',
      title: '确认分析报告归档',
      status: 'confirmed',
      actor: 'zhengjun',
      decidedAt: '2026-06-01 16:46',
    },
  ],
  capabilityRuns: [
    {
      id: 'her2-result-package-reader',
      commandName: 'ResultPackageReader.loadHer2Package',
      status: 'success',
      summary: '读取 HER2 Experiment Result Package',
      duration: '4.1s',
      input: {
        packageFiles: [
          'HER2_wetlab_raw_result_bundle.xlsx',
          'HER2_experiment_qc_report.md',
          'HER2_experiment_summary_report.md',
          'HER2_experiment_result_package_figures.png',
        ],
        project: 'Antibody Optimization / HER2 实验结果多模型分析',
      },
      output: {
        assaySheets: ['expression', 'purification', 'SEC-HPLC', 'DSF', 'BLI', 'ELISA'],
        candidateCount: 8,
        packageStatus: 'loaded',
        analysisMode: 'post-experiment only',
      },
      artifacts: [
        {
          name: 'HER2_result_package_manifest.json',
          kind: 'json',
        },
      ],
    },
    {
      id: 'her2-result-package-qc',
      commandName: 'ResultPackageQc.auditCompleteness',
      status: 'warning',
      summary: '结果包完整，但存在一个非关键 outlier 标记',
      duration: '5.5s',
      input: {
        rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
        qcReport: 'HER2_experiment_qc_report.md',
      },
      output: {
        expectedFiles: 19,
        importedFiles: 19,
        missingCriticalFiles: 0,
        flaggedOutliers: 1,
        dsfMissingRate: '2.1%',
      },
      artifacts: [
        {
          name: 'HER2_result_package_qc_audit.md',
          kind: 'md',
        },
      ],
    },
    {
      id: 'her2-analysis-matrix',
      commandName: 'AssayTableNormalizer.buildAnalysisMatrix',
      status: 'success',
      summary: '构建 HER2 analysis-ready assay matrix',
      duration: '7.6s',
      input: {
        rawBundle: 'HER2_wetlab_raw_result_bundle.xlsx',
        baseline: 'HER2-P0',
      },
      output: {
        analysisRows: 9,
        normalizedReadouts: ['BLI KD', 'BLI koff', 'ELISA IC50', 'cell-free binding response', 'expression', 'SEC monomer', 'Tm'],
        retainedFlags: ['ELISA outlier', 'DSF missing values'],
      },
      artifacts: [
        {
          name: 'HER2_analysis_ready_matrix.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'her2-bli-fitting',
      commandName: 'KineticsModel.fitBliCurves',
      status: 'success',
      summary: '拟合 HER2 BLI sensorgram 并输出 kinetics 参数',
      duration: '13.8s',
      input: {
        assaySheet: 'BLI',
        fittingModel: '1:1 binding with robust residual check',
        candidates: 8,
      },
      output: {
        fitPassRate: '8/8',
        stableKoffSignals: ['HER2-A01', 'HER2-A02', 'HER2-A08'],
        weakFitRegions: ['early association for HER2-A06'],
        evidenceStrength: 'moderate-high',
      },
      artifacts: [
        {
          name: 'HER2_bli_curve_fit_parameters.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'her2-elisa-fitting',
      commandName: 'ElisaCurveModel.fitDoseResponse',
      status: 'warning',
      summary: '拟合 ELISA dose-response 并保留 outlier flag',
      duration: '12.2s',
      input: {
        assaySheet: 'ELISA',
        model: 'four-parameter logistic',
        outlierPolicy: 'flag first, compare later',
      },
      output: {
        fitPassRate: '7/8',
        flaggedReplicates: 1,
        sensitiveCandidates: ['HER2-A03', 'HER2-A05'],
        evidenceStrength: 'moderate',
      },
      artifacts: [
        {
          name: 'HER2_elisa_curve_fit_parameters.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'her2-developability-model',
      commandName: 'DevelopabilitySignalModel.scoreHer2Readouts',
      status: 'success',
      summary: '整合 expression、SEC-HPLC、DSF 和 purification readouts',
      duration: '10.8s',
      input: {
        analysisMatrix: 'HER2_analysis_ready_matrix.csv',
        gates: ['expression >= 30 mg/L', 'SEC monomer >= 95%', 'Tm >= parent - 2 C'],
      },
      output: {
        robustDevelopabilitySignals: ['HER2-A01', 'HER2-A08'],
        narrowMarginSignals: ['HER2-A02'],
        highDisagreementSignals: ['HER2-A06'],
        evidenceStrength: 'moderate',
      },
      artifacts: [
        {
          name: 'HER2_developability_signal_table.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'her2-structural-hypothesis',
      commandName: 'StructuralHypothesisModel.mapReadoutsToEpitope',
      status: 'success',
      summary: '生成 HER2 readout 的结构假设解释',
      duration: '16.4s',
      input: {
        structureModel: 'HER2_candidate_complex_panel.pdb',
        interpretationMode: 'hypothesis only',
      },
      output: {
        plausibleHypotheses: ['epitope contact geometry shift', 'reduced off-rate without broad stability penalty'],
        unsupportedClaims: ['causal mechanism', 'confirmed epitope relocation'],
        evidenceStrength: 'low-moderate',
        requiredValidation: 'orthogonal structural or competition assay evidence',
      },
      artifacts: [
        {
          name: 'HER2_structural_hypothesis_notes.md',
          kind: 'md',
        },
      ],
    },
    {
      id: 'her2-consensus-model',
      commandName: 'ModelConsensusAnalyzer.integrateSignals',
      status: 'success',
      summary: '整合 kinetics、ELISA、developability 和结构假设模型',
      duration: '14.9s',
      input: {
        modelInputs: [
          'HER2_bli_curve_fit_parameters.csv',
          'HER2_elisa_curve_fit_parameters.csv',
          'HER2_developability_signal_table.csv',
          'HER2_structural_hypothesis_notes.md',
        ],
        consensusPolicy: 'show agreement and disagreement',
      },
      output: {
        robustSignals: ['HER2-A01 family', 'HER2-A08 family'],
        disagreementDrivers: ['ELISA flagged replicate', 'DSF gate strictness', 'structural model uncertainty'],
        modelConsensus: 'context-dependent',
        confidenceUse: 'report intervals, not a single deterministic call',
      },
      artifacts: [
        {
          name: 'HER2_model_consensus_score_table.csv',
          kind: 'csv',
        },
      ],
    },
    {
      id: 'her2-uncertainty-analysis',
      commandName: 'UncertaintyAnalyzer.runSensitivityCheck',
      status: 'success',
      summary: '评估 outlier、BLI weighting 和 developability gate 对结论的影响',
      duration: '11.7s',
      input: {
        scenarios: ['baseline', 'exclude flagged ELISA replicate', 'robust BLI weighting', 'stricter Tm gate'],
        consensusTable: 'HER2_model_consensus_score_table.csv',
      },
      output: {
        robustSignals: ['BLI kinetics direction', 'package-level QC completeness'],
        sensitiveSignals: ['ELISA IC50 estimate', 'Tm gate strictness'],
        fragileClaims: ['structure-level causal explanation'],
        recommendedReportLanguage: 'evidence-weighted and assumption-aware',
      },
      artifacts: [
        {
          name: 'HER2_uncertainty_sensitivity_summary.md',
          kind: 'md',
        },
      ],
    },
    {
      id: 'her2-post-analysis-save',
      commandName: 'ProjectFile.save',
      status: 'success',
      summary: '保存 HER2 实验后多模型分析报告和支持文件',
      duration: '3.4s',
      input: {
        project: 'Antibody Optimization',
        files: [
          'HER2_post_experiment_multimodel_analysis_report.md',
          'HER2_model_consensus_score_table.csv',
          'HER2_curve_fit_and_qc_summary.xlsx',
          'HER2_post_analysis_figure_bundle.png',
          'HER2_analysis_assumption_log.md',
        ],
      },
      output: {
        savedFiles: 5,
        report: 'HER2_post_experiment_multimodel_analysis_report.md',
        consensusTable: 'HER2_model_consensus_score_table.csv',
        curveFitSummary: 'HER2_curve_fit_and_qc_summary.xlsx',
        figureBundle: 'HER2_post_analysis_figure_bundle.png',
        assumptionLog: 'HER2_analysis_assumption_log.md',
      },
      artifacts: [
        {
          name: 'HER2_post_experiment_multimodel_analysis_report.md',
          kind: 'md',
        },
        {
          name: 'HER2_model_consensus_score_table.csv',
          kind: 'csv',
        },
        {
          name: 'HER2_curve_fit_and_qc_summary.xlsx',
          kind: 'xlsx',
        },
        {
          name: 'HER2_post_analysis_figure_bundle.png',
          kind: 'png',
        },
        {
          name: 'HER2_analysis_assumption_log.md',
          kind: 'md',
        },
      ],
    },
  ],
}

export const projects: Project[] = [
  {
    id: 'antibody-optimization',
    name: 'Antibody Optimization',
    threads: [
      {
        id: 'egfr-affinity',
        title: 'EGFR 抗体亲和力优化',
        lastActivity: '2 分钟',
        transcript: egfrAffinityTranscript,
        runInspector: egfrRunInspector,
      },
      {
        id: 'il17a-affinity-design',
        title: 'IL-17A 亲和力成熟实验设计',
        lastActivity: '2 天前',
        transcript: il17aAffinityDesignTranscript,
        runInspector: il17aRunInspector,
      },
      {
        id: 'her2-wetlab-validation',
        title: 'HER2 抗体候选湿实验验证',
        lastActivity: '1 天前',
        transcript: her2WetlabExecutionTranscript,
        runInspector: her2WetlabRunInspector,
      },
      {
        id: 'her2-post-experiment-analysis',
        title: 'HER2 实验结果多模型分析',
        lastActivity: '刚刚',
        transcript: her2PostExperimentAnalysisTranscript,
        runInspector: her2PostExperimentAnalysisRunInspector,
      },
      { id: 'cd3-bispecific', title: 'CD3 双抗序列优化分析', lastActivity: '1 小时' },
      { id: 'affinity-maturation', title: '亲和力成熟实验方案', lastActivity: '昨天' },
    ],
  },
  {
    id: 'enzyme-discovery',
    name: 'Enzyme Discovery',
    threads: [
      { id: 'enzyme-family', title: '新型噬酸酶家族调研', lastActivity: '3 小时' },
      { id: 'screening-plan', title: '酶活性筛选方案讨论', lastActivity: '昨天' },
      { id: 'enzymekcat', title: 'EnzymeKcat 模型探索', lastActivity: '2 天前' },
    ],
  },
  {
    id: 'data-assetization',
    name: 'Data Assetization',
    threads: [
      { id: 'sec-hplc', title: 'SEC-HPLC 数据资产化', lastActivity: '1 小时' },
      { id: 'bli-cleanup', title: 'BLI 数据整理', lastActivity: '3 小时' },
      { id: 'cell-assay-standard', title: '细胞实验结果标准化', lastActivity: '昨天' },
    ],
  },
  {
    id: 'model-to-oracle',
    name: 'Model-to-Oracle',
    threads: [
      { id: 'oracle-release', title: 'Oracle 发布准备', lastActivity: '2 小时' },
      { id: 'model-baseline', title: '模型评估与性能基准', lastActivity: '昨天' },
      { id: 'knowledge-map', title: '知识图谱构建计划', lastActivity: '2 天前' },
    ],
  },
  {
    id: 'protein-delivery',
    name: 'Protein Delivery',
    threads: [
      { id: 'vector-design', title: '递送载体设计讨论', lastActivity: '3 小时' },
      { id: 'aav-packaging', title: 'AAV 包装实验方案', lastActivity: '昨天' },
      { id: 'biodistribution', title: '体内分布结果分析', lastActivity: '5 天前' },
    ],
  },
]

export const capabilityChips: CapabilityChip[] = [
  {
    id: 'target-research',
    label: '靶点调研',
    prompt: '帮我围绕当前项目梳理靶点机制、疾病背景、竞品管线和关键证据缺口。',
  },
  {
    id: 'wet-lab',
    label: '设计到湿实验',
    prompt: '基于当前候选分子，帮我设计一份可提交评审的湿实验验证方案草稿。',
  },
  {
    id: 'data-asset',
    label: '数据资产化',
    prompt: '帮我把当前实验结果整理成可复用的 AI-Ready Dataset，并列出缺失元数据。',
  },
  {
    id: 'model-reuse',
    label: '模型复用',
    prompt: '帮我评估当前项目里哪些已有模型或 Oracle 可以复用，并给出验证计划。',
  },
  {
    id: 'delivery',
    label: '项目交付',
    prompt: '帮我生成当前项目的周报、风险列表和下一步行动建议。',
  },
  { id: 'more', label: '更多' },
]

export const useCases: UseCaseCard[] = [
  {
    id: 'target-evidence',
    icon: 'target',
    tone: 'cyan',
    title: '调研靶点机制与竞品',
    summary:
      '梳理靶点作用机制、疾病相关证据和竞品研发进展，帮助判断项目是否值得继续推进，以及下一步应验证什么。',
    input: '靶点名称 / 疾病背景 / 研究问题',
    output: '机制假设 / 竞品对比 / 证据缺口 / 验证建议',
    prompt:
      '请帮我调研靶点机制与竞品。\n\n我的靶点名称如下：【】\n我的疾病背景 / 适应症如下：【】\n我关心的研究问题如下：【】\n我已有的项目文件或证据如下：【】\n\n请基于以上信息，输出靶点机制假设、竞品管线对比、关键证据缺口和下一步验证建议。',
  },
  {
    id: 'wet-order',
    icon: 'flask',
    tone: 'blue',
    title: '从候选分子生成湿实验订单',
    summary:
      '把候选分子、实验目标和约束条件转成可评审的验证方案，并整理成可交给执行团队的订单草稿。',
    input: '分子类型 / 候选结构 / 实验目标',
    output: '实验方案 / CRO 订单 / 物料清单',
    prompt:
      '请帮我从候选分子生成湿实验验证方案和实验订单草稿。\n\n我的分子类型如下：【】\n我的候选分子或结构信息如下：【】\n我的实验目标如下：【】\n我的实验条件 / 约束如下：【】\n我的可用样本、材料或项目文件如下：【】\n\n请基于以上信息，输出实验方案、关键条件、CRO 订单草稿和物料清单。',
  },
  {
    id: 'ai-ready-dataset',
    icon: 'database',
    tone: 'teal',
    title: '整理实验结果为 AI-Ready Dataset',
    summary:
      '检查实验结果、元数据和质控信息，把原始记录整理成可追溯、可训练、可复用的数据资产。',
    input: '实验数据 / 元数据 / 质控信息',
    output: '标准化数据集 / 质控问题 / 可视化报告',
    prompt:
      '请帮我把实验结果整理成 AI-Ready Dataset。\n\n我的实验数据如下：【】\n我的元数据字段如下：【】\n我的质控规则或关注点如下：【】\n我希望复用的数据资产目标如下：【】\n\n请基于以上信息，输出标准化数据集结构、缺失元数据、质控问题和可视化报告框架。',
  },
  {
    id: 'oracle-tuning',
    icon: 'brain',
    tone: 'violet',
    title: '用实验数据微调 Oracle',
    summary:
      '评估实验数据是否适合用于模型微调，定义训练集、评估集和上线前需要通过的性能门槛。',
    input: '训练数据集 / 预测模型 / 评估集',
    output: '微调计划 / 性能评估 / 部署建议',
    prompt:
      '请帮我评估实验数据是否适合微调 Oracle，并生成训练与评估计划。\n\n我的训练数据集如下：【】\n我的预测目标如下：【】\n我的候选模型或 Oracle 如下：【】\n我的评估集和成功标准如下：【】\n\n请基于以上信息，输出数据适配性判断、微调方案、性能评估计划和部署建议。',
  },
  {
    id: 'weekly-risk',
    icon: 'report',
    tone: 'amber',
    title: '生成项目周报与风险列表',
    summary:
      '把项目进展、里程碑和风险事件整理成管理层可读的周报，同时给出下一步跟进行动。',
    input: '项目进展 / 里程碑 / 风险事件',
    output: '周报文档 / 风险列表 / 行动建议',
    prompt:
      '请帮我生成项目周报、风险列表和下一步行动建议。\n\n我的本周项目进展如下：【】\n我的关键里程碑如下：【】\n我的风险事件或阻塞如下：【】\n我的下周目标如下：【】\n\n请基于以上信息，输出项目周报、风险优先级列表和下一步跟进行动。',
  },
  {
    id: 'delivery-tracking',
    icon: 'package',
    tone: 'cyan',
    title: '项目交付追踪',
    summary:
      '检查交付物、依赖关系和潜在延期点，帮助项目负责人快速定位需要推进或升级处理的事项。',
    input: '里程碑计划 / 交付物 / 依赖关系',
    output: '交付清单 / 延误风险 / 跟进动作',
    prompt:
      '请帮我检查项目交付物、依赖关系和潜在延误风险。\n\n我的里程碑计划如下：【】\n我的交付物清单如下：【】\n我的关键依赖关系如下：【】\n我的当前阻塞或延期迹象如下：【】\n\n请基于以上信息，输出交付清单状态、延误风险、依赖风险和跟进动作。',
  },
]

export const initialThreadId = 'egfr-affinity'
