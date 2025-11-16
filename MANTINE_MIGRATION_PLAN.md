# Mantine 마이그레이션 계획서
- https://mantine.dev/
## 📌 핵심 결정사항

### 1. 마이그레이션 전략
- **방식**: 점진적 마이그레이션 (Incremental Migration)
- **이유**: 프로덕션 안정성 유지, 롤백 용이성
- **기간**: 3-4주 예상

### 2. 스타일링 시스템
- **Tailwind CSS**: 완전 제거 (마이그레이션 완료 후)
- **Mantine 스타일링**: CSS Modules + `sx` prop 혼합 사용
  - 반복적인 스타일: CSS Modules
  - 동적/일회성 스타일: `sx` prop
- **글로벌 스타일**: Mantine의 Global Styles + PostCSS

### 3. Mantine 버전 및 패키지
- **Core 버전**: Mantine v7 (최신 안정 버전)
- **설치할 패키지**:
  ```json
  {
    "@mantine/core": "^7.x",
    "@mantine/hooks": "^7.x",
    "@mantine/form": "^7.x",
    "@mantine/notifications": "^7.x",
    "@mantine/modals": "^7.x",
    "@mantine/dropzone": "^7.x",
    "@mantine/carousel": "^7.x",
    "@mantine/dates": "^7.x",
    "dayjs": "^1.11.x",
    "@emotion/react": "^11.x",
    "postcss": "^8.x",
    "postcss-preset-mantine": "^1.x",
    "postcss-simple-vars": "^7.x"
  }
  ```

### 4. 제거할 의존성
```json
{
  "제거 대상": [
    "@radix-ui/react-*",
    "@rjsf/shadcn",
    "tailwindcss",
    "tailwindcss-animate",
    "@tailwindcss/typography",
    "@tailwindcss/container-queries",
    "class-variance-authority",
    "tailwind-merge"
  ],
  "유지할 의존성": [
    "framer-motion",
    "@dnd-kit/*",
    "react-router-dom",
    "@tanstack/react-query",
    "zustand",
    "@uiw/react-codemirror",
    "lexical",
    "@lexical/*"
  ]
}
```

### 5. 테마 시스템 설계
- **다크 모드**: Mantine의 `colorScheme` 사용
- **VS Code 통합**: CSS 변수 오버라이드 방식 유지
- **테마 전환**: `useMantineColorScheme` 훅 사용
- **커스텀 색상**: 현재 색상 팔레트를 Mantine 형식으로 변환

### 6. Provider 통합 원칙
- **MantineProvider 위치**: 기존 `frontend/src/App.tsx`의 `ThemeProvider` 내부로 주입해 QueryClientProvider, PostHogProvider, Sentry ErrorBoundary, NiceModal 등록 순서를 변경하지 않음
- **ThemeProvider 유지**: `useTheme` API 호환을 위해 Mantine color scheme를 래핑하는 어댑터를 도입하고, 모든 기존 소비자(GeneralSettings, style-override 등)가 수정 없이 동작하도록 함
- **NiceModal**: Mantine `ModalsProvider`는 NiceModal Provider 안쪽에서만 사용

