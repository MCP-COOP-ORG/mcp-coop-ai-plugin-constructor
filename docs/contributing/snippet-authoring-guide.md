# AI Instruction Snippet — Formatting Pattern

Этот документ определяет **паттерн разметки** markdown-инструкций для ИИ-агентов.
Любой контент, написанный для agents, rules или workflows, **MUST** следовать этому паттерну.

---

## 1. Структура сниппета

### Заголовок

Каждый сниппет начинается с `##` (H2). Не `#` — он зарезервирован обёрткой платформы (skill/rule/workflow template).

```markdown
## Error Handling Standards
```

### Вводная фраза (опционально)

Для workflows и conditional-сниппетов — после заголовка **одна** фраза-trigger:

```markdown
## Planning & Task Decomposition

Before starting implementation:
```

Для rules и agents вводная фраза не нужна — сразу список.

### Тело — списки

Основной контент — это **bulleted list** или **numbered list**.

---

## 2. Два формата списков

### Bulleted list — для независимых правил (rules, agents)

Каждый пункт — отдельный constraint. Порядок не важен.

```markdown
## Naming Conventions

- Use `camelCase` for variables, functions, and methods.
- Use `PascalCase` for classes, interfaces, types, and components.
- Use `UPPER_SNAKE_CASE` for constants and environment variables.
- Prefix boolean variables with `is`, `has`, `should`, or `can`.
```

### Numbered list — для последовательных шагов (workflows)

Порядок важен. Агент выполняет шаг за шагом.

```markdown
## Planning & Task Decomposition

Before starting implementation:

1. Break the task into small, verifiable sub-tasks.
2. Identify dependencies between sub-tasks.
3. Assess the blast radius of the change.
4. Define success criteria for each sub-task.
5. Present the plan for review before proceeding.
```

---

## 3. Три типа пунктов

### Hard Constraint — абсолютный запрет или требование

Используй `**NEVER**` или `**MUST**` в bold. Нарушение = баг.

```markdown
- **NEVER** use `any` type — always use `unknown` or a specific generic.
- **MUST** validate all external inputs at system boundaries.
- **NEVER** import from Infrastructure layer into Domain layer.
```

### Directive — стандартная инструкция

Императив без модальности. Не "you should consider", а прямое действие.

```markdown
- Use constructor-based dependency injection.
- Prefer composition over inheritance.
- Return meaningful error messages without exposing internals.
```

### Conditional — правило с условием

Формат: "When/If [условие], [действие]."

```markdown
- When coordinating multi-step tasks, establish input/output contracts between steps.
- If a function exceeds 30 lines, extract helper functions with descriptive names.
```

---

## 4. Inline-разметка внутри пунктов

### Backticks — для literal-значений

Всё, что агент должен воспроизвести точно — в backticks:

```markdown
- Use `kebab-case` for file and directory names.
- Run `npm run lint` before committing.
- Set `ChangeDetectionStrategy.OnPush` on every component.
```

### Bold — для constraint-слов и ключевых терминов

Используется для ключевых слов-ограничений и важных доменных терминов:

```markdown
- **NEVER** run containers as root.
- Domain layer **MUST** have zero dependencies on frameworks.
- Define **Ports** as interfaces in the Domain layer.
```

### Em-dash после constraint — пояснение или альтернатива

После hard constraint через `—` идёт короткое пояснение:

```markdown
- **NEVER** use `console.log` in production — use a structured logger.
- **NEVER** swallow exceptions silently — always log or re-throw.
```

---

## 5. Markdown-разметка: полная карта элементов

### Элементы с высоким весом (агент обращает внимание)

