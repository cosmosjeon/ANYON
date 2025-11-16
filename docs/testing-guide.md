# Testing Guide

This document describes testing practices and strategies for Vibe Kanban.

## Testing Philosophy

Vibe Kanban uses a pragmatic testing approach:

- **Backend**: Comprehensive unit and integration tests
- **Frontend**: Compile-time type safety + linting (no runtime tests currently)
- **CI/CD**: Automated checks on every PR

## Backend Testing (Rust)

### Test Organization

Tests are organized in two locations:

1. **Inline Unit Tests**: Within source files using `#[cfg(test)]` modules
2. **Integration Tests**: In `tests/` directories within each crate

### Running Tests

```bash
# Run all tests
cargo test --workspace

# Run tests for specific crate
cargo test -p services
cargo test -p db

# Run specific test
cargo test test_name

# Run with output
cargo test --workspace -- --nocapture

# Run tests matching pattern
cargo test git_workflow
```

### Test Structure

#### Unit Tests (Inline)

Located in the same file as the code being tested:

```rust
// crates/utils/src/git.rs

pub fn is_valid_branch_prefix(prefix: &str) -> bool {
    prefix.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_prefixes() {
        assert!(is_valid_branch_prefix("vk"));
        assert!(is_valid_branch_prefix("feature"));
        assert!(is_valid_branch_prefix("bug-fix"));
    }

    #[test]
    fn test_invalid_prefixes() {
        assert!(!is_valid_branch_prefix("feat/ure"));
        assert!(!is_valid_branch_prefix("bug fix"));
    }
}
```

**When to use**:
- Testing pure functions
- Testing utility functions
- Testing business logic without external dependencies

#### Integration Tests

Located in `crates/*/tests/`:

```rust
// crates/services/tests/git_workflow.rs

use services::services::git::GitService;
use tempfile::TempDir;

#[tokio::test]
async fn test_create_and_checkout_branch() {
    // Setup
    let temp_dir = TempDir::new().unwrap();
    let git_service = GitService::new(temp_dir.path());

    // Execute
    git_service.init().await.unwrap();
    git_service.create_branch("feature/test").await.unwrap();
    git_service.checkout("feature/test").await.unwrap();

    // Verify
    let current_branch = git_service.current_branch().await.unwrap();
    assert_eq!(current_branch, "feature/test");
}
```

**When to use**:
- Testing interactions between multiple components
- Testing database operations
- Testing file system operations
- Testing git operations

### Async Testing

Use `#[tokio::test]` for async tests:

```rust
#[tokio::test]
async fn test_async_function() {
    let result = fetch_data().await.unwrap();
    assert!(!result.is_empty());
}
```

### Testing Patterns

#### 1. Arrange-Act-Assert (AAA)

```rust
#[tokio::test]
async fn test_task_creation() {
    // Arrange
    let pool = create_test_db().await;
    let service = TaskService::new(pool);

    // Act
    let task = service.create_task("Test task").await.unwrap();

    // Assert
    assert_eq!(task.title, "Test task");
    assert_eq!(task.status, TaskStatus::Pending);
}
```

#### 2. Using Temporary Directories

```rust
use tempfile::TempDir;

#[test]
fn test_with_temp_dir() {
    let temp_dir = TempDir::new().unwrap();
    let path = temp_dir.path();

    // Use path for testing
    create_file(path.join("test.txt")).unwrap();

    assert!(path.join("test.txt").exists());

    // temp_dir is automatically cleaned up when dropped
}
```

#### 3. Testing Errors

```rust
#[tokio::test]
async fn test_task_not_found() {
    let pool = create_test_db().await;
    let service = TaskService::new(pool);

    let result = service.get_task(999).await;

    assert!(result.is_err());
    assert!(matches!(result.unwrap_err(), ServiceError::NotFound));
}
```

#### 4. Using Test Fixtures

```rust
#[cfg(test)]
mod tests {
    use super::*;

    async fn create_test_db() -> SqlitePool {
        let pool = SqlitePool::connect(":memory:").await.unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        pool
    }

    fn create_test_task() -> Task {
        Task {
            id: 1,
            title: "Test task".to_string(),
            status: TaskStatus::Pending,
        }
    }

    #[tokio::test]
    async fn test_with_fixtures() {
        let pool = create_test_db().await;
        let task = create_test_task();
        // Test code
    }
}
```

### Current Test Coverage

#### Integration Tests (55 tests)

**Git Operations Safety** (`git_ops_safety.rs` - 29 tests):
- Push/fetch operations
- Conflict handling (binary, rename, modify)
- Fast-forward rejection
- Merge with dirty state
- Worktree-to-worktree operations