### 7. PostCSS & Autoprefixer
- [`postcss-preset-mantine`](https://v7.mantine.dev/styles/postcss-preset/) + `postcss-simple-vars`로 Mantine 전용 유틸 사용
- 기존 `autoprefixer`는 유지 (Mantine preset이 벤더 프리픽스를 제공하지 않으므로 Safari/Firefox 호환을 위해 필요)
- CSS Modules + `sx` 혼합 전략은 그대로

### 8. Dialog & NiceModal 전략
- `frontend/src/components/dialogs/**/*` 전부 Mantine Modal + NiceModal 래퍼로 재작성
- Mantine `Modal` 스타일은 프로젝트 전용 CSS Modules로 통일하고, NiceModal show/hide API는 변경하지 않음
- Tailwind 삭제 전에 `_deprecated/dialogs`에 백업을 남겨 필요 시 롤백

### 9. 테스트 원칙
- 단계별로 변경/신규 로직에 대한 테스트 코드를 지속적으로 작성 (테마 어댑터, 스타일 오버라이드, 기본 UI 래퍼 등)
- 프런트엔드: Vitest + Testing Library로 최소 렌더/동작 검증, `pnpm run test && pnpm run check` 병행

---

### ✅ 진행 현황 메모 (2025-02-12 최신)

#### 완료된 항목
- 테마/Provider 통합: MantineProvider + Modals/Notifications + ColorSchemeScript를 기존 ThemeProvider 내부에 통합, `useTheme` API 유지 (`frontend/src/components/theme-provider.tsx`, `mantine-theme-adapter.tsx`, `mantine-theme.ts`).
- 기본 UI Mantine 래퍼 전환 및 테스트:
  - Button/Card/Input/Textarea/Checkbox/Switch/Select/Loader/Alert/Badge/Tooltip 어댑터 완료, Radix/shadcn 원본은 `_deprecated/`에 백업.
  - Select/Tooltip 어댑터는 Radix 스타일 JSX(Trigger/Value/Content/Item)를 파싱해 Mantine 컴포넌트를 구동하도록 구현, 사용처 변경 최소화.
  - Vitest + Testing Library 테스트 추가(테마 어댑터, 스타일 오버라이드, 입력/피드백 계열) 후 `pnpm run test`, `pnpm run check` 통과.
  - Vitest 셋업에 `ResizeObserver` 스텁 추가.
- Kanban 스타일 1차 적용: 카드/헤더에 Mantine Card `p="md"`, `shadow="sm"` 적용, 드롭 영역 outline을 Mantine CSS 변수 기반으로 수정, 드래그 시 shadow 강조. DnD 로직 그대로 유지 (`frontend/src/components/ui/shadcn-io/kanban/index.tsx`).
- Tooltip asChild 의존 제거: Mantine Tooltip 어댑터로 교체해 Trigger/Content 추출 방식으로 동작.
- ToggleGroup 타입 오류 해결: Radix 기반으로 복원해 기존 `active` prop 사용처 유지.

#### 남은 작업(우선순위 제안)
1) Tabs/ToggleGroup를 Mantine 기반으로 재정의하거나 호환 어댑터 추가 후 실제 사용처 업데이트.
2) Kanban 스타일 Tailwind 클래스 추가 치환(컬럼/카드 레이아웃, 드래그 인디케이터 완성) 및 Framer Motion 여부 결정.
3) Tooltip/DropdownMenu 등을 Mantine 스타일로 완전 전환할지 결정(현재 Tooltip은 Mantine 어댑터, DropdownMenu는 Radix).
4) Dialog/NiceModal 마이그레이션, 페이지/칸반 UI 치환, Tailwind 제거/글로벌 스타일 정리, 의존성 정리(Day 15).

#### 현재 상태
- 진행률: 약 60%
- 테스트: `pnpm run check` / `pnpm run test -- --runInBand` 모두 통과
- 백업: `_deprecated/` 아래 기존 UI 컴포넌트 원본 유지 (버튼/카드/입력/체크/스위치/셀렉트/토글/얼럿/배지/드롭다운 등)

---

## 🗓️ 상세 실행 계획

### Week 1: 기반 구축 (5일)

#### Day 1: 환경 설정
**목표**: Mantine 설치 및 기본 설정

**작업 내역**:
1. Mantine 패키지 설치 (autoprefixer 유지)
   ```bash
   pnpm add @mantine/core@^7 @mantine/hooks@^7 @mantine/form@^7 \
            @mantine/notifications@^7 @mantine/modals@^7 \
            @mantine/carousel@^7 @mantine/dates@^7 @mantine/dropzone@^7 \
            @emotion/react dayjs
   pnpm add -D postcss postcss-preset-mantine postcss-simple-vars autoprefixer
   ```

2. PostCSS 설정 파일 생성 (`autoprefixer` 유지)
   - 파일: `frontend/postcss.config.cjs`
   ```javascript
   module.exports = {
    plugins: {
      'postcss-preset-mantine': {},
      'postcss-simple-vars': {
        variables: {
          'mantine-breakpoint-xs': '36em',
          'mantine-breakpoint-sm': '48em',
          'mantine-breakpoint-md': '62em',
          'mantine-breakpoint-lg': '75em',
          'mantine-breakpoint-xl': '88em',
        },
      },
      autoprefixer: {},
    },
  };
  ```

3. Vite 설정 업데이트
   - 파일: `frontend/vite.config.ts`
   - Emotion 플러그인 추가 (필요시)

**완료 기준**: `pnpm run dev` 실행 시 에러 없음

---

#### Day 2: 테마 시스템 구축 + 어댑터 설계
**목표**: Mantine 테마 설정 및 기존 ThemeProvider와의 어댑터 구축

