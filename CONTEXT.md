# BioMap Agent Product Context

This context defines the product language for the BioMap Agent workspace. It keeps user-facing concepts consistent across Thread conversations, project assets, capabilities, and side panels.

## Language

**Thread**:
A conversation unit inside a Project. A Thread contains the user and Agent dialogue for one workflow or workflow slice.
_Avoid_: Chat, session, ticket

**Project**:
A workspace-level container for related Threads, assets, capabilities, and project context. A Project may contain multiple Threads that describe different parts of the same scientific workflow.
_Avoid_: Folder, account, workspace

**Run Inspector**:
The right-side operational panel that summarizes an Agent run, including progress, outputs, approvals, and capability calls. It is the canonical term behind the user-facing label `运行信息`.
_Avoid_: File panel, execution window, sidebar

**Workspace Side Window**:
The right-side contextual window opened from a Thread header for auxiliary tools such as file browsing and side chat. It is not the Run Inspector and not a menu.
_Avoid_: Extra window, popup, dropdown, menu

**Project File**:
A file-like asset produced, uploaded, or referenced inside a Project. A Project File can appear in Thread messages, Run Inspector outputs, and object storage views.
_Avoid_: Attachment when it refers to durable project storage

**Object Storage Asset**:
A Project File presented through a structured object path. It groups assets by project storage purpose rather than by the Thread that mentioned them.
_Avoid_: Chat attachment, local file

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
