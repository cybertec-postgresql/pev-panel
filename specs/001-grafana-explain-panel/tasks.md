# Tasks: Grafana PostgreSQL Explain Visualizer Panel Plugin

**Input**: Design documents from `/specs/001-grafana-explain-panel/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Feature Branch**: `001-grafana-explain-panel`  
**Generated**: 2025-11-24

**Tests**: Not included - tests are optional and not explicitly requested in the specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap Grafana panel plugin with official tooling and configure build system inside Docker

- [x] T001 Bootstrap plugin using @grafana/create-plugin or verify existing plugin.json and package.json structure
- [x] T002 Install dependencies: npm install (includes @grafana/data, @grafana/ui, @grafana/runtime, React 18.x, TypeScript 5.x)
- [x] T003 [P] Install Vue 3 runtime and PEV2 library: npm install vue@^3.4.0 pev2@latest
- [x] T004 [P] Install development dependencies: npm install --save-dev @types/node vue-loader@^17.4.0 @vue/compiler-sfc@^3.4.0
- [x] T005 Configure webpack for Vue bundling in .config/webpack/webpack.config.ts (add Vue loader, resolve alias, DefinePlugin for Vue feature flags)
- [x] T006 Update plugin.json metadata (name: "Postgres Explain Visualizer", id: "cybertec-pev-panel", type: "panel")
- [x] T007 [P] Create directory structure: src/components/, src/services/, src/types/, src/utils/, src/styles/
- [x] T008 Verify build process: npm run build produces dist/module.js with bundled Vue and PEV2

**Checkpoint**: Project structure initialized, dependencies installed, webpack configured, build successful

---

## Phase 2: Foundational (Type Definitions & Core Infrastructure)

**Purpose**: Establish type safety and shared utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 [P] Create src/types/plan-types.ts with ExecutionPlan, PlanNode, NodeType, JoinType, ParentRelationship interfaces (copy from contracts/plan-types.ts)
- [x] T010 [P] Create src/types/panel-options.ts with PanelOptions interface and DEFAULT_PANEL_OPTIONS (copy from contracts/panel-options.ts)
- [x] T011 [P] Create src/types/error-types.ts with ErrorType enum, ErrorState interface, PlanError class (copy from contracts/error-types.ts)
- [x] T012 [P] Create src/utils/constants.ts with default field names, font size ranges, performance thresholds
- [x] T013 [P] Create src/utils/logger.ts with console logging utilities (error, warn, info methods with context)
- [x] T014 [P] Create src/components/ErrorBoundary.tsx (React Error Boundary component with componentDidCatch)
- [x] T015 [P] Create src/components/ErrorDisplay.tsx (displays ErrorState using @grafana/ui Alert component)
- [x] T016 [P] Create src/components/LoadingSpinner.tsx (loading state component using @grafana/ui LoadingPlaceholder)
- [x] T017 Update src/module.ts to register panel plugin with PanelPlugin constructor

**Checkpoint**: Foundation ready - all types defined, error handling infrastructure in place, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visualize JSON EXPLAIN Output (Priority: P1) 🎯 MVP

**Goal**: Enable users to see PostgreSQL EXPLAIN (FORMAT JSON) output as an interactive tree visualization

**Independent Test**: Configure panel with TestData data source providing JSON EXPLAIN output, verify PEV2 visualization renders with node details, hover tooltips, and expand/collapse functionality

### Implementation for User Story 1

- [x] T018 [P] [US1] Create src/services/dataExtractor.ts (extract plan string from Grafana DataFrame by field name)
- [x] T019 [P] [US1] Create src/services/planValidator.ts (validate JSON structure matches ExecutionPlan interface using isValidExecutionPlan)
- [x] T020 [US1] Create src/services/vueBootstrap.ts (mountVueApp and unmountVueApp functions using Vue createApp)
- [x] T021 [US1] Create src/components/VueMount.tsx (React component managing Vue app lifecycle with useRef and useEffect)
- [x] T022 [US1] Integrate PEV2 Plan component in src/components/VueMount.tsx (import pev2 library, create Vue app with Plan component)
- [x] T023 [US1] Import PEV2 styles in src/components/VueMount.tsx (import 'pev2/dist/style.css')
- [x] T024 [US1] Create src/components/ExplainPanel.tsx (main panel component receiving PanelProps, managing data extraction and Vue mounting)
- [x] T025 [US1] Wire dataExtractor in ExplainPanel.tsx (call extractPlanData with data and options.planFieldName)
- [x] T026 [US1] Wire planValidator in ExplainPanel.tsx (validate extracted JSON before passing to Vue)
- [x] T027 [US1] Wire VueMount component in ExplainPanel.tsx (render VueMount with plan data when valid)
- [x] T028 [US1] Add error handling in ExplainPanel.tsx (try-catch blocks, render ErrorDisplay on failures)
- [x] T029 [US1] Wrap VueMount in ErrorBoundary in ExplainPanel.tsx
- [x] T030 [US1] Add loading state handling in ExplainPanel.tsx (display LoadingSpinner while processing)
- [x] T031 [US1] Update src/module.ts to export ExplainPanel as default panel component

**Checkpoint**: User Story 1 complete - JSON EXPLAIN output renders as PEV2 visualization with full interactivity

---

## Phase 4: User Story 4 - Handle Data Source Flexibility (Priority: P1)

**Goal**: Ensure plugin works with any Grafana data source (PostgreSQL, JSON API, TestData, Prometheus) without requiring specific data source types

**Independent Test**: Create panels with multiple data sources (PostgreSQL with "QUERY PLAN" field, JSON API with "execution_plan" field, TestData with "plan" field), verify all render correctly

**Dependencies**: Builds on User Story 1's data extraction and validation

### Implementation for User Story 4

- [x] T032 [US4] Enhance src/services/dataExtractor.ts to handle empty data (return null if data.series is empty)
- [x] T033 [US4] Enhance src/services/dataExtractor.ts to handle field not found (throw PlanError with FIELD_NOT_FOUND and available field names)
- [x] T034 [US4] Enhance src/services/dataExtractor.ts to handle multiple rows (log warning, use first row)
- [x] T035 [US4] Enhance src/services/dataExtractor.ts to handle both string and object field values (stringify objects, pass strings directly)
- [x] T036 [US4] Add comprehensive error messages in dataExtractor.ts with available field names for debugging
- [x] T037 [US4] Update ExplainPanel.tsx to handle NO_DATA error gracefully (display info message, not error)
- [x] T038 [US4] Update ExplainPanel.tsx to handle FIELD_NOT_FOUND error with resolution hint showing available fields

**Checkpoint**: Plugin works with any data source - field extraction is robust and provides helpful error messages

---

## Phase 5: User Story 2 - Visualize Plain Text EXPLAIN Output (Priority: P2)

**Goal**: Automatically detect plain text EXPLAIN format and convert to JSON for visualization without manual intervention

**Independent Test**: Provide plain text EXPLAIN output to panel, verify automatic format detection and conversion to visualization matching JSON output

**Dependencies**: Builds on User Story 1's validation and visualization

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create src/services/formatDetector.ts (detectFormat function returning 'json' | 'text' | 'unknown')
- [ ] T040 [P] [US2] Implement JSON detection in formatDetector.ts (check for { or [ start, validate with JSON.parse)
- [ ] T041 [P] [US2] Implement text detection in formatDetector.ts (regex patterns for Seq Scan, Index Scan, cost=, etc.)
- [ ] T042 [US2] Create src/services/textParser.ts (convertTextToJson function using PEV2's parsePlan utility)
- [ ] T043 [US2] Add error handling in textParser.ts (wrap parse failures with PlanError PARSE_ERROR)
- [ ] T044 [US2] Add validation after parsing in textParser.ts (ensure parsed result has Plan field)
- [ ] T045 [US2] Integrate formatDetector in ExplainPanel.tsx (detect format after extraction, before validation)
- [ ] T046 [US2] Integrate textParser in ExplainPanel.tsx (convert text to JSON when format is 'text')
- [ ] T047 [US2] Skip format detection when forceJsonMode is true in ExplainPanel.tsx
- [ ] T048 [US2] Handle INVALID_FORMAT error in ExplainPanel.tsx (display when format is 'unknown')
- [ ] T049 [US2] Handle PARSE_ERROR error in ExplainPanel.tsx (display with hint to use FORMAT JSON)

**Checkpoint**: Plain text EXPLAIN automatically converts and visualizes - users can use either format seamlessly

---

## Phase 6: User Story 3 - Configure Panel Display Options (Priority: P3)

**Goal**: Allow users to customize visualization appearance (font size, dark mode, field name) for better readability and theme matching

**Independent Test**: Adjust panel options (fontSize slider, darkMode toggle, planFieldName input), verify changes apply immediately without data re-fetch

**Dependencies**: Builds on User Story 1's panel and visualization

### Implementation for User Story 3

- [x] T050 [US3] Add panel options builder in src/module.ts using setPanelOptions method
- [x] T051 [US3] Add planFieldName text input to options builder (name: "Plan Field Name", default: "plan")
- [x] T052 [US3] Add forceJsonMode boolean switch to options builder (name: "Force JSON Mode", default: false)
- [x] T053 [US3] Add fontSize slider to options builder (name: "Font Size", range: 10-24, step: 1, default: 14)
- [x] T054 [US3] Add darkMode boolean switch to options builder (name: "Dark Mode", default: false)
- [x] T055 [US3] Pass fontSize option to VueMount.tsx component props
- [x] T056 [US3] Pass darkMode option to VueMount.tsx component props
- [x] T057 [US3] Apply fontSize to PEV2 component in VueMount.tsx (via Vue props or CSS variable)
- [x] T058 [US3] Apply darkMode to PEV2 component in VueMount.tsx (via Vue props or CSS class)
- [ ] T059 [US3] Create src/styles/pev2-overrides.css for theme-aware PEV2 styling
- [ ] T060 [US3] Import pev2-overrides.css in VueMount.tsx
- [ ] T061 [US3] Use Grafana theme variables in pev2-overrides.css (--grafana-font-family, --grafana-text-primary)
- [x] T062 [US3] Verify options persist when dashboard is saved and reloaded

**Checkpoint**: Panel options work - users can customize appearance and changes apply immediately

---

## Phase 7: User Story 5 - Automatic Panel Resizing (Priority: P3)

**Goal**: Gracefully handle browser and panel dimension changes without truncation or scroll issues

**Independent Test**: Resize browser window and panel dimensions, verify visualization scales appropriately with smooth transitions

**Dependencies**: Builds on User Story 1's visualization rendering

### Implementation for User Story 5

- [ ] T063 [US5] Add width and height props tracking in ExplainPanel.tsx
- [ ] T064 [US5] Pass width and height to VueMount.tsx component
- [ ] T065 [US5] Implement resize handler in VueMount.tsx using useEffect with [width, height] dependencies
- [ ] T066 [US5] Update container div dimensions in VueMount.tsx when width/height change
- [ ] T067 [US5] Trigger PEV2 layout recalculation on resize (if PEV2 exposes resize API)
- [ ] T068 [US5] Add CSS overflow: auto to container div in VueMount.tsx for scrolling when needed
- [ ] T069 [US5] Add debouncing to resize handler for performance (optional, if needed)
- [ ] T070 [US5] Verify resize performance meets < 500ms requirement

**Checkpoint**: Panel resizing works smoothly - visualization adapts to container dimensions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finalize plugin with documentation, testing, and production readiness

- [x] T071 [P] Update README.md with plugin description, installation, configuration, usage examples
- [x] T072 [P] Update README.md with sample PostgreSQL queries (JSON and text EXPLAIN formats)
- [x] T073 [P] Create CHANGELOG.md with initial version entry
- [ ] T074 [P] Add plugin logo to src/img/logo.svg
- [ ] T075 [P] Add plugin screenshots to src/img/ directory
- [ ] T076 [P] Create provisioning/dashboards/explain-example.json with sample dashboard
- [ ] T077 Add example queries to explain-example.json (simple scan, join, aggregation, CTE)
- [ ] T078 Verify bundle size is under 2MB requirement (npm run build, check dist/module.js)
- [ ] T079 Verify no external CDN references in bundle (inspect dist/module.js source)
- [ ] T080 Test plugin in local Grafana instance following quickstart.md
- [ ] T081 Test plugin with PostgreSQL data source and real EXPLAIN queries
- [ ] T082 Test plugin with TestData data source using CSV and JSON scenarios
- [ ] T083 Test error states: NO_DATA, FIELD_NOT_FOUND, INVALID_FORMAT, PARSE_ERROR
- [ ] T084 Verify CSP compliance (test in Grafana Cloud or with strict CSP settings)
- [ ] T085 Run linter: npm run lint and fix any issues
- [ ] T086 Run formatter: npm run format
- [x] T087 Build production bundle: npm run build
- [ ] T088 Generate plugin signing manifest if needed: npm run sign
- [ ] T089 Create distribution package: zip -r dist.zip dist/ or npm run package

**Checkpoint**: Plugin complete, tested, documented, and ready for distribution

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - Core visualization capability
- **User Story 4 (Phase 4)**: Depends on User Story 1 - Enhances data extraction
- **User Story 2 (Phase 5)**: Depends on User Story 1 - Adds format conversion
- **User Story 3 (Phase 6)**: Depends on User Story 1 - Adds customization
- **User Story 5 (Phase 7)**: Depends on User Story 1 - Adds responsive behavior
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundation (Phase 2) ──┬──> User Story 1 (Phase 3) ──┬──> User Story 4 (Phase 4)
                       │                              ├──> User Story 2 (Phase 5)
                       │                              ├──> User Story 3 (Phase 6)
                       │                              └──> User Story 5 (Phase 7)
                       │
                       └──> Polish (Phase 8) [after all stories]
```