**Git Workflow** (`git_workflow.rs` - 26 tests):
- Rebase operations
- Merge operations
- Branch management
- Sparse checkout
- Diff calculations
- Commit operations

**Filesystem** (`filesystem_repo_discovery.rs` - 5 tests):
- Repository discovery
- Skip directories (node_modules, target, build)
- Empty directory handling
- Max depth limits

#### Unit Tests (~98 tests)

Distributed across:
- `utils/src/git.rs` - Git utilities
- `utils/src/path.rs` - Path normalization
- `services/src/services/git.rs` - Git service
- `services/src/services/approvals.rs` - Approval logic
- `executors/src/executors/claude.rs` - Claude executor
- And more...

### Testing Database Code

#### In-Memory SQLite

```rust
use sqlx::sqlite::SqlitePoolOptions;

async fn create_test_pool() -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .connect(":memory:")
        .await
        .unwrap();

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .unwrap();

    pool
}

#[tokio::test]
async fn test_create_task() {
    let pool = create_test_pool().await;
    let repo = TaskRepository::new(pool);

    let task = repo.create("Test".to_string()).await.unwrap();

    assert_eq!(task.title, "Test");
}
```

#### Testing Queries

```rust
#[tokio::test]
async fn test_find_tasks_by_status() {
    let pool = create_test_pool().await;
    let repo = TaskRepository::new(pool.clone());

    // Insert test data
    repo.create("Task 1".to_string()).await.unwrap();
    repo.create("Task 2".to_string()).await.unwrap();

    // Query
    let tasks = repo.find_by_status(TaskStatus::Pending).await.unwrap();

    // Verify
    assert_eq!(tasks.len(), 2);
}
```

### Testing Git Operations

```rust
use git2::Repository;
use tempfile::TempDir;

#[test]
fn test_init_repository() {
    let temp_dir = TempDir::new().unwrap();
    let path = temp_dir.path();

    let repo = Repository::init(path).unwrap();

    assert!(!repo.is_bare());
    assert!(path.join(".git").exists());
}

#[tokio::test]
async fn test_create_commit() {
    let temp_dir = TempDir::new().unwrap();
    let git = GitService::new(temp_dir.path());

    git.init().await.unwrap();
    git.create_file("test.txt", "content").await.unwrap();
    git.commit("Initial commit").await.unwrap();

    let commits = git.list_commits().await.unwrap();
    assert_eq!(commits.len(), 1);
}
```

### Test Helpers

Common test utilities in `#[cfg(test)]` modules:

```rust
#[cfg(test)]
mod test_helpers {
    use super::*;

    /// Create a git repository with initial commit
    pub async fn create_test_repo(path: &Path) -> Repository {
        let repo = Repository::init(path).unwrap();

        // Create initial commit
        let tree_id = {
            let mut index = repo.index().unwrap();
            index.write_tree().unwrap()
        };

        let tree = repo.find_tree(tree_id).unwrap();
        let sig = repo.signature().unwrap();

        repo.commit(
            Some("HEAD"),
            &sig,
            &sig,
            "Initial commit",
            &tree,
            &[],
        ).unwrap();

        repo
    }

    /// Create directory structure for testing
    pub fn create_dir_structure(base: &Path, structure: &[&str]) {
        for path in structure {
            let full_path = base.join(path);
            if path.ends_with('/') {
                std::fs::create_dir_all(&full_path).unwrap();
            } else {
                if let Some(parent) = full_path.parent() {
                    std::fs::create_dir_all(parent).unwrap();
                }
                std::fs::write(&full_path, "test content").unwrap();
            }
        }
    }
}
```

## Frontend Testing

### Current Approach

The frontend currently uses **compile-time testing** instead of runtime tests:

#### 1. TypeScript Type Checking

```bash
npx tsc --noEmit
```

This catches:
- Type errors
- Missing properties
- Invalid function calls
- Incorrect prop types

**Example**:
```typescript
// This will fail type checking:
const task: Task = {
  id: 1,
  title: "Test",
  // Error: missing required property 'status'
};

// This is correct:
const task: Task = {
  id: 1,
  title: "Test",
  status: TaskStatus.Pending,
};
```

#### 2. ESLint Validation

```bash
npm run lint
```

This catches:
- Unused imports/variables
- Missing exhaustiveness in switches
- Potential bugs
- Code style issues

**Example**:
```typescript
// ❌ ESLint error: unused import
import { useState, useEffect } from 'react'; // useEffect not used

// ❌ ESLint error: non-exhaustive switch
type Status = 'pending' | 'completed' | 'failed';
const getColor = (status: Status) => {
  switch (status) {
    case 'pending': return 'yellow';
    case 'completed': return 'green';
    // Missing 'failed' case!
  }
};
```