**작업 내역**:
1. 테마 파일 생성
   - 파일: `frontend/src/theme/mantine-theme.ts`
   ```typescript
   import { createTheme, MantineColorsTuple } from '@mantine/core';

   // 커스텀 색상 정의 (기존 Tailwind 색상 기반)
   const primary: MantineColorsTuple = [
     '#f0f0f0', // 0
     '#e0e0e0', // 1
     '#c0c0c0', // 2
     '#a0a0a0', // 3
     '#808080', // 4
     '#606060', // 5 - primary
     '#404040', // 6
     '#303030', // 7
     '#202020', // 8
     '#101010', // 9
   ];

   const success: MantineColorsTuple = [
     '#e6f7ed',
     '#c3ead4',
     '#9fddbb',
     '#7bd0a2',
     '#57c389',
     '#33b670', // primary success
     '#2a9259',
     '#206e42',
     '#174a2b',
     '#0d2614',
   ];

   // ... 다른 색상들

   export const theme = createTheme({
     colors: {
       primary,
       success,
       warning: [...],
       danger: [...],
       info: [...],
     },
     primaryColor: 'primary',
     defaultRadius: 'md',
     fontFamily: 'Chivo Mono, Noto Emoji, monospace',
     fontFamilyMonospace: 'Chivo Mono, monospace',
     headings: {
       fontFamily: 'Chivo Mono, Noto Emoji, monospace',
       sizes: {
         h1: { fontSize: '1.125rem', lineHeight: '1.75rem' },
         h2: { fontSize: '1rem', lineHeight: '1.5rem' },
       },
     },
     breakpoints: {
       xs: '36em',
       sm: '48em',
       md: '62em',
       lg: '75em',
       xl: '88em',
     },
   });
   ```

2. VS Code 테마 통합 스타일 초안 작성
   - 파일: `frontend/src/styles/vscode-integration.css`
   - 기존 `frontend/src/styles/index.css`에서 사용 중인 `--vscode-*` 토큰을 Mantine CSS 변수(`--mantine-color-body` 등)로 매핑
   - Tailwind 레이어/ANSI 클래스는 그대로 유지하되, Tailwind 지시어 제거 전에 어떤 CSS Modules/Global Styles로 대체할지 정의

3. `MantineThemeAdapter` 생성
   - 파일: `frontend/src/theme/mantine-theme-adapter.tsx`
   - 역할: Mantine `useComputedColorScheme` 결과를 `ThemeMode` enum으로 변환하고, `setTheme` 호출 시 `setColorScheme` + VS Code message sync 수행
   - 기존 `ThemeProvider`가 내부적으로 Mantine의 adapter를 호출하도록 설계 (외부 API 변화 없음)

4. `useTheme` 소비자 목록화
   - `rg "useTheme" frontend/src` 결과를 기반으로, GeneralSettings / JSONEditor / style-override / IdeIcon 등 총 10여 개 파일을 표로 정리
   - 각 소비자가 `ThemeMode` 값만 사용하는지, CSS 클래스(`.dark/.light`)를 쓰는지 여부를 기록해 이후 단계에서 검증

5. 색상 매핑 테이블 작성
   - 파일: `frontend/src/theme/color-mapping.md`
   - 기존 Tailwind 색상 → Mantine 색상 매핑 문서화 (VS Code 변수 fallback 포함)

**완료 기준**: Mantine 테마 객체 + 어댑터 설계 문서화, `useTheme` 소비자 영향 범위 파악

---

#### Day 3: Provider 통합 & 글로벌 스타일 준비
**목표**: MantineProvider를 기존 Provider 트리 내부에 통합하고 글로벌 스타일 구조를 정의

**작업 내역**:
1. `frontend/src/components/theme-provider.tsx` 수정
   - Mantine `ColorSchemeProvider`, `MantineProvider`, `ModalsProvider`, `Notifications`를 `ThemeProvider` 내부에서 초기화
   - 외부 API(`ThemeProvider` props, `useTheme` 반환값)는 변경하지 않고, 내부적으로 Mantine theme/adapter를 주입
   - `App.tsx` 또는 `AppContent`에서 `<ThemeProvider>` 사용 위치는 유지

2. `frontend/src/App.tsx` 검증
   - MantineProvider가 추가되었더라도 `QueryClientProvider → PostHogProvider → Sentry.ErrorBoundary → NiceModal.Provider` 순서가 유지되는지 확인
   - 필요 시 Mantine 관련 import는 `App.tsx`가 아닌 `ThemeProvider` 파일에서만 수행하여 엔트리 정리