| Элемент         | Синтаксис               | Эффект на агента                                                     |
| --------------- | ----------------------- | -------------------------------------------------------------------- |
| H2 заголовок    | `## Название`           | Скоупинг — агент понимает границы секции                             |
| H3 подзаголовок | `### Подсекция`         | Группировка внутри длинного skill — полезен когда сниппет > 10 строк |
| Bold constraint | `**NEVER**`, `**MUST**` | Максимальный приоритет, hard rule                                    |
| Bold термин     | `**Domain Layer**`      | Выделяет ключевой доменный термин, агент запоминает как сущность     |
| Inline code     | `` `functionName()` ``  | Агент понимает как literal — воспроизводит точно как есть            |
| Bullet list     | `- пункт`               | Каждый пункт = отдельная инструкция                                  |
| Numbered list   | `1. шаг`                | Строгий порядок выполнения                                           |
| Code block      | ` ``` `                 | Изоляция примера от инструкций, агент различает "пример" и "правило" |
| GitHub alert    | `> [!WARNING]`          | Сильнейший callout — все три платформы парсят как high-priority      |

### GitHub-style alerts — когда критически важно привлечь внимание

```markdown
> [!NOTE]
> Контекст, пояснение, фоновая информация.

> [!IMPORTANT]
> Ключевое требование, которое нельзя пропустить.

> [!WARNING]
> Потенциально опасное действие, breaking change.

> [!CAUTION]
> Риск потери данных или безопасности.
```

Используй alerts в сниппетах для edge cases и критических предупреждений,
которые важнее обычных bullet points.

### Элементы с ситуативным применением

| Элемент              | Когда уместен                                              | Когда НЕ уместен                                    |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| H1 (`#`)             | В standalone документах, не обёрнутых template             | В сниппетах — конфликт с обёрткой template          |
| Italic (`*text*`)    | Лёгкий акцент, отсылка к концепции                         | Для constraints — слишком слабый вес, лучше bold    |
| Blockquote (`>`)     | Callouts через GitHub alerts                               | Для обычного текста — агент может спутать с цитатой |
| ALL CAPS             | Работает, но слабее чем bold                               | Если уже используется `**BOLD**` — избыточно        |
| `---` (hr)           | В длинных сниппетах (20+ строк) для визуального разделения | В коротких сниппетах (5-10 строк) — шум             |
| Ссылки `[text](url)` | File path references (`@path/to/file`)                     | URL-ссылки — агент не ходит по URL в runtime        |
| Таблицы              | Structured data, маппинги, сравнения                       | Для инструкций — списки работают лучше              |

---

## 6. Когда нужен `default`, а когда platform-specific ключи

### Используй ТОЛЬКО `default` когда:

- Правило универсально для любого ИИ-ассистента (90% случаев)
- Различия между платформами несущественны
- Пример: naming conventions, architecture constraints, code quality rules

### Добавляй platform-specific ключи когда:

- Платформа имеет уникальные capabilities (Cursor умеет запускать terminal-команды)
- Синтаксис конфигурации отличается (Cursor frontmatter vs Claude plain MD)
- Поведение агента фундаментально отличается (Claude лучше в рассуждениях — можно дать ему более сложные conditional rules)

**Золотое правило:** если текст в `claude`, `cursor` и `antigravity` совпадает с `default` — удали platform-specific ключи. Одинаковый текст в четырёх местах = нарушение DRY и wasted tokens.

---

## 7. Размерные ограничения

| Метрика                     | Лимит                     | Обоснование                                                |
| --------------------------- | ------------------------- | ---------------------------------------------------------- |
| Строк markdown              | 5–15 (skills могут до 25) | Компактность, каждая строка = ценный токен                 |
| Пунктов в списке            | 4–8                       | Больше 8 — агент начинает терять фокус на последних        |
| Символов в одном пункте     | до 120                    | Одна мысль = одна строка                                   |
| Code examples внутри пункта | 0–1 inline                | Полные code blocks допустимы в skills для показа паттернов |

---

## 8. Процесс добавления нового сниппета

1. Определи **тип**: agent (skill), rule, workflow, или hook
2. Определи **категорию** или создай новую папку в `public/assets/pages/{тип}/{категория}/`
3. Если новая категория — создай `_meta.json` с `title`, `icon`, `type`, `order`
4. Создай `{id}.json` по JSON-структуре проекта
5. Напиши контент по паттерну из секций 1–5
6. Прогони чек-лист качества (ниже)
7. Запусти `npm run generate:pages` чтобы пересобрать `GENERATED_PAGES_CONFIG`
8. Проверь визуально в UI что сниппет отображается и выбирается
9. Проверь в Review Step что контент попадает в финальный файл агента