#### 3. Build Validation

```bash
npm run build
```

This ensures:
- Code compiles successfully
- No circular dependencies
- All imports resolve correctly

### Frontend Testing Strategy

**Type-Driven Development**:

1. Backend defines types (Rust structs)
2. Types auto-generate to TypeScript
3. Frontend uses these types
4. TypeScript compiler validates correctness

**Benefits**:
- Catches errors at compile time
- No runtime test maintenance
- Type safety guaranteed

**Limitations**:
- No runtime behavior testing
- No component interaction testing
- No visual regression testing

### Future: Adding Runtime Tests

If runtime tests are needed in the future:

```bash
# Vitest is already in devDependencies
npm run test
```

**Example test** (not currently implemented):

```typescript
// frontend/src/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      status: 'pending' as const,
    };

    render(<TaskCard task={task} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

## CI/CD Testing

### GitHub Actions Workflow

Located in `.github/workflows/test.yml`

**Triggers**:
- Pull requests to `main`, `louis/fe-revision`, `gabriel/share`
- Manual workflow dispatch

**Frontend Checks**:
```yaml
- ESLint linting
- i18n regression check
- Prettier format check
- TypeScript type check
- Production build
```

**Backend Checks**:
```yaml
- Rust formatting (cargo fmt)
- Type generation verification
- All tests (cargo test --workspace)
- Clippy linting (-D warnings)
```

### Running CI Locally

```bash
# Simulate full CI check
npm run check

# This runs:
# - Frontend: lint, format check, type check
# - Backend: compilation check
```

**Full local CI simulation**:

```bash
# Frontend
cd frontend && npm run lint
cd frontend && npm run format:check
cd frontend && npx tsc --noEmit
cd frontend && npm run build

# Backend
cargo fmt --all -- --check
npm run generate-types:check
cargo test --workspace
cargo clippy --all --all-targets --all-features -- -D warnings
```

## Testing Checklist

### Before Committing

- [ ] All backend tests pass: `cargo test --workspace`
- [ ] No Clippy warnings: `cargo clippy --all --all-targets --all-features -- -D warnings`
- [ ] Code is formatted: `cargo fmt --all -- --check`
- [ ] Types are synced: `npm run generate-types:check`
- [ ] Frontend lints: `cd frontend && npm run lint`
- [ ] Frontend types: `cd frontend && npx tsc --noEmit`

### When Adding New Features

**Backend**:
- [ ] Add unit tests for new functions
- [ ] Add integration tests for new workflows
- [ ] Test error cases
- [ ] Test edge cases

**Frontend**:
- [ ] TypeScript types are correct
- [ ] No ESLint warnings
- [ ] Component follows existing patterns

### When Fixing Bugs

**Backend**:
- [ ] Add regression test that fails before fix
- [ ] Verify test passes after fix
- [ ] Test related functionality still works

**Frontend**:
- [ ] TypeScript types prevent the bug
- [ ] ESLint catches similar issues

## Test Maintenance

### Keeping Tests Fast

```bash
# Run only affected tests
cargo test -p services -- test_name

# Run tests in parallel (default)
cargo test --workspace

# Use cargo-nextest for faster test execution
cargo install cargo-nextest
cargo nextest run
```

### Debugging Tests

```bash
# Show println! output
cargo test -- --nocapture

# Run single test with output
cargo test test_name -- --nocapture --test-threads=1

# Show all logs
RUST_LOG=debug cargo test -- --nocapture
```

### Cleaning Test Data

Tests use `TempDir` which auto-cleans:

```rust
#[test]
fn test_cleanup() {
    let temp_dir = TempDir::new().unwrap();
    // Use temp_dir
    // Automatically cleaned when temp_dir is dropped
}
```

## Best Practices

### ✅ Do

- Write tests for new features
- Use `tempfile` for file system tests
- Use `:memory:` SQLite for database tests
- Test error cases, not just happy paths
- Use descriptive test names
- Keep tests isolated (no shared state)
- Run tests before committing

### ❌ Don't

- Skip writing tests for critical code
- Use real file system paths in tests
- Share state between tests
- Ignore failing tests
- Commit code that doesn't pass tests
- Test implementation details

## Resources

- [Rust Testing Guide](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [Tokio Testing](https://tokio.rs/tokio/topics/testing)
- [SQLx Testing](https://github.com/launchbadge/sqlx/blob/main/FAQ.md#how-can-i-do-testing)
- [TypeScript Testing Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
