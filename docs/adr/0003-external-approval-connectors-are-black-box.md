# External Approval Connectors are black-box integrations

BioMap Agent treats enterprise approval systems as black-box External Approval Connectors rather than modeling their internal stages, assignees, and routing rules as BioMap Approval Flows. BioMap submits an Approval Request and Approval Evidence Package, receives callback or polling results, records withdraw and sync status, and stores audit completeness. This keeps BioMap's approval governance compatible with customer-owned enterprise workflows while preserving traceability for Agent Runs and Approval Records.