3. 테마 전환 훅 생성/갱신
   - 파일: `frontend/src/hooks/useThemeManager.ts`
   ```typescript
   import { useMantineColorScheme } from '@mantine/core';
   import { ThemeMode } from 'shared/types';

   export function useThemeManager() {
     const { colorScheme, setColorScheme } = useMantineColorScheme();

     const setTheme = (mode: ThemeMode) => {
       if (mode === ThemeMode.SYSTEM) {
         setColorScheme('auto');
       } else if (mode === ThemeMode.DARK) {
         setColorScheme('dark');
       } else {
         setColorScheme('light');
       }
     };

     return { colorScheme, setTheme };
   }
   ```

4. 글로벌 스타일 전략 수립
   - `frontend/src/styles/index.css`를 `global.css`로 리팩터링하되, Tailwind 지시어 제거 대신 동일한 CSS 변수/ANSI 클래스/VS Code fallback을 Mantine CSS 변수 기반으로 재작성하는 목록 작성
   - VS Code 통합용 `vscode-integration.css`와 Global Styles의 책임 분리 명시

**완료 기준**: MantineProvider가 기존 Provider 체인과 충돌 없이 동작, 다크 모드 전환 및 VS Code 토큰이 유지됨

---

#### Day 4: VS Code & 글로벌 스타일 이관
**목표**: Tailwind 기반 글로벌 스타일을 Mantine + PostCSS 환경으로 이전

**작업 내역**:
1. `frontend/src/styles/index.css` 해체 계획 수립
   - VS Code 토큰(`--vscode-*`)과 내부 토큰(`--_*`)을 Mantine CSS 변수(`--mantine-color-*`)로 매핑
   - ANSI 클래스(`.ansi-red` 등)를 유지하기 위한 CSS Modules 혹은 Global Styles 파일 목록 작성

2. 새 Global 스타일 파일 구성
   - `frontend/src/styles/global.css`: Reset, ANSI, 레이아웃 관련 규칙 배치
   - `frontend/src/styles/vscode-integration.css`: VS Code 변수 → Mantine 변수 매핑 담당
   - PostCSS (`postcss-preset-mantine`)의 `@mixin`/`rem()`을 사용해 Tailwind spacing/타이포 값을 치환

3. 검증
   - VS Code 확장(웹)에서 `VIBE_STYLE_OVERRIDE` 메시지 수신 시 CSS 변수가 정상 업데이트되는지 수동 테스트
   - `AppWithStyleOverride` 훅이 Mantine adapter와 상호작용하도록 업데이트 (ThemeMode + CSS vars 동시 적용)

**완료 기준**: Tailwind 지시어 없이도 VS Code 통합/ANSI/폰트 규칙이 유지되는 `global.css`/`vscode-integration.css` 구조가 정의됨

#### Day 5: 기본 UI 컴포넌트 마이그레이션 (Phase 1)
**목표**: 가장 많이 사용되는 기본 컴포넌트 마이그레이션

**우선순위 1 컴포넌트**:
1. `button.tsx` → Mantine Button
2. `input.tsx` → Mantine TextInput
3. `label.tsx` → Mantine InputLabel (필요시 제거)
4. `card.tsx` → Mantine Card
5. `loader.tsx` → Mantine Loader

**작업 방식**:
- 기존 파일은 `frontend/src/components/ui/_deprecated/`로 이동
- 새 파일: `frontend/src/components/ui/mantine/Button.tsx` 형식
- 래퍼 컴포넌트 생성 (필요시 추가 props 처리)

**예시 - Button 컴포넌트**:
```typescript
// frontend/src/components/ui/Button.tsx
import { Button as MantineButton, ButtonProps } from '@mantine/core';
import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'filled', ...props }, ref) => {
    return <MantineButton ref={ref} variant={variant} {...props} />;
  }
);

Button.displayName = 'Button';
```

**완료 기준**: 5개 컴포넌트 마이그레이션 완료, 기존 사용처 일부 테스트

---

### Week 2: 컴포넌트 마이그레이션 (5일)

#### Day 6-7: 폼 컴포넌트 마이그레이션
**목표**: 입력 관련 컴포넌트 완전 교체

**컴포넌트 목록**:
1. `textarea.tsx` → Mantine Textarea
2. `select.tsx` → Mantine Select
3. `checkbox.tsx` → Mantine Checkbox
4. `switch.tsx` → Mantine Switch
5. `auto-expanding-textarea.tsx` → Mantine Textarea + autosize

**특수 처리**:
- `file-search-textarea.tsx` → Mantine Autocomplete 기반 재구현
- `multi-file-search-textarea.tsx` → Mantine MultiSelect 기반 재구현

