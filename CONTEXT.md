# BioMap Agent Product Context

This context defines the product language for the BioMap Agent workspace. It keeps user-facing concepts consistent across Thread conversations, project assets, capabilities, and side panels.

## Language

**Thread**:
A conversation unit inside a Project. A Thread contains the user and Agent dialogue for one workflow or workflow slice.
User-facing UI may label a Thread as `对话`; `任务` should be reserved for operational work items such as Work Orders or experimental tasks.
_Avoid_: Chat, session, ticket

**Agent**:
The AI actor that helps operate a Thread, orchestrate Runs, and produce Project Files. An Agent can maintain an ELN Document, but the ELN Document should record experiment facts rather than the Agent conversation.
_Avoid_: Human operator, lab technician

**Experiment Owner**:
The human responsible for the experiment being orchestrated in a Run. The Experiment Owner may make decisions in the Thread and review the resulting ELN Document.
_Avoid_: Agent, generic user

**Project**:
A workspace-level container for related Threads, assets, capabilities, and project context. A Project may contain multiple Threads that describe different parts of the same scientific workflow.
_Avoid_: Folder, account, workspace

**Capability**:
A reusable ability that the Agent can apply to a Thread or Project context, such as a Pipeline, Skill, MCP Server, or Plugin.
_Avoid_: Generic feature, page module, asset file

**Pipeline**:
A governed workflow capability that sequences biological tools, human gates, approvals, and outputs for repeated R&D operations.
_Avoid_: Approval Flow, generic workflow, static DAG image

**Skill**:
A reusable instruction package that helps the Agent perform a class of work without becoming a fixed Pipeline or external tool provider.
_Avoid_: Pipeline, MCP Server, Plugin

**Capability Provider**:
An external or internal provider that exposes tools, resources, or extension points for Agent capabilities.
_Avoid_: Project owner, approver, notification source

**MCP Server**:
A Capability Provider that exposes MCP tools or resources under a connection and permission boundary.
_Avoid_: Pipeline, Skill, Plugin

**Plugin**:
A capability extension surface that can add UI or functional extension points, but is not itself a Pipeline or Skill.
_Avoid_: Document Block, MCP Server, generic widget

**Run Inspector**:
The right-side operational panel that summarizes an Agent run, including progress, outputs, approvals, and capability calls. It is the canonical term behind the user-facing label `运行信息`.
_Avoid_: File panel, execution window, sidebar

**Workspace Side Window**:
The right-side contextual window opened from a Thread header for auxiliary tools such as file browsing and side chat. It is not the Run Inspector and not a menu.
_Avoid_: Extra window, popup, dropdown, menu

**Product Management Platform**:
A full-screen enterprise management surface for product, commodity, cost, target, and billing operations. It is separate from the main BioMap Agent workspace shell and uses operational management language.
_Avoid_: Marketing site, workspace page, project page

**Product**:
A product-line object such as 虚拟细胞, 蛋白药物, 合成生物, 农业智能, or BioMap Agent. A Product owns business targets, cost models, and one or more Commodities.
_Avoid_: Commodity, billing item, project

**Commodity**:
A sellable commercial package under a Product, such as SaaS, private deployment, maintenance, or labor service. A Commodity contains Billing Items and references cost and discount views.
_Avoid_: Product, SKU when it hides product ownership

**Billing Item**:
A measurable charging component inside a Commodity, such as a resource package, monthly subscription, model call, storage unit, or service day. A Billing Item is the unit that can be priced, costed, and instantiated for billing.
_Avoid_: Bill, invoice, commodity

**Billing Instance**:
A customer-specific instance created from a Billing Item after order placement or backend provisioning. A Billing Instance receives usage and produces Bills over time.
_Avoid_: Billing item definition, product instance

**Bill**:
A recorded charge line generated from a Billing Instance or imported manually for a customer and billing period.
_Avoid_: Invoice when referring to internal charge records

**Cost Center**:
The management surface for cost items, cost models, allocation rules, target cost versions, and gross margin analysis. It explains how product and commodity costs are calculated.
_Avoid_: Billing center, finance approval system

**Cost Item**:
The smallest managed cost component used by cost models, such as GPU resource cost, storage cost, L1 human-day cost, delivery human-day cost, or third-party service cost.
_Avoid_: Billing item, bill

