# Development Guidelines & Engineering Workflow

This document details coding conventions, development workflows, state extension patterns, and best practices for engineers contributing to **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Development Environment](#development-environment)
- [Available Scripts](#available-scripts)
- [TypeScript & Code Standards](#typescript--code-standards)
- [Styling with Tailwind CSS 4](#styling-with-tailwind-css-4)
- [Extending the Database & Context Layers](#extending-the-database--context-layers)
  - [Step 1: Declare the TypeScript Interface](#step-1-declare-the-typescript-interface)
  - [Step 2: Add Database Methods in `db.ts`](#step-2-add-database-methods-in-dbts)
  - [Step 3: Expose via `DbContext.tsx`](#step-3-expose-via-dbcontexttsx)
  - [Step 4: Consume in Components](#step-4-consume-in-components)
- [Component Design Best Practices](#component-design-best-practices)
- [Sound & Acoustic Design](#sound--acoustic-design)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Development Environment

### Recommended Tooling
- **Editor**: Visual Studio Code or Cursor.
- **Extensions**:
  - *Tailwind CSS IntelliSense* (`bradlc.vscode-tailwindcss`)
  - *TypeScript and JavaScript Language Features* (built-in)
  - *ESLint* (`dbaeumer.vscode-eslint`)
- **Node.js**: v18+ or v20+ LTS.

---

## Available Scripts

The project includes standardized npm scripts in `package.json`:

| Command | Action | Explanation |
|---|---|---|
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts the Vite development server with fast compilation on port 3000. |
| `npm run build` | `vite build` | Runs the production Vite bundler, emitting static assets into `dist/`. |
| `npm run preview` | `vite preview` | Serves the production build locally for verification. |
| `npm run lint` | `tsc --noEmit` | Executes TypeScript type checking across the entire source tree without outputting JS files. |
| `npm run clean` | `rm -rf dist server.js` | Removes compiled artifacts and bundle caches. |

---

## TypeScript & Code Standards

### 1. Strict Typing
- Do not use implicit or explicit `any`. Define comprehensive interfaces in `src/types/index.ts`.
- Maintain strict property typing for all collections, transaction payloads, and component props.

### 2. Functional Components & Hooks
- Always write functional React components typed with `React.FC<Props>` or standard typed function declarations.
- Custom state should leverage React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- Access application services exclusively via the custom context hooks: `useDb()` and `useAuth()`.

### 3. Error Handling
- Wrap parsing, mathematical operations, and local storage operations in `try / catch` blocks.
- Never let arithmetic exceptions crash the UI; fallback to safe display numbers or visual validation messages.

---

## Styling with Tailwind CSS 4

The application utilizes **Tailwind CSS v4** via the `@tailwindcss/vite` plugin.

### Key Rules:
1. **Zero Inline Styles**: Use Tailwind CSS utility classes exclusively (`bg-emerald-600`, `rounded-2xl`, `p-4`). Inline `style={{ ... }}` is strictly forbidden, except for dynamic chart heights managed by Recharts.
2. **Design Language & Palette**:
   - Primary Brand / Success: `emerald-600` / `emerald-700`
   - Actions & Accents: `indigo-600`, `blue-600`
   - Warnings & Udhar Outstanding: `amber-500`, `orange-500`
   - Danger & Deletions: `rose-600`, `red-600`
   - Neutrals: `slate-100` (backgrounds), `slate-800` (text), `white` (card surfaces).
3. **Corner Radii & Elevations**:
   - Cards and panels utilize modern soft radii: `rounded-2xl` or `rounded-3xl`.
   - Subtle borders: `border border-slate-200`.
   - Soft shadows: `shadow-sm` or `shadow-md`.
4. **Touch & POS Targets**:
   - Calculator and POS buttons must maintain a minimum target height of `h-12` or `h-14` with `active:scale-95` tactile feedback for high-speed counter tapping.

---

## Extending the Database & Context Layers

To introduce a new business entity or transaction type into SMARTBIZ, follow this standard pattern:

### Step 1: Declare the TypeScript Interface
In `/src/types/index.ts`:

```typescript
export interface WarrantyRecord {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerName: string;
  productName: string;
  serialNumber: string;
  validUntil: string;
  status: 'active' | 'expired' | 'claimed';
  createdAt: string;
}
```

### Step 2: Add Database Methods in `db.ts`
In `/src/services/db.ts`:

1. Add initial seed/empty state in `initDefaults()`:
   ```typescript
   this.set('warranties', []);
   ```
2. Add the collection key to `exportAll()` and `exportBackup()` collection arrays.
3. Add helper transaction methods:
   ```typescript
   public saveWarranty(record: WarrantyRecord, actor: { id: string; name: string; role: any }) {
     const warranties = this.get<WarrantyRecord[]>('warranties') || [];
     const index = warranties.findIndex((w) => w.id === record.id);
     if (index >= 0) {
       warranties[index] = record;
     } else {
       warranties.unshift(record);
     }
     this.set('warranties', warranties);
     this.logActivity(actor.id, actor.name, actor.role, 'Saved Warranty', 'warranty', record.serialNumber);
   }
   ```

### Step 3: Expose via `DbContext.tsx`
In `/src/context/DbContext.tsx`:

1. Add `warranties: WarrantyRecord[]` and `saveWarranty` to the `DbContextType` interface.
2. Initialize state and pub/sub subscription:
   ```typescript
   const [warranties, setWarranties] = useState<WarrantyRecord[]>(() => db.get('warranties') || []);
   
   useEffect(() => {
     return db.subscribe('warranties', () => setWarranties(db.get('warranties') || []));
   }, []);
   ```
3. Expose in the `DbContext.Provider` value prop.

### Step 4: Consume in Components
In any UI component:

```typescript
import { useDb } from '../../context/DbContext';

export const WarrantyManager: React.FC = () => {
  const { warranties, saveWarranty, playSound } = useDb();
  // Render and interact reactively!
};
```

---

## Component Design Best Practices

1. **Keep Presentational Components Modular**: Separate large forms, receipt previews, and modals into dedicated child components.
2. **Keyboard Accessibility**: Ensure that input forms support `Enter` key submission and `Escape` key dismissal.
3. **Optimistic & Instant UI**: Actions update local state immediately via `DbContext` without awaiting remote network round-trips.

---

## Sound & Acoustic Design

SMARTBIZ uses the native Web Audio API in `DbContext.tsx` to provide responsive audio cues.

When invoking user feedback:
- For neutral key clicks: `playSound('beep')`
- For successful saves or updates: `playSound('success')`
- For completed sales, checkouts, or cash settlements: `playSound('cash')`
- For invalid inputs or stock errors: `playSound('error')`

Always respect the global user toggle `soundEnabled`.

---

## Cross-Document Navigation

- [README.md](README.md) — System introduction.
- [ARCHITECTURE.md](ARCHITECTURE.md) — Architectural principles and data flows.
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Directory layout and component mapping.
- [DATABASE.md](DATABASE.md) — Schema definitions.
- [TESTING.md](TESTING.md) — Testing patterns and verification.
