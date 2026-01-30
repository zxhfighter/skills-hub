---
name: god-component-detector
description: Detects God Components (components with too many responsibilities, mixing UI/business logic/side effects, excessive line count). Use when reviewing React/Next.js components for architecture issues, refactoring opportunities, or code quality assessments.
argument-hint: <file-or-pattern>
---

# God Component Detector

Identifies React/Next.js components that violate the Single Responsibility Principle by mixing concerns, having excessive complexity, or containing too many lines of code.

## What is a God Component?

A "God Component" (also called "God Object" or "Blob Anti-pattern") is a component that:

- **Knows too much**: Has excessive knowledge of the system
- **Does too much**: Handles multiple unrelated responsibilities
- **Is too large**: Excessive lines of code (typically >300 LOC)
- **Mixes concerns**: UI rendering + business logic + data fetching + side effects

## Detection Criteria

### 🚨 Critical Red Flags (Severity: High)

1. **File Size**

   - ❌ >500 lines: Severe violation
   - ⚠️ 300-500 lines: Needs attention
   - ✅ <300 lines: Acceptable

2. **Mixed Concerns in Single Component**

   - ❌ UI + Business Logic + Data Fetching + Side Effects
   - ❌ Complex state management + API calls + Validation + Formatting
   - ⚠️ UI + Simple Business Logic (tolerable if localized)

3. **Excessive State Management**
   - ❌ >8 `useState` calls
   - ❌ >5 `useEffect` calls
   - ❌ Multiple unrelated state variables

### ⚠️ Warning Signs (Severity: Medium-High)

4. **Multiple Responsibilities**

   - Data fetching logic
   - Form validation
   - Business calculations
   - UI rendering
   - Event handlers
   - Routing logic
   - Error handling
   - Authentication checks
   - Count: >4 different responsibility types → God Component

5. **Excessive Dependencies**

   - > 10 imports from different modules
   - > 5 custom hooks
   - > 8 props passed to component

6. **Complex Nested Logic**
   - Deep nesting (>4 levels)
   - Multiple ternary operators
   - Extensive conditional rendering

### 📝 Code Smells (Severity: Medium)

7. **Function Proliferation**

   - > 10 internal functions/handlers
   - Long functions (>50 lines each)
   - Functions doing multiple things

8. **Direct API Calls**

   - `fetch`/`axios` calls directly in component
   - Database queries in component
   - Should be in hooks/services

9. **Complex Calculations**

   - Business logic calculations in render
   - Data transformations in JSX
   - Should be extracted to utilities/hooks

10. **Side Effect Soup**
    - Multiple unrelated `useEffect` blocks
    - Effects with many dependencies
    - Effects that do multiple things

## Detection Algorithm

When analyzing a component file:

### Step 1: Basic Metrics

```
Lines of Code (LOC) = total lines - comments - blank lines
If LOC > 500: CRITICAL
If LOC > 300: WARNING
```

### Step 2: Count Hook Usage

```
useState count: if > 8 → FLAG
useEffect count: if > 5 → FLAG
Custom hooks: if > 5 → FLAG
```

### Step 3: Identify Responsibilities

Look for these patterns and count distinct responsibility types:

- **Data Fetching**: `fetch`, `axios`, `useSWR`, `useQuery`, API imports
- **Form Handling**: form state, validation, submission logic
- **Business Logic**: calculations, transformations, complex conditions
- **Side Effects**: `useEffect`, subscriptions, timers, listeners
- **Routing**: `useRouter`, `useNavigate`, `router.push`
- **State Management**: Complex state updates, reducers
- **Authentication/Authorization**: auth checks, permission logic
- **UI Rendering**: JSX, styling, layout

If component has >4 distinct responsibility types → God Component

### Step 4: Function Analysis

```
Count internal functions (handlers, utilities)
If > 10: WARNING
If any function > 50 lines: FLAG
```

### Step 5: JSX Complexity

```
Count conditional renders (? :, &&)
If > 8: WARNING
Check nesting depth
If > 4 levels: WARNING
```

## Output Format

For each detected God Component, output in this format:

```
file:line - God Component Detected

Severity: [CRITICAL | HIGH | MEDIUM]
LOC: [number] lines
Issues:
  - [Issue 1]
  - [Issue 2]
  ...

Responsibilities Found ([count]):
  - [Responsibility 1]: [evidence]
  - [Responsibility 2]: [evidence]
  ...

Metrics:
  - useState: [count]
  - useEffect: [count]
  - Functions: [count]
  - Props: [count]
  - Imports: [count]

Refactoring Suggestions:
  1. [Suggestion 1]
  2. [Suggestion 2]
  ...
```

## Refactoring Strategies

### 1. Extract Custom Hooks

```tsx
// ❌ Before: Data fetching in component
function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  // ... 100 more lines
}

// ✅ After: Extract to custom hook
function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

function Component() {
  const { data, loading } = useData();
  // ... just UI
}
```

### 2. Extract Business Logic to Services