**Cost Model**:
The cost composition attached to a Billing Item, Commodity, or Product. It combines Cost Items, measurement assumptions, allocation rules, and a versioned cost basis to calculate target cost and margin.
_Avoid_: Discount table, price table

**Cost Allocation Rule**:
A rule for assigning shared or indirect costs to Products, Commodities, or Billing Items using a driver such as revenue, usage, seats, storage, or delivery effort.
_Avoid_: Permission rule, pricing rule

**Quarterly Product Target**:
A quarterly business target for one Product, including revenue target, cost budget, target gross margin, actual attainment, forecast, and risk status.
_Avoid_: Project milestone, OKR when financial target is meant

**Target Actual**:
The achieved value measured against a Quarterly Product Target, including actual revenue, confirmed cost, gross profit, gross margin, and forecast attainment.
_Avoid_: Target definition, raw bill

**Gross Margin**:
Revenue minus cost, shown as both gross profit amount and gross margin rate. Gross margin views must state whether they use target, actual, forecast, or discount-line assumptions.
_Avoid_: Net profit, cash flow

**Asset**:
A durable R&D object that the Agent can reference, call, generate, or reuse across a Project or the organization.
_Avoid_: Temporary attachment, local file, UI card

**Assets Workbench**:
The top-level product surface for finding and reviewing Assets, Project Files, and related file resources.
_Avoid_: Project list, personal drive, template library

**Asset Scope**:
The visibility boundary for an Asset, limited to public scope or project scope in this ToB platform.
_Avoid_: Personal scope, private drive, account scope

**File Space**:
The file-management area inside the Assets Workbench that can show Project Files and File Assets without implying every file is an Asset.
_Avoid_: Personal cloud drive, all-assets view

**Project File**:
A file-like asset produced, uploaded, or referenced inside a Project. A Project File can appear in Thread messages, Run Inspector outputs, and object storage views.
_Avoid_: Attachment when it refers to durable project storage

**File Asset**:
A file-like resource that has been registered, saved, archived, or published as a reusable Asset.
_Avoid_: Any uploaded file, transient message attachment

**Object Storage Asset**:
A Project File presented through a structured object path. It groups assets by project storage purpose rather than by the Thread that mentioned them.
_Avoid_: Chat attachment, local file

**Data Asset**:
A structured data object such as a dataset, table, analysis result, or data catalog entry that has been standardized or registered for reuse.
_Avoid_: Raw upload, spreadsheet attachment

**Experiment Asset**:
A durable experimental object such as an experiment list item, execution record, inventory object, device, or recipe managed through the Assets Workbench.
_Avoid_: Run, ELN Document, temporary checklist item

**Model Asset**:
A model object that the Agent can compare, call, reuse, or reference, including xTrimo platform models, public models, project models, and Oracles.
_Avoid_: Training job, transient inference result

**Knowledge Base**:
A reusable knowledge asset for Agent retrieval, reasoning, traceability, or biological context grounding, such as RAG, Knowledge Graph, or GraphRAG.
_Avoid_: Raw document folder, project notes, generic file list

**Run**:
A concrete execution instance orchestrated by an Agent inside a Thread. A Run may produce Project Files such as result packages and ELN Documents.
_Avoid_: Experiment when referring to the orchestration instance

**Work Order**:
An operational task issued during a Run for a specific experimental stage, such as construction, expression, purification, assay, or data ingest. A Work Order can be referenced by an ELN Document but is not itself the ELN Document.
_Avoid_: Chat task, checklist item

**Approval**:
An Agent subsystem for requesting, recording, and displaying human decisions during a Run. Approval artifacts may be referenced by ELN Documents, but the Approval workflow is not part of the ELN Document body.
_Avoid_: Signature Block, electronic signature system

**Approval Request**:
A formal approval artifact created for a high-impact operation such as submitting an Experiment Order, publishing a public asset, creating an external CRO order, or releasing a result package. An Approval Request may be processed by BioMap's built-in Approval Flow or by an External Approval Connector.
_Avoid_: Human Confirmation, Signature Block, notification

**Approval Gate**:
A pause point in a Run where the Agent must create or wait for an Approval Request before continuing a high-impact operation. A preview of a future gate is not itself an Approval Request.
_Avoid_: Human Confirmation, generic checkpoint, QC gate

