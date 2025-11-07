# Development Best Practices Guide

This guide outlines the coding standards and best practices for the PhinAccords project.

## Code Organization

### File Naming Conventions

- **Components**: PascalCase (`SongList.tsx`, `UserProfile.tsx`)
- **Utilities**: kebab-case (`song-cache.ts`, `error-handler.ts`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)
- **Types**: kebab-case (`song.ts`, `user.ts`)
- **Styles**: kebab-case (`globals.scss`, `responsive.scss`)

### Component Structure

Follow this order in every component:

```typescript
// 1. Imports
import React from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface Props {
  title: string
  onClick: () => void
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Memoized values
  const memoizedValue = useMemo(() => compute(), [deps])
  
  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 7. Handlers (use useCallback)
  const handleClick = useCallback(() => {
    onClick()
  }, [onClick])
  
  // 8. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  )
}
```

## TypeScript Best Practices

### Type Safety

- ✅ **DO**: Use strict TypeScript configuration
- ✅ **DO**: Define interfaces for all props
- ✅ **DO**: Use type guards for runtime checks
- ❌ **DON'T**: Use `any` type (use `unknown` if needed)
- ❌ **DON'T**: Ignore TypeScript errors

### Example Type Guard

```typescript
import { isSong } from '@/utils/type-guards'

function processSong(data: unknown) {
  if (isSong(data)) {
    // TypeScript knows data is Song here
    console.log(data.title)
  } else {
    throw new Error('Invalid song data')
  }
}
```

### Type Definitions

Always define types in separate files:

```typescript
// types/song.ts
export interface Song {
  id: string
  title: string
  artist: string
  // ... other fields
}
```

## Error Handling

### Always Use Try-Catch

```typescript
try {
  const response = await fetch('/api/songs')
  if (!response.ok) throw new Error('Failed to fetch')
  const data = await response.json()
  setSongs(data.songs)
} catch (error) {
  console.error('Error:', error)
  setError(getErrorMessage(error))
}
```

### Use Error Utilities

```typescript
import { safeAsync, getErrorMessage } from '@/utils/error-handler'

const { data, error } = await safeAsync(async () => {
  const response = await fetch('/api/songs')
  if (!response.ok) throw new Error('Failed to fetch')
  return await response.json()
})

if (error) {
  notifyError(getErrorMessage(error))
}
```

### User-Friendly Messages

Always provide clear, actionable error messages:

```typescript
// ❌ Bad
throw new Error('Error')

// ✅ Good
throw new ValidationError('Email is required', 'email')
```

## Performance Best Practices

### Memoization

Use `useMemo` for expensive calculations:

```typescript
const filteredSongs = useMemo(() => {
  return songs.filter(song => song.genre === selectedGenre)
}, [songs, selectedGenre])
```

Use `useCallback` for event handlers:

```typescript
const handleClick = useCallback(() => {
  onClick(id)
}, [id, onClick])
```

### Code Splitting

Use dynamic imports for large components:

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})
```

### Debouncing and Throttling

```typescript
import { useDebounce } from '@/utils/performance'

const debouncedSearch = useDebounce(
  (query: string) => {
    performSearch(query)
  },
  300,
  [query]
)
```

## Component Best Practices

### Accessibility

Always include:
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management
- Screen reader support

```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  aria-label="Submit form"
  tabIndex={0}
>
  Submit
</button>
```

### Loading States

Always show loading indicators:

```typescript
{loading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorState message={error} onRetry={handleRetry} />
) : (
  <Content />
)}
```

### Responsive Design

Use responsive utilities:

```typescript
import { getResponsiveClasses } from '@/utils/responsive'

<div className={getResponsiveClasses('col-12', 'col-md-6', 'col-lg-4')}>
  Content
</div>
```

## Testing Considerations

### Write Testable Code

- Separate business logic from UI
- Use pure functions where possible
- Make dependencies injectable

```typescript
// ✅ Testable
export function calculateRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length
}

// ❌ Not testable
export function RatingComponent() {
  const rating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  // ...
}
```

## Code Review Checklist

Before submitting code, ensure:

- [ ] TypeScript compiles without errors
- [ ] No `any` types used
- [ ] All async operations have error handling
- [ ] Components are accessible (ARIA labels, keyboard nav)
- [ ] Loading and error states are handled
- [ ] Code follows the component structure
- [ ] Performance optimizations applied (memoization, code splitting)
- [ ] No console.logs in production code
- [ ] Comments explain "why", not "what"

## Common Patterns

### API Calls

```typescript
const fetchSongs = useCallback(async () => {
  setLoading(true)
  setError(null)
  
  try {
    const response = await fetch('/api/songs')
    if (!response.ok) throw new Error('Failed to fetch')
    
    const data = await response.json()
    if (!isSongArray(data.songs)) {
      throw new Error('Invalid response format')
    }
    
    setSongs(data.songs)
  } catch (err) {
    const message = getErrorMessage(err)
    setError(message)
    notifyError(message)
  } finally {
    setLoading(false)
  }
}, [])
```

### Form Handling

```typescript
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return
  
  setSubmitting(true)
  
  try {
    await submitForm(formData)
    success('Form submitted successfully!')
  } catch (error) {
    notifyError(getErrorMessage(error))
  } finally {
    setSubmitting(false)
  }
}, [formData])
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Documentation](https://nextjs.org/docs)