```tsx
// ❌ Before: Business logic in component
function Component({ positions }) {
  const calculateTotal = () => {
    return positions.reduce((sum, pos) => {
      const quantity = parseFloat(pos.quantity);
      const cost = parseFloat(pos.averageCost);
      const currentPrice = pos.currentPrice ? parseFloat(pos.currentPrice) : 0;
      const marketValue = quantity * currentPrice;
      const unrealizedPnl = marketValue - quantity * cost;
      return sum + unrealizedPnl;
    }, 0);
  };

  // ... more calculations
}

// ✅ After: Extract to service/utility
// services/portfolio-calculator.ts
export class PortfolioCalculator {
  static calculateTotalPnL(positions: Position[]) {
    return positions.reduce((sum, pos) => {
      const unrealizedPnl = this.calculateUnrealizedPnL(pos);
      return sum + unrealizedPnl;
    }, 0);
  }

  static calculateUnrealizedPnL(position: Position) {
    const quantity = parseFloat(position.quantity);
    const cost = parseFloat(position.averageCost);
    const currentPrice = position.currentPrice
      ? parseFloat(position.currentPrice)
      : 0;
    const marketValue = quantity * currentPrice;
    return marketValue - quantity * cost;
  }
}

// Component just uses it
function Component({ positions }) {
  const totalPnL = PortfolioCalculator.calculateTotalPnL(positions);
}
```

### 3. Split into Smaller Components

```tsx
// ❌ Before: One large component
function Dashboard() {
  // Header logic
  const [user, setUser] = useState(null);

  // Sidebar logic
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Main content logic
  const [data, setData] = useState([]);

  // Footer logic
  const year = new Date().getFullYear();

  return <div>{/* 300 lines of mixed UI */}</div>;
}

// ✅ After: Split into focused components
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardSidebar />
      <DashboardContent />
      <DashboardFooter />
    </div>
  );
}

function DashboardHeader() {
  const { user } = useAuth();
  return <header>{user.name}</header>;
}

function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  return <aside>{/* sidebar UI */}</aside>;
}

// Each component has single responsibility
```

### 4. Use Composition Over Configuration

```tsx
// ❌ Before: God component with many props
function DataTable({
  data,
  columns,
  filters,
  sorting,
  pagination,
  onRowClick,
  onEdit,
  onDelete,
  showActions,
  customRenderer,
  // ... 20 more props
}) {
  // 500 lines handling all combinations
}

// ✅ After: Composable components
function DataTable({ children }) {
  return <table>{children}</table>;
}

function DataTableHeader({ columns }) {
  return <thead>{/* header */}</thead>;
}

function DataTableBody({ data, children }) {
  return <tbody>{data.map((row) => children(row))}</tbody>;
}

// Usage
<DataTable>
  <DataTableHeader columns={columns} />
  <DataTableBody data={data}>{(row) => <CustomRow row={row} />}</DataTableBody>
</DataTable>;
```

### 5. Extract Server Actions (Next.js)

```tsx
// ❌ Before: API logic in client component
"use client";
function Component() {
  async function handleSubmit(data) {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // ... error handling, validation, etc.
  }
}

// ✅ After: Server action
// actions.ts
("use server");
export async function submitData(data: FormData) {
  // Server-side logic
  return { success: true };
}

// Component
("use client");
function Component() {
  async function handleSubmit(data) {
    await submitData(data);
  }
}
```

## Common God Component Patterns to Watch For

### Pattern 1: The "All-In-One Form"

- Form state + validation + submission + error handling + success handling + routing
- **Fix**: Extract form logic to custom hook, validation to schema, API to server action

### Pattern 2: The "Dashboard Kitchen Sink"

- Multiple data sources + calculations + charts + tables + filters + exports
- **Fix**: Split into focused components, extract data fetching to hooks

### Pattern 3: The "Modal Manager"

- Multiple modal states + modal content + modal logic + parent component logic
- **Fix**: Extract modal logic to context or state management, separate modal components

### Pattern 4: The "List + CRUD Everything"

- List rendering + create + read + update + delete + sort + filter + pagination
- **Fix**: Separate concerns - list display vs. CRUD operations, extract hooks

### Pattern 5: The "Page Component"

- Entire page in one component with layout + header + sidebar + content + footer
- **Fix**: Split into layout components, use composition

## Usage

When asked to detect God Components:

1. **Single File**: Analyze the specified file
2. **Pattern/Directory**: Find all components matching pattern
3. **No argument**: Ask user which files/pattern to analyze

For each analyzed file:

1. Calculate all metrics
2. Identify responsibilities
3. Determine severity
4. Generate refactoring suggestions
5. Output in specified format

## Examples of Analysis Triggers

User might say:

- "Check this component for God Component anti-pattern"
- "Is this component too large?"
- "Review this file for architecture issues"
- "Find all God Components in /components"
- "Suggest refactoring for this component"

## Integration with Other Skills

Works well with:

- **vercel-react-best-practices**: Performance optimization after refactoring
- **web-design-guidelines**: Ensure UI best practices in split components
- Standard code review: Architecture and maintainability

## References

- Clean Code by Robert C. Martin (Single Responsibility Principle)
- Refactoring by Martin Fowler
- Component-Driven Development patterns
- React component composition patterns