### Recommended Implementation Order

**MVP First** (User Story 1 only):

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T017) ⚠️ CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T018-T031)
4. **STOP and VALIDATE**: Test with JSON EXPLAIN output
5. Deploy/demo if ready

**Full Feature Delivery**:

1. Complete Setup + Foundational (T001-T017)
2. Complete User Story 1 (T018-T031) → MVP ready
3. Complete User Story 4 (T032-T038) → Data source flexibility
4. Complete User Story 2 (T039-T049) → Text format support
5. Complete User Story 3 (T050-T062) → Customization options
6. Complete User Story 5 (T063-T070) → Responsive design
7. Complete Polish (T071-T089) → Production ready

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Tasks without [P] must run sequentially (dependencies on previous tasks)
- Always complete foundational tasks before story-specific tasks
- Test story independently before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: T003 + T004 can run parallel to T002 completion

**Phase 2 (Foundational)**: T009, T010, T011, T012, T013, T014, T015, T016 can all run in parallel

**User Story 1**: T018 + T019 can run in parallel

**User Story 2**: T039, T040, T041 can run in parallel, then T042

**Phase 8 (Polish)**: T071, T072, T073, T074, T075, T076 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all parallel foundation tasks together:
Task T009: "Create src/types/plan-types.ts"
Task T010: "Create src/types/panel-options.ts"
Task T011: "Create src/types/error-types.ts"
Task T012: "Create src/utils/constants.ts"
Task T013: "Create src/utils/logger.ts"
Task T014: "Create src/components/ErrorBoundary.tsx"
Task T015: "Create src/components/ErrorDisplay.tsx"
Task T016: "Create src/components/LoadingSpinner.tsx"

