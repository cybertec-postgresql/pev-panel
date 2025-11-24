<!--
  SYNC IMPACT REPORT
  ==================
  Version Change: NONE → 1.0.0
  Constitution Type: New (Initial Ratification)

  Principles Defined:
  1. Security First
  2. Deterministic & Production-Grade
  3. Bundled Dependencies
  4. Grafana Plugin Standards
  5. React-Based UI
  6. Clear Architecture
  7. Type Safety
  8. PEV2 Integration
  9. Error Handling
  10. Performance

  Additional Sections:
  - Quality Standards
  - Development Workflow
  - Governance

  Templates Status:
  ✅ plan-template.md - Reviewed, no updates needed (generic template structure compatible)
  ✅ spec-template.md - Reviewed, no updates needed (generic template structure compatible)
  ✅ tasks-template.md - Reviewed, no updates needed (generic template structure compatible)
  ✅ agent-file-template.md - Reviewed, no updates needed (generic template)
  ✅ checklist-template.md - Reviewed, no updates needed (generic template)

  Follow-up TODOs: None

  Generated: 2025-11-24
-->

# Grafana Panel Plugin for PostgreSQL EXPLAIN Visualization Constitution

**Project**: cybertec-pev-panel  
**Domain**: Grafana plugin development, TypeScript, React, PostgreSQL query analysis  
**Expert Role**: Grafana plugin engineer and TypeScript architect

## Core Principles

### I. Security First

All code MUST prioritize security above convenience. Never use unsafe HTML rendering (dangerouslySetInnerHTML), external CDN resources, iframes, or eval-based patterns. All user-provided content and PostgreSQL EXPLAIN output MUST be sanitized and validated before display. Grafana plugin sandboxing rules MUST be respected. No bypass of Content Security Policy. External scripts or resources are strictly prohibited.

**Rationale**: Grafana runs in enterprise environments with sensitive data. Security vulnerabilities in plugins can compromise entire Grafana installations and expose production databases.

### II. Deterministic & Production-Grade

All code MUST compile without modification and be production-ready on first delivery. TypeScript strict mode MUST be enabled with zero compilation errors. No experimental features, unstable APIs, or "it works on my machine" patterns. Code MUST be fully typed, documented, and tested before delivery. No placeholder implementations or TODOs in production code.

**Rationale**: Plugin failures in production can impact monitoring and observability. Deterministic behavior ensures reliability and reduces operational risk.

### III. Bundled Dependencies

All dependencies MUST be bundled within the plugin distribution. Zero external CDN usage. Zero runtime fetching of libraries, fonts, or resources. Plugin MUST work in air-gapped environments, VPNs, and restricted networks. PEV2 library and all its dependencies MUST be fully bundled using webpack or the Grafana build toolchain.

**Rationale**: Enterprise Grafana installations often run in isolated networks. External dependencies create failure points and security risks.

### IV. Grafana Plugin Standards

Strictly follow Grafana plugin guidelines, conventions, and best practices. Use official Grafana APIs, lifecycle hooks, and data models. Adhere to plugin.json schema requirements. Follow Grafana's theming system and design patterns. Use @grafana/data for data transformation, @grafana/runtime for runtime services, and @grafana/ui for all UI components.

**Rationale**: Grafana provides battle-tested patterns. Deviating from standards creates maintenance burden and compatibility issues across Grafana versions.

### V. React-Based UI

All UI components MUST be React-based using @grafana/ui components. No vanilla JavaScript DOM manipulation, jQuery, or imperative DOM updates. Leverage Grafana's theme-aware components for consistency. Use React hooks and functional components as the primary pattern. No class components unless required by third-party integration.

**Rationale**: React provides predictable UI updates and integrates seamlessly with Grafana's rendering pipeline. @grafana/ui ensures visual consistency and theme compatibility.

### VI. Clear Architecture

Favor explicitness over magic. Clear separation of concerns between data fetching, transformation, and presentation. Self-documenting code structure with intuitive file organization. Avoid overly clever abstractions or hidden dependencies. Each module should have a single, clear responsibility.