**완료 기준**: 모든 폼 컴포넌트 교체 완료, 기존 폼 동작 유지

---

#### Day 8: 피드백 컴포넌트 마이그레이션
**목표**: 사용자 피드백 컴포넌트 교체

**컴포넌트 목록**:
1. `alert.tsx` → Mantine Alert
2. `tooltip.tsx` → Mantine Tooltip
3. `dialog.tsx` → Mantine Modal
4. `dropdown-menu.tsx` → Mantine Menu
5. `badge.tsx` → Mantine Badge

**NiceModal 통합**:
- `@ebay/nice-modal-react`는 유지
- Mantine Modal을 NiceModal로 래핑
- `frontend/src/components/dialogs/**/*` 전체를 점검하고, 공통 래퍼 `MantineDialogShell` (Modal props + NiceModal props 합성)을 만든 뒤 각 Dialog 컴포넌트에서 Tailwind 클래스를 `Mantine` props/`sx`로 치환
- Dialog 파일별 체크리스트 작성: 사용할 Mantine 컴포넌트, 기존 `max-w-*`, `space-y-*` 클래스에 대응하는 Mantine `Stack`, `Flex`, `Grid` 조합
- `_deprecated/dialogs` 폴더에 기존 구현을 보관해 롤백 경로 확보

**완료 기준**: 피드백 컴포넌트 모두 교체, 알림/모달 정상 작동

---

#### Day 9: 네비게이션 & 레이아웃 컴포넌트
**목표**: 네비게이션 및 레이아웃 컴포넌트 교체

**컴포넌트 목록**:
1. `tabs.tsx` → Mantine Tabs
2. `breadcrumb.tsx` → Mantine Breadcrumbs
3. `carousel.tsx` → Mantine Carousel (embla 기반 동일)
4. `toggle-group.tsx` → Mantine SegmentedControl

**완료 기준**: 네비게이션 컴포넌트 교체, 라우팅 정상 작동

---

#### Day 10: 커스텀 컴포넌트 재작성
**목표**: 프로젝트 특화 컴포넌트 Mantine으로 재구현

**컴포넌트 목록**:
1. `ActionsDropdown.tsx` - Mantine Menu + ActionIcon
2. `TitleDescriptionEditor.tsx` - Mantine TextInput + Textarea
3. `ImageUploadSection.tsx` - Mantine Dropzone
4. `new-card.tsx` - Mantine Card + 커스텀 로직

**특수 컴포넌트 (스타일만 조정)**:
1. `wysiwyg.tsx` (Lexical) - 스타일만 Mantine과 조화
2. `json-editor.tsx` (CodeMirror) - 테마 색상만 조정
3. `markdown-renderer.tsx` - Mantine TypographyStylesProvider 사용

**완료 기준**: 모든 커스텀 컴포넌트 Mantine 스타일 적용

---

### Week 3: 페이지 & 통합 (5일)

#### Day 11-13: 페이지별 마이그레이션
**목표**: 모든 페이지 파일에서 Mantine 컴포넌트 사용

**마이그레이션 순서** (페이지별):
1. 가장 단순한 페이지부터 시작
2. 임포트 교체: `@/components/ui/*` → Mantine 컴포넌트
3. Tailwind 클래스 → Mantine props 또는 `sx` 변환
4. 레이아웃 재구성: Grid, Flex, Stack 사용

**Tailwind → Mantine 변환 예시**:
```typescript
// Before (Tailwind)
<div className="flex flex-col gap-4 p-6 bg-card rounded-lg">
  <h2 className="text-lg font-medium">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>

// After (Mantine)
<Card padding="lg" radius="md">
  <Stack gap="md">
    <Title order={2} size="lg">Title</Title>
    <Text c="dimmed">Description</Text>
  </Stack>
</Card>
```

**완료 기준**: 모든 페이지에서 Tailwind 클래스 제거, Mantine 컴포넌트로 전환

---

#### Day 14: Kanban 보드 컴포넌트 마이그레이션
**목표**: 핵심 칸반 보드 컴포넌트 마이그레이션

**파일**: `frontend/src/components/ui/shadcn-io/kanban/index.tsx`

**작업 내역**:
1. DnD 로직은 `@dnd-kit` 그대로 유지
2. 카드/컬럼 UI를 Mantine Card로 교체
3. 드래그 인디케이터 스타일 재구현
4. 애니메이션은 Framer Motion 유지 또는 Mantine 전환 결정

**완료 기준**: 칸반 보드 정상 작동, 드래그 앤 드롭 기능 유지