# Then launch User Story 1 parallel tasks:
Task T018: "Create src/services/dataExtractor.ts"
Task T019: "Create src/services/planValidator.ts"

# Then sequential implementation tasks...
```

---

## Implementation Strategy

### MVP First (Recommended for Single Developer)

**Deliverable**: Basic JSON EXPLAIN visualization

1. ✅ Phase 1: Setup (T001-T008) - ~2 hours
2. ✅ Phase 2: Foundational (T009-T017) - ~3 hours ⚠️ BLOCKS ALL STORIES
3. ✅ Phase 3: User Story 1 (T018-T031) - ~6 hours
4. **VALIDATE**: Test with sample JSON EXPLAIN data
5. **DEMO**: Show working visualization to stakeholders
6. Total MVP time: ~11 hours

### Incremental Delivery (Recommended for Team)

**Iteration 1 - MVP** (User Story 1):

- Setup + Foundational + US1
- Deliverable: JSON visualization working
- Demo: Show PEV2 rendering PostgreSQL plans

**Iteration 2** (User Story 4):

- Add data source flexibility
- Deliverable: Works with any Grafana data source
- Demo: PostgreSQL, JSON API, TestData all work

**Iteration 3** (User Story 2):

- Add text format auto-conversion
- Deliverable: No format restrictions
- Demo: Plain EXPLAIN queries work seamlessly

**Iteration 4** (User Story 3):

- Add customization options
- Deliverable: User-configurable appearance
- Demo: Dark mode, font size, field name options

**Iteration 5** (User Story 5):

- Add responsive design
- Deliverable: Professional panel behavior
- Demo: Resize window, panel scales smoothly

**Iteration 6** (Polish):

- Documentation and distribution
- Deliverable: Production-ready plugin
- Demo: Install from zip, works in Grafana Cloud

### Parallel Team Strategy

With 3 developers after Foundational phase:

**Developer A**: User Stories 1 + 4 (core visualization + data sources)
**Developer B**: User Story 2 (text format conversion)
**Developer C**: User Stories 3 + 5 (options + resize)

All stories integrate independently without conflicts.

---

## Task Summary

- **Total Tasks**: 89
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 9 tasks ⚠️ CRITICAL BLOCKER
- **Phase 3 (User Story 1 - P1)**: 14 tasks
- **Phase 4 (User Story 4 - P1)**: 7 tasks
- **Phase 5 (User Story 2 - P2)**: 11 tasks
- **Phase 6 (User Story 3 - P3)**: 13 tasks
- **Phase 7 (User Story 5 - P3)**: 8 tasks
- **Phase 8 (Polish)**: 19 tasks

**Parallelizable Tasks**: 26 tasks marked [P]

**MVP Scope** (Setup + Foundational + US1): 31 tasks (~11 hours estimated)

**Full Feature** (All phases): 89 tasks (~40 hours estimated)

---

## Format Validation ✅

All tasks follow the required checklist format:

- ✅ Checkbox: `- [ ]` prefix on all tasks
- ✅ Task ID: Sequential T001-T089
- ✅ [P] marker: Present on parallelizable tasks only
- ✅ [Story] label: Present on user story phase tasks (US1, US2, US3, US4, US5)
- ✅ Description: Clear action with exact file path
- ✅ Organization: Grouped by user story for independent implementation
- ✅ Dependencies: Clearly documented with phase structure
- ✅ MVP defined: User Story 1 (Phase 3) is the minimum viable product

---

## Notes

- All type definition files in contracts/ should be copied to src/types/ in Phase 2
- Vue 3 and PEV2 must be bundled (no CDN usage) per Principle III
- Error handling is comprehensive per Principle IX
- Each user story is independently testable per specification requirements
- Format detection supports both JSON and text EXPLAIN per User Story 2
- Panel options provide customization per User Story 3
- Foundational phase (Phase 2) BLOCKS all user story work - complete it first
- Tests are not included as they were not explicitly requested in specification
- Stop at any checkpoint to validate independently before proceeding
- Commit frequently, test thoroughly, follow constitution principles
