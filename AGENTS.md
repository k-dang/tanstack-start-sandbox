# Agent Guidelines for TanStack Start Sandbox

This file contains guidelines for agentic coding assistants working in this repository.

## Build, Lint, and Test Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm preview          # Preview production build

# Code Quality
pnpm format           # Format code with Biome
pnpm lint             # Lint code with Biome
pnpm check            # Run both format and lint checks

# Database
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio for DB management

# Testing
pnpm test             # Run all tests with Vitest
pnpm test --run       # Run tests once
pnpm test <pattern>   # Run tests matching a file pattern (e.g., test button)
```

**IMPORTANT**: After completing tasks, ALWAYS run `pnpm lint` and `pnpm check` to ensure code quality.

## Code Style Guidelines

### Formatting
- Use **Biome** for all formatting and linting
- 2-space indentation (configured in biome.json)
- Line width: 80 characters
- Double quotes for strings

### Import Organization
- Use absolute imports with `@/` alias for project files
  - Components: `@/components/...`
  - Hooks: `@/hooks/...`
  - Lib utilities: `@/lib/...`
  - Database: `@/db/...`
- Third-party imports first, then absolute imports with `@/` prefix
- Biome automatically organizes imports

### TypeScript
- Strict mode enabled in tsconfig.json
- Always use explicit types for function parameters and return values
- Use Drizzle's `$inferSelect` and `$inferInsert` for DB types
- Use `type` keyword for type-only imports: `import type { Pokemon } from "@/db/schema"`

### Naming Conventions
- Components: PascalCase (e.g., `PokemonCard`, `Header`)
- Functions/hooks: camelCase (e.g., `useAddToCart`, `getRandomPokemon`)
- Variables: camelCase (e.g., `cartId`, `pokemonId`)
- Constants: UPPER_SNAKE_CASE or PascalCase for constants defined at module level
- Database tables: camelCase with "Table" suffix (e.g., `pokemonTable`, `cartTable`)

### Component Patterns
- Use function components with named exports
- Destructure props with TypeScript interfaces
- Use `default` export for page components, named exports for shared components
- Access loader data with `Route.useLoaderData()` in TanStack Router routes
- Handle loading states with `pendingComponent` in route definitions

### Server Functions
- Create server functions with `createServerFn({ method: "GET" | "POST" })`
- Always use `.inputValidator()` to validate input types
- Handler functions receive `{ data }` object
- Place server functions at the top of route files before component definitions

### Error Handling
- Use Error boundaries for React errors (currently not implemented)
- Use `try/catch` for async operations in server functions
- Use `throw new Error()` with descriptive messages
- Return error objects from server functions when appropriate
- Use `toast` from `sonner` for user-facing error notifications

### State Management
- Use TanStack Query (`useMutation`, `useQuery`) for server state
- Use `useState` for local component state
- Invalidate queries with `router.invalidate()` after mutations
- Access router with `useRouter()` hook from `@tanstack/react-router`

### Database Operations
- Use Drizzle ORM for all database operations
- All DB functions are in `src/db/index.ts`
- Use `eq`, `and`, `sql` from `drizzle-orm` for queries
- Always update timestamps when modifying cart records
- Use `.onConflictDoUpdate()` for upsert operations (cart items)

### Styling
- Use Tailwind CSS for all styling
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use shadcn/ui components from `@/components/ui/...`
- Use Lucide React for icons: `import { ShoppingCart } from "lucide-react"`
- Size utilities: `size-5`, `h-8`, `w-8`, `min-w-8`, etc.

### Route Structure
- Routes defined with `createFileRoute()`
- Export `Route` constant containing component, loader, and config
- Use `staleTime: Infinity` to disable SWR when appropriate
- Set `ssr: false` for client-only routes (like cart)

### UI Components
- Use class-variance-authority (cva) for component variants
- Use Radix UI primitives through shadcn/ui
- Support `asChild` prop for composition patterns
- Use `data-slot` attributes for styling hooks

### Comments and Documentation
- Keep code self-documenting; only add comments when necessary
- Use `// biome-ignore` directives when intentionally breaking a rule
- No TODO comments in production code

### File Structure
- `src/components/` - React components
  - `components/ui/` - shadcn/ui components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions
- `src/routes/` - TanStack Router routes
- `src/db/` - Database schema and queries
- `src/integrations/` - Third-party integrations (devtools)

## Testing
- Tests use Vitest with @testing-library/react
- Test files should be co-located with source files using `.test.ts` or `.test.tsx` suffix
- Currently no tests exist in the codebase - add tests when appropriate

## Environment
- Uses pnpm as package manager
- Database: PostgreSQL via Neon Serverless
- ORM: Drizzle ORM
- Build tool: Vite with TanStack Start plugin