**Approval Center**:
An enterprise management surface for approval governance, including Approval Requests, Approval Rules, built-in Approval Flows, Approver Groups, External Approval Connectors, and audit logs. It configures and reviews Approval artifacts, but it is not the Approval workflow itself and not the Notification Center.
_Avoid_: Notification Center, Run Inspector, admin menu

**Approval Rule**:
A governance rule that decides whether a high-impact operation needs Approval and which route it should use. An Approval Rule is evaluated before an Approval Request is created.
_Avoid_: permission rule, pricing rule, notification rule

**Approval Flow**:
A BioMap-owned sequence of approval stages used when an Approval Request is processed inside BioMap. External enterprise approval workflows are not modeled as Approval Flows inside BioMap.
_Avoid_: external approval workflow, Pipeline, Experiment Workflow

**Approver Group**:
A reusable set of people or roles that can be assigned to stages in a BioMap Approval Flow. It is an approval governance object, not the same as a Project team or a notification audience.
_Avoid_: Project team, mailing list, notification group

**Approval Evidence Package**:
The auditable package of operation-specific context attached to an Approval Request. It contains the information approvers or external systems need to make a decision, but it is not a Run Input Package or an Experiment Result Package.
_Avoid_: Project File, Run Input Package, Experiment Result Package

**Approval Record**:
The immutable history of an Approval Request, including its result, decision metadata, external status when applicable, and audit completeness. It can be viewed and referenced, but not edited as if it were configuration.
_Avoid_: Notification, chat log, editable form

**External Approval Connector**:
A black-box integration from BioMap Approval to an enterprise approval system. BioMap submits an Approval Request and Approval Evidence Package, receives status or callback results, and does not model the external system's internal stages or assignees.
_Avoid_: Approval Flow, internal workflow engine, connector-managed BioMap stages

**Notification Center**:
A cross-module surface for user notifications such as approvals, asset changes, project updates, and system messages. It manages notification attention state and links to source surfaces, but it is not the Approval Center and not an approval queue by itself.
_Avoid_: Approval Center, approval-only inbox, activity log

**Notification Attention State**:
The user-facing lifecycle of whether a notification still needs attention, such as unread, read, awaiting attention, or cleared. Clearing a notification does not change source artifacts such as Approval Requests, Agent Runs, Assets, or External Approval Connector records.
_Avoid_: Approval status, Run status, business object state

**ELN Document**:
A structured electronic lab notebook document produced during an experimental workflow. It is a BioMap Agent-specific document type that only this Agent project knows how to render, a Project File when stored as `.bmeln`, and may appear as an Object Storage Asset when shown by object path.
_Avoid_: Chat summary, transcript, plain Markdown file, generic `.eln` file

**ELN Format Version**:
The schema version of a `.bmeln` ELN Document. It defines how Document Blocks in the file should be interpreted and migrated, and is separate from document history or saved revisions.
_Avoid_: History version, autosave checkpoint

**ELN Revision**:
The saved revision number of a `.bmeln` ELN Document inside the standard file framework. It records which saved state is current, but does not imply a browsable version-history UI.
_Avoid_: Format version, Feishu-style history

**Document Block**:
A structured block inside an ELN Document, such as a paragraph, table, image, chart, signature, or attachment reference. Document Blocks are ELN-specific and do not define a general document model for other Project Files.
_Avoid_: Plugin, widget, external app, generic document block

**Chart Block**:
An interactive Document Block inside an ELN Document for visualizing experimental data summaries. Chart Blocks are rendered with ECharts in the current BioMap Agent ELN experience.
_Avoid_: Static image when interaction is expected, chart plugin

**Signature Block**:
A Document Block inside an ELN Document that represents a signature, confirmation, or approval record in the document body. It may reference an Approval artifact, but it is not the Approval workflow itself.
_Avoid_: Approval workflow, electronic signature system

**Document Outline**:
A collapsible navigation surface generated from H1-H6 headings in an ELN Document. It is part of the ELN editor UI, not a Document Block and not persisted in the `.bmeln` body.
_Avoid_: Document Block, table of contents stored in the document

**ELN Editing Experience**:
The user-facing editing behavior for `.bmeln` ELN Documents. It may borrow Feishu-like inline document cues, but it is scoped to ELN Documents and does not imply a general collaborative document platform.
_Avoid_: Feishu clone, complete collaboration suite, generic rich-text product

