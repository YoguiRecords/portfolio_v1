## Principles

**S — Single Responsibility**
Each class/module has one reason to change.
Violation sign: class name contains "And" or "Or", or has unrelated methods.

**O — Open/Closed**
Open for extension, closed for modification.
Add behavior through new classes/functions, not by editing existing ones.
Use: interfaces, abstract classes, composition.

**L — Liskov Substitution**
Subtypes must be substitutable for their base types without breaking behavior.
Violation: overriding a method to throw NotImplementedException.

**I — Interface Segregation**
Clients should not depend on interfaces they do not use.
Prefer multiple focused interfaces over one large interface.

**D — Dependency Inversion**
High-level modules must not depend on low-level modules. Both depend on abstractions.
Concrete implementations are injected, not instantiated directly.

## DRY — Do Not Repeat Yourself
Every piece of knowledge must have a single authoritative representation.
Violation: copy-pasted code blocks. Fix: extract to a shared function/class.

## KISS — Keep It Simple
Prefer the simplest solution that works.
Avoid premature abstraction. Three similar lines are better than a wrong abstraction.

## YAGNI — You Are Not Gonna Need It
Do not implement features until they are actually needed.
Violation: adding configurability or extensibility for hypothetical future requirements.

## Forbidden
- FORBIDDEN: violating any SOLID principle without documented justification.
- FORBIDDEN: adding abstractions for a single implementation (violates YAGNI).
- FORBIDDEN: applying DRY to incidentally similar code — abstract only true knowledge duplication.
