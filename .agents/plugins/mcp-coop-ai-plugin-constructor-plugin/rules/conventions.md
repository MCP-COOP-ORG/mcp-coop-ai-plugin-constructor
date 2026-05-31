---
name: Conventions
description: Standard rules and conventions for conventions.
trigger: always_on
---

## Clean Code Principles

- Write small, single-purpose functions — ideally under 20 lines.
- Extract complex conditional logic into well-named helper functions or variables.
- Avoid deep nesting — use early returns (guard clauses) to handle edge cases first.
- Prefer descriptive names over short ones — **NEVER** use single-letter variables unless for simple loop counters.
- Avoid side effects in functions — prefer pure functions where possible.
- Comment the "why", not the "what" — the code should explain what it does.
- Eliminate dead code immediately — do not leave commented-out blocks "just in case".

## SOLID Principles

- **Single Responsibility (SRP)**: A class/module should have one, and only one, reason to change.
- **Open/Closed (OCP)**: Entities should be open for extension but closed for modification. Use interfaces and polymorphism.
- **Liskov Substitution (LSP)**: Derived classes must be substitutable for their base classes without altering the correctness of the program.
- **Interface Segregation (ISP)**: Create fine-grained interfaces that are client-specific. Avoid "fat" interfaces.
- **Dependency Inversion (DIP)**: Depend on abstractions (interfaces), not on concretions (implementations). High-level modules should not depend on low-level modules.

## Clean Architecture

- Organize the system into concentric layers: Domain (core), Application (use cases), Adapters (interfaces), and Infrastructure (external).
- Enforce the **Dependency Rule**: Source code dependencies must point only inward, toward higher-level policies.
- Keep the Domain layer pure: **NEVER** import UI frameworks, databases, or third-party libraries into domain entities.
- Use interfaces (Ports) in the inner layers and implement them (Adapters) in the outer layers.
- Isolate use cases into explicit command/query handlers or services.
- Push side effects (I/O, database, network) to the outermost edges of the system.

## BEM Architecture

- Use Block-Element-Modifier (`block__element--modifier`) naming convention for CSS classes.
- **Block**: Standalone entity that is meaningful on its own (e.g., `header`, `menu`, `button`).
- **Element**: A part of a block that has no standalone meaning and is semantically tied to its block (e.g., `menu__item`, `header__title`).
- **Modifier**: A flag on a block or element to change appearance or behavior (e.g., `button--disabled`, `menu__item--active`).
- Use SCSS nesting (`&__element`, `&--modifier`) to explicitly define BEM structure.
- **NEVER** use nested element selectors (e.g., `block__elem1__elem2`) — elements are always direct children of the block in naming.

## NO CSS HACKS (Truncations)

- Do not use cheap layout hacks like `text-overflow: ellipsis` to hide UI problems. Content should dictate the container.
- Use proper layout mechanics (e.g., `flex-shrink: 0`, `flex-wrap: wrap`) to allow elements to flow logically without cutting off user data.

## DRY (Don't Repeat Yourself)

- Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.
- Consolidate duplicate logic into reusable functions or components.
- Extract magic numbers and hardcoded strings into named constants.
- Generalize shared behavior, but do not prematurely abstract if the code only occurs twice (Rule of Three).
- Apply DRY to infrastructure, configurations, and documentation as well as source code.

## KISS (Keep It Simple, Stupid)

- Choose the simplest solution that effectively solves the problem.
- Avoid clever, complex, or overly "smart" code that is difficult for others to understand.
- Defer optimization until it's proven necessary by profiling (avoid premature optimization).
- Prefer standard library functions and established patterns over custom implementations.
- Ask yourself: "Is there a simpler way to write this without losing clarity or performance?"

## YAGNI (You Aren't Gonna Need It)

- **NEVER** build features or generic abstractions for hypothetical future use cases.
- Implement only what is strictly required to satisfy current requirements.
- Delay design decisions until the last responsible moment when you have the most information.
- Strip out speculative "hooks" or extension points that aren't currently being used.