**Rationale**: Plugins may be maintained by teams unfamiliar with the original implementation. Clear architecture reduces onboarding time and maintenance cost.

### VII. Type Safety

Leverage TypeScript fully. No 'any' types unless absolutely necessary (document justification). Comprehensive interfaces for all data structures. Use strict TypeScript compiler options. Type all props, state, events, and API responses. Define explicit types for PostgreSQL EXPLAIN JSON structures.

**Rationale**: Type safety catches bugs at compile time, provides IDE autocompletion, and serves as living documentation of data contracts.

### VIII. PEV2 Integration

Integrate the PEV2 (Postgres EXPLAIN Visualizer 2) library for EXPLAIN visualization while maintaining security and bundling requirements. PEV2 MUST be bundled, not loaded from CDN. Any required modifications to PEV2 MUST preserve its core visualization logic. Encapsulate PEV2 within a React component wrapper that handles Grafana-specific concerns (theming, data transformation, error handling).

**Rationale**: PEV2 is the proven standard for PostgreSQL EXPLAIN visualization. Proper integration ensures users get expert-level query analysis while maintaining plugin security and reliability standards.

### IX. Error Handling

Robust error boundaries at component boundaries. Graceful degradation when EXPLAIN data is malformed or incomplete. User-friendly error messages that guide users to resolution (e.g., "Invalid EXPLAIN JSON format. Ensure query returns EXPLAIN (FORMAT JSON) output"). All errors logged with sufficient context for debugging. No silent failures or generic error messages.

**Rationale**: Query analysis involves parsing complex JSON from diverse PostgreSQL versions. Clear error messages reduce support burden and improve user experience.

### X. Performance

Efficient rendering for large EXPLAIN plans (1000+ nodes). Proper React optimization (memoization, virtualization for large trees). Minimal bundle size where possible without sacrificing functionality or bundling requirements. Lazy loading of PEV2 visualization logic if beneficial. Avoid unnecessary re-renders or computation.

**Rationale**: PostgreSQL EXPLAIN plans can be very large. Poor performance degrades the user experience and can make the plugin unusable for complex queries.

## Quality Standards

All code MUST meet the following quality gates before delivery:

- **Compilation**: Zero TypeScript errors with strict mode enabled
- **Runtime**: No console errors or warnings in browser developer tools
- **UI**: Responsive design supporting Grafana's responsive breakpoints
- **Accessibility**: Keyboard navigation support, ARIA labels where appropriate
- **Compatibility**: Works with Grafana 10.4.0+ and modern browsers (Chrome, Firefox, Safari, Edge)
- **Documentation**: Clear README with setup instructions, usage examples, and troubleshooting guide

## Development Workflow

### Constitution Check Gates

Before any feature implementation:

1. **Security Review**: Verify no unsafe patterns (innerHTML, external resources, eval)
2. **Dependency Audit**: Confirm all dependencies are bundled, no CDN usage
3. **Type Safety Check**: Ensure strict TypeScript, no 'any' types without justification
4. **Grafana Standards**: Verify use of official Grafana APIs and @grafana/ui components
5. **Error Handling**: Confirm error boundaries and user-friendly error messages
6. **Performance**: Validate rendering performance with sample large EXPLAIN plans

Re-check after design phase before implementation begins.

### Code Review Requirements

- All PRs MUST pass constitution compliance checks
- Type safety verified (no 'any' escapes without documentation)
- Security patterns validated (no unsafe HTML, external resources)
- Error handling coverage confirmed
- Performance impact assessed for large EXPLAIN plans

## Governance

This constitution supersedes all other development practices. Any deviation MUST be explicitly documented and justified with rationale.

### Amendment Process

- Constitution amendments require version bump and documentation update
- Breaking changes to principles require major version increment
- New principles or expanded guidance require minor version increment
- Clarifications and wording improvements require patch version increment
- All amendments MUST include Sync Impact Report at top of file

### Versioning Policy

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward incompatible governance changes or principle removals/redefinitions
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

All feature specifications, implementation plans, and task lists MUST reference constitution principles. Violations MUST be tracked in Complexity Tracking section with explicit justification.

**Version**: 1.0.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2025-11-24
