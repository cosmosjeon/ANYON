# Development Workflow

This document describes the complete development workflow for contributing to Vibe Kanban.

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd vibe-kanban

# Install dependencies
pnpm install

# Start development servers
pnpm run dev
```

## Development Environment Setup

### Prerequisites

- **Node.js**: >= 18
- **pnpm**: >= 8 (v10.13.1 recommended)
- **Rust**: nightly-2025-05-18
- **SQLite**: For database

### Initial Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Prepare database** (auto-runs on dev server start):
   ```bash
   npm run prepare-db
   ```

3. **Verify setup**:
   ```bash
   npm run check
   ```

## Development Servers

### Start All Servers (Recommended)

```bash
pnpm run dev
```

This starts:
- Frontend dev server on port 3000 (or `$FRONTEND_PORT`)
- Backend dev server with auto-reload
- Hot module replacement (HMR) enabled

### Start Individual Servers

```bash
# Frontend only
npm run frontend:dev

# Backend only
npm run backend:dev
```

### Environment Variables

**Frontend**:
- `FRONTEND_PORT`: Dev server port (default: 3000)
- `VITE_OPEN`: Auto-open browser (default: false)

**Backend**:
- `BACKEND_PORT`: Backend server port (default: auto-assigned)
- `HOST`: Server host (default: 127.0.0.1)
- `DISABLE_WORKTREE_ORPHAN_CLEANUP`: Debug flag for worktrees
- `RUST_LOG`: Logging level (default: debug in dev)

## Development Workflow Rules

### 🔴 Critical Rule: Backend First

**Always modify backend before frontend when both are affected.**

**Why?** TypeScript types are auto-generated from Rust structs. Frontend code depends on these types.

**Workflow**:
```
1. Modify Rust types/API
2. Run npm run generate-types
3. Modify frontend code using new types
```

### Example Workflow

```bash
# 1. Add new field to Rust struct
# crates/db/src/models/task.rs
#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Task {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,  // ← New field
}

# 2. Generate TypeScript types
npm run generate-types

# 3. Now frontend has updated Task type
# frontend/src/components/TaskCard.tsx
const TaskCard = ({ task }: { task: Task }) => {
  return <div>{task.description}</div>  // ← TypeScript knows about this
}
```

## Making Changes

### Backend Changes

#### 1. Modify Rust Code

```bash
# Make changes to files in crates/
vim crates/services/src/services/git.rs
```

#### 2. Check Formatting

```bash
cargo fmt --all
```

#### 3. Run Linter

```bash
cargo clippy --all --all-targets --all-features -- -D warnings
```

#### 4. Run Tests

```bash
cargo test --workspace
```

#### 5. If Types Changed, Regenerate

```bash
npm run generate-types
```

### Frontend Changes

#### 1. Modify TypeScript/React Code

```bash
vim frontend/src/components/TaskCard.tsx
```

#### 2. Check Types

```bash
cd frontend && npx tsc --noEmit
```

#### 3. Run Linter

```bash
cd frontend && npm run lint
```

#### 4. Check Formatting

```bash
cd frontend && npm run format:check
```

#### 5. Auto-fix (optional)

```bash
cd frontend && npm run lint:fix
cd frontend && npm run format
```

### Database Changes

#### 1. Create Migration

```bash
sqlx migrate add <migration_name>
```

Example:
```bash
sqlx migrate add add_description_to_tasks
```

This creates:
```
crates/db/migrations/YYYYMMDDHHMMSS_add_description_to_tasks.sql
```

#### 2. Write Migration

```sql
-- Add description column to tasks table
ALTER TABLE tasks ADD COLUMN description TEXT;
```

#### 3. Apply Migration

```bash
sqlx migrate run
```

#### 4. Update Models

Update Rust structs in `crates/db/src/models/` to match new schema.

#### 5. Regenerate Types

```bash
npm run generate-types
```

## Type Generation

### When to Run

Run `npm run generate-types` after:
- Adding/modifying `#[derive(TS)]` structs
- Adding/modifying `#[ts(export)]` attributes
- Changing any type that frontend uses

### Verification

```bash
# Check if types are in sync
npm run generate-types:check
```

This command:
- Regenerates types
- Compares with existing `shared/types.ts`
- Fails if there are differences

**CI will fail if types are out of sync!**

### Important Rules

1. **Never manually edit** `shared/types.ts`
2. **Always commit** type changes with Rust changes
3. **Run check** before creating PR

## Git Workflow

### Branch Naming

```bash
# Feature branches
git checkout -b feature/task-description

# Bug fixes
git checkout -b fix/bug-description

# Vibe Kanban automated branches
# Format: vk-{task-id}-{description}
# Example: vk-123-add-user-auth
```

### Commit Messages

Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Add description field to Task model"
git commit -m "Fix task deletion bug in TaskCard component"
git commit -m "Refactor git service to use async/await"

