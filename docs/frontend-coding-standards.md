# Frontend Coding Standards

This document outlines the coding standards and best practices for the Vibe Kanban frontend codebase.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Mantine, Radix UI
- **State Management**: Zustand
- **Internationalization**: i18next

## Code Style

### Prettier Configuration

All code must follow the Prettier configuration defined in `frontend/.prettierrc.json`:

```json
{
  "semi": true,              // Semicolons required
  "trailingComma": "es5",    // ES5-style trailing commas
  "singleQuote": true,       // Use single quotes
  "printWidth": 80,          // Max 80 characters per line
  "tabWidth": 2,             // 2 spaces for indentation
  "useTabs": false           // Use spaces, not tabs
}
```

**Examples**:

```typescript
// ✅ Good
const greeting = 'Hello, World!';
const user = { name: 'John', age: 30 };

// ❌ Bad
const greeting = "Hello, World!"
const user = { name: "John", age: 30, }
```

### ESLint Rules

#### Critical Rules (Error Level)

1. **No Unused Imports**
   ```typescript
   // ❌ Bad
   import { useState, useEffect } from 'react'; // useEffect not used

   // ✅ Good
   import { useState } from 'react';
   ```

2. **No Unused Variables**
   ```typescript
   // ❌ Bad
   const Component = () => {
     const unusedVar = 'hello';
     return <div>Hello</div>;
   };

   // ✅ Good
   const Component = () => {
     const greeting = 'hello';
     return <div>{greeting}</div>;
   };
   ```

3. **Switch Exhaustiveness** (`@typescript-eslint/switch-exhaustiveness-check`)
   ```typescript
   type Status = 'pending' | 'completed' | 'failed';

   // ❌ Bad - missing 'failed' case
   const getColor = (status: Status) => {
     switch (status) {
       case 'pending': return 'yellow';
       case 'completed': return 'green';
       // Missing 'failed' case!
     }
   };

   // ✅ Good
   const getColor = (status: Status) => {
     switch (status) {
       case 'pending': return 'yellow';
       case 'completed': return 'green';
       case 'failed': return 'red';
     }
   };
   ```

#### Warning Level Rules

1. **Avoid `any` Type** (`@typescript-eslint/no-explicit-any`)
   ```typescript
   // ⚠️ Warning - avoid when possible
   const processData = (data: any) => { /* ... */ };

   // ✅ Good - use proper types
   interface UserData {
     name: string;
     age: number;
   }
   const processData = (data: UserData) => { /* ... */ };
   ```

### Internationalization (i18n)

**Rule**: No hardcoded strings in JSX markup.

When `LINT_I18N=true` is set, the linter will warn about literal strings in JSX.

```typescript
// ❌ Bad
const Button = () => <button>Click me</button>;

// ✅ Good
import { useTranslation } from 'react-i18next';

const Button = () => {
  const { t } = useTranslation();
  return <button>{t('common.clickMe')}</button>;
};
```

**Exceptions** (these attributes can have literal strings):
- `data-testid`
- `to`, `href`
- `id`, `key`
- `type`, `role`
- `className`, `style`
- `aria-describedby`

## TypeScript Guidelines

### Type Safety

1. **Never modify `shared/types.ts` manually**
   - This file is auto-generated from Rust types
   - Run `npm run generate-types` after backend changes

2. **Enable strict mode**
   - `noEmit` is used for type checking
   - All type errors must be resolved before commit

3. **Prefer interfaces over types for objects**
   ```typescript
   // ✅ Preferred
   interface User {
     name: string;
     email: string;
   }

   // ⚠️ Use for unions/primitives only
   type Status = 'active' | 'inactive';
   ```

## Component Patterns

### File Structure

```
components/
├── TaskCard/
│   ├── TaskCard.tsx       # Main component
│   ├── TaskCardHeader.tsx # Sub-components if needed
│   └── index.ts           # Re-export
```

### Component Template

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TaskCardProps {
  id: string;
  title: string;
  onUpdate?: (id: string) => void;
}

export const TaskCard = ({ id, title, onUpdate }: TaskCardProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onUpdate?.(id);
  };

  return (
    <div className="rounded-lg border p-4">
      <h3>{title}</h3>
      <button onClick={handleClick}>
        {isOpen ? t('common.close') : t('common.open')}
      </button>
    </div>
  );
};
```

### Hooks

- Place custom hooks in `frontend/src/hooks/`
- Prefix with `use`
- Document complex hooks with JSDoc

```typescript
/**
 * Manages Server-Sent Events connection for real-time updates
 * @param url - The SSE endpoint URL
 * @returns Connection state and event data
 */
export const useEventSourceManager = (url: string) => {
  // Implementation
};
```

## Styling

### Tailwind CSS

1. **Use utility classes directly**
   ```tsx
   <div className="flex items-center gap-2 rounded-lg bg-blue-500 p-4">
   ```

2. **Use `tailwind-merge` for conditional classes**
   ```typescript
   import { cn } from '@/lib/utils';

   const className = cn(
     'base-classes',
     isActive && 'active-classes',
     variant === 'primary' && 'primary-classes'
   );
   ```

3. **Follow mobile-first approach**
   ```tsx
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

### shadcn/ui Components

- Use components from `frontend/src/components/ui/`
- Follow shadcn/ui naming conventions
- Don't modify generated components directly

## API Integration

### API Client Pattern

```typescript
// frontend/src/lib/api.ts
export const api = {
  tasks: {
    list: () => fetch('/api/tasks').then(r => r.json()),
    create: (data: CreateTaskData) =>
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
  },
};
```

### React Query Usage

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['tasks', projectId],
  queryFn: () => api.tasks.list(projectId),
});
```

## Testing

### Type Checking

```bash
# Required before commit
npx tsc --noEmit
```

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix

# Check i18n compliance
npm run lint:i18n
```

### Format Checking

```bash
# Check formatting
npm run format:check

# Auto-format
npm run format
```

## Pre-Commit Checklist

Before committing frontend changes:

- [ ] `npm run lint` passes with no errors (warnings ≤ 110)
- [ ] `npm run format:check` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No unused imports or variables
- [ ] All switches are exhaustive
- [ ] No hardcoded strings in JSX (if i18n enabled)
- [ ] Components follow established patterns

## Common Pitfalls

### ❌ Don't

- Modify `shared/types.ts` manually
- Use `any` type unless absolutely necessary
- Hardcode strings in JSX components
- Ignore ESLint warnings
- Commit code that doesn't pass type checking
- Use inline styles (use Tailwind instead)

### ✅ Do

- Run `npm run generate-types` after backend changes
- Use proper TypeScript types
- Use i18n for all user-facing text
- Fix all linting errors before committing
- Follow existing component patterns
- Use Tailwind utility classes

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [i18next](https://www.i18next.com/)
