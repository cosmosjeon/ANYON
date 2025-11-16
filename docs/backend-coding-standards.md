# Backend Coding Standards

This document outlines the coding standards and best practices for the Vibe Kanban backend codebase.

## Tech Stack

- **Language**: Rust (nightly-2025-05-18)
- **Web Framework**: Axum
- **Async Runtime**: Tokio
- **Database**: SQLite with SQLx
- **Type Generation**: ts-rs (Rust → TypeScript)

## Project Structure

```
crates/
├── server/              # Axum HTTP server, API routes, MCP server
├── db/                  # Database models, migrations, SQLx queries
├── executors/           # AI coding agent integrations
├── services/            # Business logic, GitHub, auth, git operations
├── local-deployment/    # Local deployment logic
└── utils/               # Shared utilities
```

## Code Style

### rustfmt Configuration

All Rust code must follow the rustfmt configuration in `rustfmt.toml`:

```toml
reorder_imports = true              # Automatically reorder imports
group_imports = "StdExternalCrate"  # Group: std → external → internal
imports_granularity = "Crate"       # Group imports by crate
```

**Import Order Example**:

```rust
// ✅ Good - std first, then external, then internal
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::Result;
use axum::Router;
use serde::{Deserialize, Serialize};

use crate::models::Task;
use crate::services::GitService;
```

### Format Checking

```bash
# Check formatting
cargo fmt --all -- --check

# Auto-format
cargo fmt --all
```

## Clippy Linting

### Zero Warnings Policy

All Clippy warnings are treated as errors in CI:

```bash
cargo clippy --all --all-targets --all-features -- -D warnings
```

**This means**:
- Every warning must be fixed
- No exceptions
- CI will fail on any warning

### Common Clippy Fixes

```rust
// ❌ Bad - unnecessary clone
let s = String::from("hello");
let t = s.clone();
println!("{}", s); // s is not used after

// ✅ Good - no clone needed
let s = String::from("hello");
let t = s;

// ❌ Bad - unnecessary borrowing
fn process(s: &String) { }

// ✅ Good - use &str
fn process(s: &str) { }

// ❌ Bad - manual unwrap_or
let value = match option {
    Some(v) => v,
    None => default,
};

// ✅ Good - use unwrap_or
let value = option.unwrap_or(default);
```

## Type Generation with ts-rs

### Adding TypeScript Exports

When creating types that need to be shared with the frontend:

```rust
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]  // This exports to TypeScript
pub struct Task {
    pub id: i64,
    pub title: String,
    pub status: TaskStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
}
```

### Important Rules

1. **Never modify `shared/types.ts` manually** - it's auto-generated
2. **Always run type generation after modifying exported types**:
   ```bash
   npm run generate-types
   ```
3. **Verify types are in sync before committing**:
   ```bash
   npm run generate-types:check
   ```

## Database Patterns

### Location Rules

- **All database models**: `crates/db/src/models/`
- **All migrations**: `crates/db/migrations/`
- **All SQLx queries**: Within model files

### Query Pattern

```rust
use sqlx::SqlitePool;
use anyhow::Result;

pub struct TaskRepository {
    pool: SqlitePool,
}

impl TaskRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, title: String) -> Result<Task> {
        let task = sqlx::query_as!(
            Task,
            r#"
            INSERT INTO tasks (title, status)
            VALUES (?, ?)
            RETURNING id, title, status as "status: TaskStatus"
            "#,
            title,
            TaskStatus::Pending
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(task)
    }

    pub async fn find_by_id(&self, id: i64) -> Result<Option<Task>> {
        let task = sqlx::query_as!(
            Task,
            r#"
            SELECT id, title, status as "status: TaskStatus"
            FROM tasks
            WHERE id = ?
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(task)
    }
}
```

### Migration Pattern

Create migrations in `crates/db/migrations/`:

```bash
# Create new migration
sqlx migrate add create_tasks_table
```

Example migration (`YYYYMMDDHHMMSS_create_tasks_table.sql`):

```sql
-- Create tasks table
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_status ON tasks(status);
```

Apply migrations:

```bash
sqlx migrate run
```

## Error Handling

### Use `anyhow` for Application Errors

```rust
use anyhow::{Context, Result};

pub async fn process_task(id: i64) -> Result<Task> {
    let task = find_task(id)
        .await
        .context("Failed to find task")?;

    validate_task(&task)
        .context("Task validation failed")?;

    Ok(task)
}
```

### Use `thiserror` for Library Errors

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GitError {
    #[error("Repository not found: {0}")]
    RepoNotFound(String),

    #[error("Branch {0} does not exist")]
    BranchNotFound(String),

    #[error("Git operation failed: {0}")]
    OperationFailed(#[from] git2::Error),
}
```

## Async Patterns

### Use Tokio Runtime

All async code uses Tokio:

```rust
#[tokio::main]
async fn main() -> Result<()> {
    // Application code
    Ok(())
}

#[tokio::test]
async fn test_async_function() {
    // Test code
}
```

### Avoid Blocking Operations

```rust
// ❌ Bad - blocks the async runtime
std::fs::read_to_string("file.txt")?;

// ✅ Good - use tokio::fs
tokio::fs::read_to_string("file.txt").await?;

// ❌ Bad - blocking in async context
std::thread::sleep(Duration::from_secs(1));

// ✅ Good - async sleep
tokio::time::sleep(Duration::from_secs(1)).await;
```

## API Endpoint Patterns

### Axum Router Structure

```rust
use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/api/tasks", get(list_tasks).post(create_task))
        .route("/api/tasks/:id", get(get_task).put(update_task))
        .with_state(state)
}

