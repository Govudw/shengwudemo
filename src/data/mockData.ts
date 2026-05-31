import egfrAntibodyAntigenComplex from '../assets/mock-science/egfr/egfr-antibody-antigen-complex.png'
import egfrBliSensorgram from '../assets/mock-science/egfr/egfr-bli-sensorgram.png'
import egfrCandidateHeatmap from '../assets/mock-science/egfr/egfr-candidate-heatmap.png'
import egfrCdrMutationMap from '../assets/mock-science/egfr/egfr-cdr-mutation-map.png'
import egfrOrderWorkflow from '../assets/mock-science/egfr/egfr-order-workflow.png'
import egfrParetoOptimization from '../assets/mock-science/egfr/egfr-pareto-optimization.png'
import egfrResultSummaryChart from '../assets/mock-science/egfr/egfr-result-summary-chart.png'
import egfrSecHplcChromatogram from '../assets/mock-science/egfr/egfr-sec-hplc-chromatogram.png'
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
    input: '靶点名称 / 疾病背景 / 研究问题',
    output: '机制解析 / 竞品对比 / 文献摘要',
    prompt: '帮我围绕当前项目调研靶点机制、疾病背景、竞品进展和关键证据缺口。',
  },
  {
    id: 'wet-order',
    icon: 'flask',
    tone: 'blue',
    title: '从候选分子生成湿实验订单',
    input: '分子结构 / 实验类型 / 条件',
    output: '实验方案 / CRO 订单 / 物料清单',
    prompt: '基于当前项目的候选分子，帮我生成一份湿实验验证方案和实验订单草稿。',
  },
  {
    id: 'ai-ready-dataset',
    icon: 'database',
    tone: 'teal',
    title: '整理实验结果为 AI-Ready Dataset',
    input: '实验数据 / 元数据 / 质控信息',
    output: '标准化数据集 / 可视化报告',
    prompt: '帮我把当前实验结果整理成 AI-Ready Dataset，并输出质控问题和可视化报告框架。',
  },
  {
    id: 'oracle-tuning',
    icon: 'brain',
    tone: 'violet',
    title: '用实验数据微调 Oracle',
    input: '训练数据集 / 预测模型 / 评估集',
    output: '微调模型 / 性能评估 / 部署包',
    prompt: '帮我评估这批实验数据是否适合微调 Oracle，并生成训练与评估计划。',
  },
  {
    id: 'weekly-risk',
    icon: 'report',
    tone: 'amber',
    title: '生成项目周报与风险列表',
    input: '项目进展 / 里程碑 / 风险事件',
    output: '周报文档 / 风险列表 / 行动建议',
    prompt: '帮我基于当前项目进展生成项目周报、风险列表和下一步行动建议。',
  },
  {
    id: 'delivery-tracking',
    icon: 'package',
    tone: 'cyan',
    title: '项目交付追踪',
    input: '里程碑计划 / 交付物 / 依赖关系',
    output: '交付清单 / 延误风险 / 跟进动作',
    prompt: '帮我检查当前项目交付物、依赖关系和潜在延误风险，并给出跟进动作。',
  },
]

export const initialThreadId = 'egfr-affinity'