# ❌ Bad
git commit -m "fix"
git commit -m "update"
git commit -m "wip"
```

### Before Committing

**Run the complete check**:

```bash
npm run check
```

This runs:
- Frontend type checking
- Frontend linting
- Backend compilation check

**Or run individually**:

```bash
# Frontend
cd frontend && npm run check
cd frontend && npm run lint
cd frontend && npm run format:check

# Backend
cargo fmt --all -- --check
cargo clippy --all --all-targets --all-features -- -D warnings
cargo test --workspace
npm run generate-types:check
```

## Pull Request Workflow

### 1. Create Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Follow the workflow described above.

### 3. Commit Changes

```bash
git add .
git commit -m "Descriptive message"
```

### 4. Push Branch

```bash
git push -u origin feature/my-feature
```

### 5. Create Pull Request

- Go to GitHub repository
- Click "New Pull Request"
- Select your branch
- Fill in PR description

### 6. CI Checks

CI will automatically run:

1. **Frontend Checks**:
   - ESLint linting
   - i18n regression check
   - Prettier format check
   - TypeScript type check
   - Production build

2. **Backend Checks**:
   - Rust formatting check
   - Type generation verification
   - All tests (`cargo test --workspace`)
   - Clippy linting (with `-D warnings`)

**All checks must pass before merge!**

### 7. Address Review Feedback

```bash
# Make changes
git add .
git commit -m "Address review feedback"
git push
```

## Common Workflows

### Adding a New API Endpoint

```bash
# 1. Define request/response types in Rust
# crates/db/src/models/task.rs
#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateTaskRequest {
    pub title: String,
}

# 2. Add endpoint in server
# crates/server/src/routes/tasks.rs
async fn create_task(
    State(state): State<AppState>,
    Json(req): Json<CreateTaskRequest>,
) -> Result<Json<Task>, AppError> {
    // Implementation
}

# 3. Generate types
npm run generate-types

# 4. Add API call in frontend
# frontend/src/lib/api.ts
export const createTask = (data: CreateTaskRequest) =>
  fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

# 5. Use in component
# frontend/src/components/CreateTaskForm.tsx
const handleSubmit = async () => {
  await createTask({ title: 'New task' });
};
```

### Adding a New Component

```bash
# 1. Create component file
mkdir frontend/src/components/TaskList
touch frontend/src/components/TaskList/TaskList.tsx
touch frontend/src/components/TaskList/index.ts

# 2. Implement component
# TaskList.tsx
import { Task } from '@/shared/types';

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};

# 3. Export from index
# index.ts
export { TaskList } from './TaskList';

# 4. Use in parent component
import { TaskList } from '@/components/TaskList';
```

### Adding a New Database Table

```bash
# 1. Create migration
sqlx migrate add create_projects_table

# 2. Write migration SQL
# crates/db/migrations/YYYYMMDDHHMMSS_create_projects_table.sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

# 3. Apply migration
sqlx migrate run

# 4. Create model
# crates/db/src/models/project.rs
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Project {
    pub id: i64,
    pub name: String,
}

impl Project {
    pub async fn create(pool: &SqlitePool, name: String) -> Result<Self> {
        // SQLx query
    }
}

# 5. Generate types
npm run generate-types
```

## Troubleshooting

### Type Generation Issues

**Problem**: `npm run generate-types:check` fails

**Solution**:
```bash
# Regenerate types
npm run generate-types

# Commit the changes
git add shared/types.ts
git commit -m "Update generated types"
```

### Clippy Warnings

**Problem**: Clippy warnings blocking commit

**Solution**:
```bash
# See all warnings
cargo clippy --all --all-targets --all-features

# Fix them one by one
# Some can be auto-fixed:
cargo clippy --all --all-targets --all-features --fix
```

### Database Issues

**Problem**: Database schema out of sync

**Solution**:
```bash
# Reset database (dev only!)
rm -f vibe-kanban.db
npm run prepare-db
```

### Port Conflicts

**Problem**: Port 3000 already in use

**Solution**:
```bash
# Use different port
FRONTEND_PORT=3001 pnpm run dev
```

## Performance Tips

### Faster Rust Compilation

```bash
# Use cargo-watch for auto-recompile
npm run backend:dev:watch

# Or install cargo-watch separately
cargo install cargo-watch
cargo watch -x 'run --bin server'
```

### Faster Type Checking

```bash
# Frontend type checking is fast
cd frontend && npx tsc --noEmit

# Don't rebuild everything
```

## Resources

- **CLAUDE.md**: AI coding assistant guide
- **docs/frontend-coding-standards.md**: Frontend style guide
- **docs/backend-coding-standards.md**: Backend style guide
- **docs/testing-guide.md**: Testing practices