**Side Chat**:
An auxiliary conversation surface attached to the current Thread context. It is separate from the main Thread transcript.
_Avoid_: New Thread, comment, support chat

## Example Dialogue

Developer: Should the new right-side surface be another Run Inspector view?

Domain expert: No. The Run Inspector is for progress and execution state. The new surface is a Workspace Side Window.

Developer: When the user opens files from the side window, are those message attachments?

Domain expert: Treat them as Object Storage Assets. Some may have been introduced by Thread messages, but the side window should show them by object path.

Developer: Should Side Chat create a new Thread?

Domain expert: No. Side Chat stays attached to the current Thread context and does not replace the main Thread transcript.

Developer: Is the `.bmeln` asset just the Agent transcript exported as Markdown?

Domain expert: No. Treat it as an ELN Document. It may be stored as a Project File and displayed as an Object Storage Asset, but its domain purpose is to record the experiment, not to summarize the conversation.

Developer: Should the user-facing UI call every Thread a task?

Domain expert: No. Thread is the internal and domain concept. The UI can call it `对话`. Reserve `任务` for Work Orders, experimental tasks, and Agent execution steps.

Developer: Is every file shown under Assets a File Asset?

Domain expert: No. File Space can show Project Files and File Assets. Only registered, saved, archived, or published reusable files should be treated as File Assets.

Developer: Should Knowledge Base just be another folder under files?

Domain expert: No. A Knowledge Base is a reusable knowledge asset for retrieval, reasoning, or biological grounding. It may use files as sources, but it is not the source file folder itself.

Developer: Is Pipeline the same as an Approval Flow?

Domain expert: No. Pipeline is an Agent capability for repeated R&D operations. Approval Flow is a BioMap-owned approval route for Approval Requests.

Developer: Is an MCP Server an Asset?

Domain expert: No. It is a Capability Provider. It can expose tools that operate on Assets, but it belongs in Capabilities, not the Assets Workbench.

Developer: Does a `.bmeln` version mean users can browse and restore historical document versions?

Domain expert: No. A `.bmeln` file has an ELN Format Version for schema interpretation and may have an ELN Revision for the saved file state. Browsable history, restore, and diff are separate product capabilities.

Developer: Is `RUN-ENZ-SYN-20260604-001` the experiment ID?

Domain expert: No. That is the Run ID for the Agent-orchestrated execution instance. The ELN Document records the experiment content produced during that Run.

Developer: Should Work Orders become ELN sections?

Domain expert: No. A Work Order is a traceable operational source for a stage of the Run. The ELN Document can reference it, but the ELN structure should still read like an experimental notebook.

Developer: Is a signature inside the ELN an Approval?

Domain expert: No. Approval is an Agent subsystem. A Signature Block is only a Document Block inside the ELN Document, even when it references an Approval artifact.

Developer: Should the Notification Center become the place to configure approvals?

Domain expert: No. Notification Center only informs users that something needs attention. Approval Center is where Approval Rules, Approval Flows, External Approval Connectors, and Approval Records are managed.

Developer: If I clear an Approval Request notification, did I approve or reject the request?

Domain expert: No. Clearing only changes the Notification Attention State. The Approval Request must still be decided in Approval Center or by the External Approval Connector.

Developer: If a company uses its own approval platform, do we mirror every external approver and stage inside BioMap?

Domain expert: No. Treat that integration as an External Approval Connector. BioMap submits the Approval Request and Approval Evidence Package, then records the external result and audit completeness without recreating the external workflow.

Developer: Should the interactive chart inside the ELN be called a plugin?

Domain expert: No. Call it a Chart Block. It may be interactive, but it lives inside the ELN Document body like a Feishu document block and is rendered with ECharts in this product.

Developer: Is the left navigation in the ELN a Document Block?

Domain expert: No. It is a Document Outline generated from H1-H6 headings. It is editor UI and is not stored in the `.bmeln` body.

Developer: Does Feishu-like editing mean rebuilding the full Feishu document product?

Domain expert: No. It means the ELN Editing Experience should borrow inline document cues for `.bmeln` editing, such as document-like inline editing, insertion controls, block affordances, and heading navigation. Collaboration, comments, sharing, permissioning, and full document platform features are out of scope.
