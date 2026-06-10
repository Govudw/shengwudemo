# Thread Replay System Design

## Status

This spec defines a P0 Replay system for Workspace Thread pages.

Replay is a view-only playback mode. It does not mutate Thread data, append transcript turns, write localStorage, update the URL, or create new Project Files. It temporarily controls how the current Thread and its Run Inspector are displayed.

## Goal

Add a Replay button to the Thread header so a user can replay the currently selected mock Thread as if the conversation and Agent work are appearing live.

The intended demo effect:

- The Thread starts from an empty visible transcript.
- Every 2 seconds, one readable replay step appears.
- AI text, user text, tool calls, file cards, DAG cards, approval cards, charts, and other blocks appear in sequence.
- The right-side Run Inspector also grows in sync with the replayed content.
- Clicking the Replay button again instantly completes playback and restores the full Thread view.

## Non-Goals

- No pause/resume controls.
- No speed selector.
- No URL replay mode.
- No localStorage persistence for replay progress.
- No automatic file side window preview at the end of replay.
- No real backend execution.
- No mutation of the seed `transcript` or `runInspector` data.

## Product Decisions

- Replay button appears in the Thread title bar, between the title/status area and the existing `运行信息` button.
- All seeded mock Threads with transcript content support Replay.
- Empty new conversations or Threads without transcript content show Replay disabled.
- Replay state is local component state.
- Switching Thread, Project, or top-level navigation ends replay and shows the full target view.
- Starting Replay closes the Workspace side window and opens Run Inspector.
- Composer is disabled during Replay.
- Replay completion has no toast or extra badge; the page simply returns to the full current state.

## Button Behavior

### Idle

The button shows:

```text
Replay
```

with a replay-style icon.

### Playing

The button shows:

```text
Finish Replay
```

plus a compact progress pill:

```text
12/86
```

The second click does not pause. It immediately finishes playback.

### Disabled

Disable Replay when:

- the selected Thread has no transcript turns;
- the Workspace is in new-conversation empty state;
- no selected Thread exists.

## Replay Step Model

Replay converts a `ConversationTurn[]` into a flat list of visual steps.

Step generation rules:

1. Each turn creates at least one step.
2. Markdown is split by parsed display segments, not by physical line wrapping.
3. Paragraphs, lists, tables, and code blocks each become one step.
4. Each `contentBlocks` item becomes one step.
5. A turn can therefore reveal as several steps:

```text
turn markdown paragraph
turn markdown table
capabilityRunReplay block
projectFile block
pipelineDag block
```

This avoids viewport-dependent line splitting while preserving the feeling of one visible unit appearing at a time.

## Transcript Rendering

During Replay, `ConversationTranscript` receives a derived list of partially visible turns.

For a partially replayed turn:

- show only revealed markdown segments;
- show only revealed content blocks;
- preserve original turn role styling;
- add a temporary "current replay step" style to the newest revealed segment or block.

The current step visual treatment:

- fade in;
- slight upward movement;
- 1-2 seconds of pale blue background or outline;
- no typewriter animation.

When replay finishes, `ConversationTranscript` receives the original full `thread.transcript`.

## Run Inspector Replay

Run Inspector uses the left transcript as the master clock.

For every revealed step, derive a partial `RunInspectorData` from the original full `thread.runInspector`.

Recommended P0 derivation:

- `capabilityRunReplay` block reveals the matching capability run by `commandName`.
- `projectFile` block reveals the matching output by file name.
- approval-related blocks reveal matching approvals by title, type, or decision metadata.
- `pipelineDag` block advances progress based on its `completedNodeIds` and `activeNodeId`.
- chart and table blocks can advance progress only when a matching progress item is obvious; otherwise they do not force a Run Inspector change.

The partial Run Inspector should always be valid:

- summary status is `running` while replay is in progress;
- `completedSteps` reflects the number of revealed done progress items;
- `outputCount`, `pendingCount`, approvals, and capability runs reflect revealed items;
- capability run details remain collapsed by default.

At the final step, or when the user clicks `Finish Replay`, show the complete original `thread.runInspector`.

## Side Window And Composer

Starting Replay:

- close the Workspace side window if open;
- clear side-window maximized mode;
- restore the normal Thread layout;
- open Run Inspector.

During Replay:

- composer is disabled;
- composer placeholder reads:

```text
Replay 正在回放当前 Thread...
```

After Replay:

- composer is enabled;
- no side window is automatically reopened.

## Scrolling

Replay auto-scrolls to the newest revealed step by default.

If the user manually scrolls upward during replay:

- stop auto-following;
- keep revealing steps;
- do not keep pulling the user back to the bottom.

When the user clicks `Finish Replay`, scroll near the latest content.

## Data Flow And Component Boundaries

### `ThreadWorkspace`

Owns replay state:

- mode: idle or playing;
- current replay step index;
- derived transcript;
- derived run inspector;
- timer lifecycle;
- start, finish, and reset behavior.

It also controls side window and run inspector state when replay starts.

### `ConversationTranscript`

Renders either:

- the full transcript; or
- a replay-derived partial transcript.

It should not own timer state.

### `ConversationBlocks`

Receives optional metadata for the active replay block and applies highlight styling. Existing block rendering remains unchanged.

### `RunInspector`

Receives either:

- the full run inspector; or
- a replay-derived partial run inspector.

It should not own replay logic.

### `ThreadComposer`

Receives disabled state and placeholder copy from `ThreadWorkspace`.

## Edge Cases

- If a Thread has transcript but no `runInspector`, Replay still works for the conversation. The Run Inspector opens and shows no running data or a minimal empty replay state.
- If a content block cannot be mapped to Run Inspector data, it still appears in the transcript. It simply does not change Run Inspector.
- If a user switches Thread during replay, stop replay and render the newly selected Thread normally.
- If the selected Thread changes while a timer is active, clear the timer.
- If the side window was maximized before replay, replay closes it and restores sidebar state through the existing side-window cleanup path.

## Accessibility

- The Replay button is a real `button`.
- Use `aria-pressed` or `aria-label` to distinguish idle and playing states.
- Progress pill text is visible; do not rely on animation alone.
- Do not force focus into the transcript on every step.
- Composer disabled state must be programmatic, not only visual.

## Test Plan

Add focused tests around pure replay logic where possible:

- step builder splits markdown and content blocks into stable steps;
- partial transcript contains only revealed segments and blocks;
- run inspector derivation reveals capability runs, outputs, approvals, and progress in order;
- finishing replay returns full transcript and full run inspector;
- switching Thread resets replay state;
- Replay button is disabled for empty Thread state;
- composer is disabled while replay is active.

Use component tests for:

- clicking Replay opens Run Inspector and closes side window;
- clicking Replay again finishes playback;
- current replay step receives highlight class;
- seeded LIMS Thread can replay file cards, DAG blocks, and capability calls without data loss.

## Acceptance Criteria

- Replay button appears in the requested header location.
- Clicking Replay starts playback from an empty visible transcript.
- One replay step appears every 2 seconds.
- AI and user text are both replayed.
- Tool calls and file blocks appear as replay steps.
- Run Inspector updates during replay.
- Clicking Replay again instantly completes playback.
- Final state matches the normal full Thread view.
- Replay does not persist across refresh or navigation.
- Existing mock data remains unchanged.