---

## 9. Чек-лист качества

### ✅ ДЕЛАЙ

- [ ] **Будь конкретен** — `Use constructor-based DI` вместо `use proper patterns`
- [ ] **Давай testable constraints** — правило должно быть проверяемо: либо код следует ему, либо нет
- [ ] **Показывай формат** — если правило про naming, покажи через backticks: `` `kebab-case` ``, `` `PascalCase` ``
- [ ] **Пиши императивом** — "Use", "Avoid", "Validate", а не "You should consider using"
- [ ] **Умещайся в 4–8 пунктов** — если больше, разбей на два сниппета или используй H3 подсекции
- [ ] **Используй `default` как основу** — platform-specific ключи только при реальных различиях

### ❌ НЕ ДЕЛАЙ

- [ ] **НЕ пиши generic-советы** — `Write clean code`, `Follow best practices` — это шум, LLM и так это "знает"
- [ ] **НЕ пиши абзацы прозы** — используй списки, агент парсит их точнее
- [ ] **НЕ дублируй контент** — если `default` и `claude` одинаковы, удали `claude`
- [ ] **НЕ превышай 15 строк** без подсекций — сигнал к декомпозиции

---

## 10. Эталонные примеры

### Agent Snippet (skill — технология)

```markdown
## Angular Development Standards

- Use **standalone components** exclusively — `NgModules` are prohibited.
- Manage state with **Angular Signals** — never use RxJS `BehaviorSubject` for component state.
- Use `inject()` function for dependency injection — never use constructor-based DI.
- Enforce `ChangeDetectionStrategy.OnPush` on every component.
- Generate all entities via Angular CLI (`ng generate`) — never create component files manually.
- Use `input()`, `output()`, `model()` signal-based APIs instead of `@Input()` / `@Output()` decorators.
- **NEVER** use `ngOnInit` for logic that can be expressed as a `computed()` signal.
```

### Rule Snippet (архитектурное ограничение)

```markdown
## Hexagonal Architecture (Ports & Adapters)

- Organize code into three layers: **Domain**, **Application**, and **Infrastructure**.
- Domain layer **MUST** have zero dependencies on frameworks, databases, or external services.
- Define **Ports** as interfaces in the Domain layer for all external interactions.
- Implement **Adapters** in the Infrastructure layer — they import framework-specific code.
- Application layer orchestrates use-cases via Port interfaces — **NEVER** call Adapters directly.
- **NEVER** import from Infrastructure into Domain — dependency arrows point inward only.
```

### Workflow Snippet (последовательность)

```markdown
## Brainstorm & Solution Exploration

When tackling complex problems:

1. Generate at least 2-3 alternative approaches before committing to one.
2. Evaluate each approach against trade-offs: performance, maintainability, complexity.
3. Consider edge cases and failure modes for each solution.
4. Prefer battle-tested patterns over novel inventions unless there is a clear advantage.
5. Document the reasoning behind the chosen approach for future reference.
```

### Skill с подсекциями (длинный сниппет)

```markdown
## Docker Development Standards

### Image Construction

- Use multi-stage builds to separate build and runtime environments.
- Pin base image versions explicitly (`node:22-alpine`, not `node:latest`).
- **NEVER** run containers as root — always specify `USER` directive.

### Build Context

- Use `.dockerignore` to exclude `node_modules`, `.git`, and build artifacts.
- Prefer `COPY` over `ADD` unless extracting archives.
- Order `Dockerfile` instructions by change frequency — static layers first.

> [!WARNING]
> Never store secrets in environment variables at build time — use runtime injection or secret mounts.
```

---

## Шаблон-скелет

Копируй и заполняй:

```markdown
## [Title — что именно регулирует этот сниппет]

- [Directive или constraint №1]
- [Directive или constraint №2]
- **NEVER** [что запрещено] — [почему или альтернатива].
- **MUST** [что обязательно] — [конкретное действие].
- [Conditional:] When [условие], [действие].
```
