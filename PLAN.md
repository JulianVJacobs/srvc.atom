# srvc.atom Plan

## Active track

- Version: `1.0.0`
- Track: AtoM-native plugin first draft
- Ownership: `srvc.atom`
- Status: launch-ready (client-approved direction for first draft)

## Intent

- Add `Article` to the AtoM `Add` menu through a native PHP Symfony 1.x plugin.
- Replace the current external article capture experience with an AtoM-native create/edit form styled to match existing AtoM data-entry surfaces.
- Keep hosted fallback routes available until the client confirms preference for the native-plugin direction.

## Product framing

- This is the first AtoM-owned planning line for a native plugin experience.
- If the client prefers the native plugin after the first draft, subsequent work should continue here and expand into a full migration path from hosted fallback to native plugin capture.
- If the client does not prefer the native plugin, the hosted workbench remains the primary capture path and this line stops at prototype/draft validation.

## Release contract

- Planned version: `1.0.0`
- Version rationale: first owned release line for the AtoM-native plugin shell and article capture draft inside the service repository.
- Allowed change class: minor while the work is additive and plugin-scoped.
- Escalation rule: re-contract to major before implementation if the plugin requires AtoM core patching, incompatible data-model migration, or a cutover away from hosted fallback during the same line.
- Approval state: approved for implementation planning and lane launch preparation.
- Merge policy: eager-after-green into `phase/1.0.0`, then one final PR to `origin/main`.

## Fleet phase contract (integrated)

- Phase name: AtoM-native article plugin first draft
- Phase branch: `phase/1.0.0`
- Fleet identity: `1.0.0`
- Conductor lane: `[1.0.0][00-conductor]`
- Worker lanes: `[1.0.0][01-native-shell-contract]`, `[1.0.0][02-add-menu-route]`, `[1.0.0][03-native-form-surface]`, `[1.0.0][04-verification-decision]`
- Integration rule:
  - Lane 01 absorbs and completes both previously separate tracks: PHP plugin scaffolding and persistence/linking contract definition.

## Scope boundaries

- Stay inside plugin-owned or plugin-mounted surfaces in the AtoM application.
- Do not patch AtoM core templates or modules directly unless the contract is re-approved as breaking or migration-bearing work.
- Preserve the hosted fallback route and current workbench flow until native parity is demonstrated.
- Match AtoM layout, form controls, accordion/section behavior, validation language, and flash/error conventions.

## Phase plan

### Phase A: Integrated contract lane (scaffold + persistence boundary)

- Create a real PHP AtoM plugin scaffold under the AtoM plugin system.
- Establish local stack wiring so the plugin is mounted into `/atom/src/plugins` and can be enabled deterministically.
- Publish the persistence and linking contract in the same lane:
  - plugin-owned vs AtoM-linked data boundary,
  - create/update write policy,
  - identifier/linking rules,
  - fallback coexistence policy.
- Deliver plugin configuration and route/event registration baseline required by downstream lanes.

### Phase B: Add-menu integration

- Add `Article` under the AtoM `Add` menu using plugin-owned extension points.
- Bind the `Article` menu entry to the plugin module route.
- Keep the change additive and reversible (no core AtoM patch).

### Phase C: First-draft article module

- Create article actions, routes, and a first-pass form class.
- Render create/edit templates in AtoM visual language.
- Reuse AtoM form composition patterns where possible: section layout, help text, validation placement, flash messages, and submit behavior.
- Deliver a draft article create experience that feels like a native AtoM screen rather than a linked external workbench view.

### Phase D: Native parity decision gate

- Verify that the new article form meets AtoM UX expectations.
- Compare native plugin capture against the hosted fallback path for completeness and maintainability.
- Present the first draft to the client as the decision point.
- If approved, continue in this repo with a full migration roadmap; if not, freeze this line and keep hosted capture primary.

## Launch-ready lane decomposition

- `[1.0.0][00-conductor]` Integrate phase `1.0.0` native-plugin fleet
  - Owned surface: phase branch governance, manifest lifecycle, merge sequencing, final PR to `origin/main`
- `[1.0.0][01-native-shell-contract]` Deliver plugin shell and persistence/linking contract
  - Owned surface: plugin scaffold wiring, plugin configuration baseline, contract artifacts, persistence boundary definition
- `[1.0.0][02-add-menu-route]` Add `Article` menu entry and route binding
  - Owned surface: menu extension wiring and plugin route registration for Article entry point
- `[1.0.0][03-native-form-surface]` Implement AtoM-style article create/edit form
  - Owned surface: module actions, form class, templates/partials, validation and submission behavior
- `[1.0.0][04-verification-decision]` Validate parity and client decision gate
  - Owned surface: verification scripts/checklist, parity evidence, fallback coexistence validation, decision summary
  - Status: complete — see `docs/verification-checklist-1.0.0.md` and `docs/decision-note-1.0.0.md`

## Dependencies and merge order

- Dependencies:
  - Lane 02 depends on lane 01.
  - Lane 03 depends on lane 01 and can run after 02 starts once route baseline is stable.
  - Lane 04 depends on lanes 02 and 03.
- Merge order:
  - Merge 01 first.
  - Merge 02 and 03 after 01 (02 before 03 if route ownership needs stabilization).
  - Merge 04 last.
  - Conductor opens one final PR from `phase/1.0.0` to `origin/main`.

## Acceptance criteria for `1.0.0`

- `Article` appears in the AtoM `Add` menu.
- Selecting `Article` opens a native PHP AtoM screen owned by the plugin.
- The first-draft article form renders with AtoM-consistent structure and styling.
- Form submission reaches a deterministic plugin-owned save path.
- Hosted fallback remains available during evaluation.
- Persistence/linking contract is explicitly documented and implemented in the plugin baseline (lane 01 output).

## Risks and follow-ups

- Local plugin deployment into the running AtoM container is not yet fully wired and must be solved before feature implementation.
- The exact persistence boundary for article records is still undecided.
- If the desired article workflow depends heavily on existing accession or information object internals, the migration scope may exceed this initial release contract.

## Next decision

- Client review of the native article draft determines whether `srvc.atom` continues on a full AtoM-native migration path.