---

#### Day 15: 의존성 정리 및 최적화
**목표**: 불필요한 패키지 제거 및 빌드 최적화

**작업 내역**:
1. `package.json`에서 사용하지 않는 패키지 제거 (`autoprefixer`는 유지)
   ```bash
   pnpm remove tailwindcss tailwindcss-animate \
                @tailwindcss/typography @tailwindcss/container-queries \
                class-variance-authority tailwind-merge \
                @radix-ui/react-dropdown-menu @radix-ui/react-label \
                @radix-ui/react-select @radix-ui/react-slot \
                @radix-ui/react-switch @radix-ui/react-tabs \
                @radix-ui/react-toggle-group @radix-ui/react-tooltip \
                @rjsf/shadcn
   ```

2. Vite 빌드 최적화
   - `vite.config.ts`에서 청크 분할 전략 조정
   - Mantine 컴포넌트 트리쉐이킹 확인

3. CSS 파일 정리
   - `tailwind.config.js` 삭제
   - 사용하지 않는 CSS 파일 제거
   - `frontend/src/components/ui/_deprecated/` 폴더 삭제

**완료 기준**: 빌드 성공, 번들 크기 비교, 불필요한 파일 제거

---

### Week 4: 테스트 & 마무리 (5일)

#### Day 16-17: 전체 테스트
**목표**: 모든 기능 수동 테스트 및 버그 수정

**테스트 체크리스트**:
- [ ] 모든 페이지 렌더링 확인
- [ ] 다크/라이트 모드 전환 테스트
- [ ] VS Code 테마 통합 작동 확인
- [ ] 폼 입력 및 검증 테스트
- [ ] 모달/드롭다운 동작 확인
- [ ] 칸반 보드 드래그 앤 드롭 테스트
- [ ] 반응형 레이아웃 확인 (모바일, 태블릿, 데스크톱)
- [ ] 코드 에디터 (CodeMirror, Lexical) 정상 작동
- [ ] 이미지 업로드 테스트
- [ ] 라우팅 및 네비게이션 확인

**완료 기준**: 모든 주요 기능 정상 작동, 크리티컬 버그 없음

---

#### Day 18: 성능 최적화
**목표**: 로딩 속도 및 런타임 성능 개선

**작업 내역**:
1. 빌드 크기 분석
   ```bash
   pnpm run build
   npx vite-bundle-visualizer
   ```

2. 지연 로딩 적용
   - 큰 컴포넌트 React.lazy() 처리
   - Mantine 컴포넌트 동적 임포트

3. 불필요한 리렌더링 제거
   - React.memo() 적용
   - useMemo, useCallback 최적화

4. 이미지 및 폰트 최적화
   - 폰트 로딩 전략 조정
   - 이미지 lazy loading

**완료 기준**: Lighthouse 점수 90+ (Performance), 빌드 크기 기존 대비 유지 또는 감소

---

#### Day 19: 문서화
**목표**: 마이그레이션 결과 및 사용법 문서화

**작성할 문서**:
1. `MANTINE_MIGRATION_SUMMARY.md`
   - 마이그레이션 전/후 비교
   - 변경된 컴포넌트 목록
   - 주요 개선 사항

2. `docs/THEMING_GUIDE.md`
   - Mantine 테마 커스터마이징 방법
   - 색상 팔레트 사용법
   - VS Code 테마 통합 설명

3. `docs/COMPONENT_USAGE.md`
   - 주요 컴포넌트 사용 예시
   - 커스텀 컴포넌트 가이드
   - 스타일링 베스트 프랙티스

4. `CLAUDE.md` 업데이트
   - Mantine 관련 내용 추가
   - 빌드 커맨드 업데이트
   - 의존성 정보 갱신

**완료 기준**: 모든 문서 작성 완료, README 업데이트

---

#### Day 20: 최종 검토 및 배포 준비
**목표**: 최종 점검 및 프로덕션 배포 준비

**작업 내역**:
1. 코드 리뷰
   - 사용하지 않는 임포트 제거
   - 콘솔 로그 정리
   - 타입 에러 확인 (`npm run check`)

2. 린팅 및 포매팅
   ```bash
   cd frontend && npm run lint:fix
   cd frontend && npm run format
   ```

3. Git 커밋 정리
   - 마이그레이션 관련 커밋을 논리적으로 분리
   - 명확한 커밋 메시지 작성

4. 변경 로그 작성
   - `CHANGELOG.md` 업데이트
   - Breaking changes 명시
   - 마이그레이션 가이드 링크

