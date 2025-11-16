# Mantine 색상 매핑 (초안)

VS Code 토큰과 기존 Tailwind 기반 테마 토큰을 Mantine 테마에 대응시키기 위한 참고용 매핑입니다. 실제 팔레트 값은 `mantine-theme.ts`에서 관리하며, CSS 변수 매핑은 `styles/vscode-integration.css`에서 처리합니다.

| Existing Token                 | Mantine Target             | 비고                                    |
| ------------------------------ | -------------------------- | --------------------------------------- |
| `--background` / `--foreground`| `--mantine-color-body` / `--mantine-color-text` | VS Code가 제공하는 `--vscode-editor-*` 값으로 우선 덮어씀 |
| `--accent` / `--primary`       | `--mantine-primary-color-filled`              | 버튼/하이라이트 기본 색상               |
| `--muted-foreground`           | `--mantine-color-dimmed`                      | 본문 보조 텍스트                        |
| `--vscode-focusBorder`         | `--mantine-color-anchor`                      | 링크/포커스 색상 공유                   |
| `--vscode-input-background`    | `--mantine-color-default`                     | 입력 배경 및 중립 surface               |
| `--vscode-terminal-ansi*`      | 개별 Mantine 색상 팔레트(추가 예정)            | ANSI 색상은 글로벌 CSS에서 유지         |

- 테마 팔레트: `primary`, `success`, `warning`, `danger`, `info`를 Mantine `colors`로 정의.
- 시스템 테마: `ThemeMode.SYSTEM`일 때 `useComputedColorScheme` 결과를 사용해 라이트/다크를 자동 결정.
- VS Code 확장 스타일 오버라이드: `VIBE_STYLE_OVERRIDE` 메시지로 전달되는 `--vscode-*` 토큰이 있으면 `vscode-integration.css`에서 Mantine CSS 변수로 전달.

추가 매핑이나 팔레트 조정이 필요하면 이 문서를 갱신하고 `mantine-theme.ts`를 함께 업데이트하세요.