#[derive(Deserialize)]
struct CreateTaskRequest {
    title: String,
}

async fn create_task(
    State(state): State<AppState>,
    Json(req): Json<CreateTaskRequest>,
) -> Result<Json<Task>, AppError> {
    let task = state.db.tasks.create(req.title).await?;
    Ok(Json(task))
}

async fn get_task(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Task>, AppError> {
    let task = state.db.tasks
        .find_by_id(id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(task))
}
```

### Error Response Pattern

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub enum AppError {
    NotFound,
    DatabaseError(sqlx::Error),
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "Resource not found"),
            AppError::DatabaseError(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Database error"),
            AppError::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal error"),
        };

        (status, message).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::DatabaseError(err)
    }
}
```

## Testing

### Test Organization

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_synchronous_function() {
        assert_eq!(add(2, 2), 4);
    }

    #[tokio::test]
    async fn test_async_function() {
        let result = fetch_data().await.unwrap();
        assert!(!result.is_empty());
    }
}
```

### Integration Tests

Place integration tests in `crates/*/tests/`:

```rust
// crates/services/tests/git_workflow.rs
use tempfile::TempDir;
use services::services::git::GitService;

#[tokio::test]
async fn test_create_branch() {
    let temp_dir = TempDir::new().unwrap();
    let git_service = GitService::new(temp_dir.path());

    git_service.create_branch("feature/test").await.unwrap();

    let branches = git_service.list_branches().await.unwrap();
    assert!(branches.contains(&"feature/test".to_string()));
}
```

### Test Helpers

Use `tempfile` for temporary directories in tests:

```rust
use tempfile::TempDir;

#[tokio::test]
async fn test_with_temp_dir() {
    let temp_dir = TempDir::new().unwrap();
    let path = temp_dir.path();

    // Test code using temp_dir
    // Directory is automatically cleaned up when temp_dir is dropped
}
```

## Service Layer Patterns

### Service Structure

```rust
use std::sync::Arc;
use sqlx::SqlitePool;

pub struct TaskService {
    db: Arc<TaskRepository>,
    git: Arc<GitService>,
}

impl TaskService {
    pub fn new(pool: SqlitePool, git: Arc<GitService>) -> Self {
        Self {
            db: Arc::new(TaskRepository::new(pool)),
            git,
        }
    }

    pub async fn create_task_with_branch(&self, title: String) -> Result<Task> {
        // Create task in database
        let task = self.db.create(title.clone()).await?;

        // Create git branch
        let branch_name = format!("task/{}", task.id);
        self.git.create_branch(&branch_name).await?;

        Ok(task)
    }
}
```

## Common Patterns

### Option and Result Handling

```rust
// ❌ Bad - manual matching
let value = match option {
    Some(v) => v,
    None => return Err(anyhow!("Missing value")),
};

// ✅ Good - use ok_or
let value = option.ok_or_else(|| anyhow!("Missing value"))?;

// ❌ Bad - nested matching
let result = match get_user() {
    Ok(user) => match user.email {
        Some(email) => email,
        None => return Err(anyhow!("No email")),
    },
    Err(e) => return Err(e),
};

// ✅ Good - use ? and ok_or
let email = get_user()?.email.ok_or_else(|| anyhow!("No email"))?;
```

### String Handling

```rust
// ❌ Bad - unnecessary String allocation
fn get_name() -> String {
    "John".to_string()
}

// ✅ Good - return &str for constants
fn get_name() -> &'static str {
    "John"
}

// ❌ Bad - String in function signature
fn process(name: String) { }

// ✅ Good - accept &str for flexibility
fn process(name: &str) { }
// Can now be called with both String and &str
```

## Pre-Commit Checklist

Before committing backend changes:

- [ ] `cargo fmt --all -- --check` passes
- [ ] `cargo clippy --all --all-targets --all-features -- -D warnings` passes
- [ ] `cargo test --workspace` passes
- [ ] `npm run generate-types:check` passes (if types changed)
- [ ] Database migrations are properly named and tested
- [ ] All async operations use `tokio` properly
- [ ] No blocking operations in async contexts

## Common Pitfalls

### ❌ Don't

- Ignore Clippy warnings (they're errors in CI)
- Forget to run `npm run generate-types` after type changes
- Use blocking I/O in async functions
- Manually edit auto-generated TypeScript types
- Put database queries outside `crates/db/src/models/`
- Use `unwrap()` or `expect()` in production code

### ✅ Do

- Fix all Clippy warnings immediately
- Run type generation after modifying exported types
- Use `tokio::fs` and `tokio::time` in async code
- Use `anyhow::Result` with `.context()` for errors
- Keep all database logic in model files
- Use proper error handling with `?` operator

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [Axum Documentation](https://docs.rs/axum/)
- [SQLx Guide](https://github.com/launchbadge/sqlx)
- [ts-rs Documentation](https://docs.rs/ts-rs/)