**완료 기준**: 모든 체크 통과, 프로덕션 배포 준비 완료

---

## 📊 컴포넌트 매핑 테이블

| Shadcn/UI Component | Mantine Component | 변경 사항 | 우선순위 |
|---------------------|-------------------|----------|---------|
| `button.tsx` | `Button` | 직접 교체 | 높음 |
| `input.tsx` | `TextInput` | 직접 교체 | 높음 |
| `textarea.tsx` | `Textarea` | 직접 교체 | 높음 |
| `select.tsx` | `Select` | 직접 교체 | 높음 |
| `checkbox.tsx` | `Checkbox` | 직접 교체 | 높음 |
| `switch.tsx` | `Switch` | 직접 교체 | 높음 |
| `label.tsx` | 제거 (Mantine 내장) | 불필요 | 높음 |
| `card.tsx` | `Card` | 직접 교체 | 높음 |
| `loader.tsx` | `Loader` | 직접 교체 | 높음 |
| `dialog.tsx` | `Modal` | API 차이, 래퍼 필요 | 중간 |
| `dropdown-menu.tsx` | `Menu` | API 차이, 재구현 | 중간 |
| `tooltip.tsx` | `Tooltip` | 직접 교체 | 중간 |
| `tabs.tsx` | `Tabs` | 직접 교체 | 중간 |
| `badge.tsx` | `Badge` | 직접 교체 | 중간 |
| `alert.tsx` | `Alert` | 직접 교체 | 중간 |
| `breadcrumb.tsx` | `Breadcrumbs` | 직접 교체 | 낮음 |
| `carousel.tsx` | `Carousel` | 직접 교체 (embla 기반 동일) | 낮음 |
| `toggle-group.tsx` | `SegmentedControl` | 재구현 필요 | 낮음 |
| `auto-expanding-textarea.tsx` | `Textarea` + autosize | props 조정 | 중간 |
| `file-search-textarea.tsx` | `Autocomplete` | 커스텀 로직 재구현 | 높음 |
| `multi-file-search-textarea.tsx` | `MultiSelect` | 커스텀 로직 재구현 | 높음 |
| `ActionsDropdown.tsx` | `Menu` + `ActionIcon` | 재구현 | 중간 |
| `TitleDescriptionEditor.tsx` | `TextInput` + `Textarea` | 재구현 | 중간 |
| `ImageUploadSection.tsx` | `Dropzone` | 직접 교체 | 중간 |
| `wysiwyg.tsx` | 유지 (Lexical) | 스타일만 조정 | 낮음 |
| `json-editor.tsx` | 유지 (CodeMirror) | 스타일만 조정 | 낮음 |
| `markdown-renderer.tsx` | `TypographyStylesProvider` | 래퍼 추가 | 낮음 |

---

## 🎨 색상 시스템 변환

### Tailwind 색상 → Mantine 색상 매핑

```typescript
// 기존 Tailwind CSS 변수
const tailwindColors = {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  // ...
};

// Mantine 색상 튜플로 변환
const mantineColors = {
  primary: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
            '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
  success: ['#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9',
            '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b'],
  // ...
};
```

### 시맨틱 토큰 매핑

| Tailwind 토큰 | Mantine 토큰 | 사용 예시 |
|--------------|-------------|----------|
| `bg-background` | `bg="background"` | 페이지 배경 |
| `text-foreground` | `c="text"` | 기본 텍스트 |
| `bg-primary` | `color="primary"` | 주요 버튼 |
| `text-muted-foreground` | `c="dimmed"` | 보조 텍스트 |
| `border-border` | `bd="default"` | 테두리 |
| `bg-card` | `bg="white"` (light) / `bg="dark"` (dark) | 카드 배경 |

---

## 🔧 유틸리티 함수 마이그레이션

### 스타일 유틸리티

```typescript
// 삭제: tailwind-merge의 cn 함수
import { cn } from '@/lib/utils';

// 대체: Mantine의 clsx (필요시)
import { clsx } from '@mantine/core';

// 또는 Mantine의 sx prop 사용 (권장)
<Button sx={{ backgroundColor: 'red' }} />
```

### 반응형 스타일

```typescript
// Before (Tailwind)
<div className="hidden md:block lg:flex">...</div>

// After (Mantine)
<Box hiddenFrom="md" visibleFrom="lg">...</Box>

// 또는 sx prop 사용
<Box sx={{
  display: { base: 'none', md: 'block', lg: 'flex' }
}}>...</Box>
```

---

## ⚠️ 주의사항 및 위험 요소

### 1. Breaking Changes
- **컴포넌트 API 변경**: 일부 컴포넌트는 props 구조가 완전히 다름
- **스타일링 방식 변경**: Tailwind → Mantine으로 전체 재작성 필요
- **테마 시스템 변경**: CSS 변수 구조 재설계 + `ThemeProvider` 내부 구현 전면 수정

### 2. 호환성 이슈
- **VS Code Extension**: CSS 변수 오버라이드 방식 재검증 필요
- **CodeMirror/Lexical**: 테마 색상 통합 확인 필요
- **Framer Motion**: Mantine 애니메이션과 충돌 가능성
- **PostCSS 체인**: [`postcss-preset-mantine`](https://v7.mantine.dev/styles/postcss-preset/)에는 autoprefixer가 포함되지 않으므로 기존 autoprefixer 제거 시 Safari/Firefox 회귀 발생

### 3. 성능 고려사항
- **번들 크기**: Mantine은 Emotion을 사용하므로 번들 크기 증가 가능
- **초기 로딩**: CSS-in-JS로 인한 FOUC (Flash of Unstyled Content) 가능성
- **런타임 성능**: Emotion 스타일 계산 오버헤드

### 4. 학습 곡선
- 팀원들의 Mantine 학습 필요
- 새로운 스타일링 패턴 적응
- Mantine 문서 참조 필수

---

## 📈 성공 지표

### 마이그레이션 완료 기준
- [ ] 모든 Tailwind 클래스 제거
- [ ] 모든 shadcn/ui 컴포넌트 교체
- [ ] 모든 Radix UI 직접 의존성 제거
- [ ] 다크/라이트 모드 정상 작동
- [ ] VS Code 테마 통합 유지
- [ ] 빌드 에러 0개
- [ ] TypeScript 에러 0개
- [ ] 모든 페이지 정상 렌더링

### 품질 지표
- **Lighthouse Performance**: 90+ 유지
- **번들 크기**: 기존 대비 +10% 이내
- **초기 로딩 시간**: 기존 대비 유사 또는 개선
- **사용자 경험**: 기존과 동일 또는 개선

---

## 🚀 롤백 전략

마이그레이션 중 문제 발생 시:

### 단계별 롤백
1. **긴급 롤백**: Git branch 전환
   ```bash
   git checkout main
   pnpm install
   pnpm run dev
   ```

2. **부분 롤백**: 특정 컴포넌트만 되돌리기
   - `_deprecated` 폴더에서 원본 복구
   - 임포트 경로 수정

3. **완전 롤백**: 마이그레이션 브랜치 삭제
   ```bash
   git branch -D mantine-migration
   pnpm install
   ```

### 백업 전략
- 마이그레이션 전 별도 브랜치 생성
- 주요 마일스톤마다 태그 생성
- 원본 컴포넌트는 `_deprecated` 폴더에 보관

---

## 📚 참고 자료

### Mantine 공식 문서
- [Mantine v7 Documentation](https://mantine.dev/)
- [Mantine Migration Guide](https://mantine.dev/guides/migrations/)
- [Mantine Theming](https://mantine.dev/theming/theme-object/)
- [Mantine Styles API](https://mantine.dev/styles/styles-api/)
- [Mantine PostCSS preset](https://v7.mantine.dev/styles/postcss-preset/)

### 내부 문서
- `MANTINE_MIGRATION_SUMMARY.md` (마이그레이션 후 작성)
- `docs/THEMING_GUIDE.md` (마이그레이션 후 작성)
- `docs/COMPONENT_USAGE.md` (마이그레이션 후 작성)

---

## ✅ 체크리스트

### 시작 전 준비
- [ ] 별도 브랜치 생성 (`mantine-migration`)
- [ ] 팀원들에게 마이그레이션 계획 공유
- [ ] 백업 전략 확인
- [ ] 예상 소요 시간 확보 (3-4주)

### 마이그레이션 진행 중
- [ ] Day 1-5: Week 1 완료
- [ ] Day 6-10: Week 2 완료
- [ ] Day 11-15: Week 3 완료
- [ ] Day 16-20: Week 4 완료

### 마이그레이션 완료 후
- [ ] 전체 테스트 통과
- [ ] 문서 작성 완료
- [ ] 코드 리뷰 완료
- [ ] PR 생성 및 머지
- [ ] 배포 완료

---

**작성일**: 2025-01-15
**예상 완료일**: 2025-02-12
**담당자**: Development Team
**상태**: 계획 단계
