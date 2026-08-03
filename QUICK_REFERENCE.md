# Quick Reference Guide

## Start Development

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Visit **http://localhost:8000**

---

## File Organization

```
resources/js/
├── Pages/          ← Create pages here (routes)
├── Layouts/        ← Page templates
├── components/
│   └── ui/        ← shadcn/ui components
└── lib/           ← Utilities
```

---

## Creating a Page

**File**: `resources/js/Pages/About.jsx`
```jsx
import AppLayout from '@/Layouts/AppLayout'

export default function About() {
  return (
    <AppLayout>
      <h1>About Page</h1>
    </AppLayout>
  )
}
```

**Route**: `routes/web.php`
```php
use Inertia\Inertia;

Route::get('/about', fn() => Inertia::render('About'));
```

---

## Using shadcn/ui Components

```jsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function MyPage() {
  return (
    <div className="space-y-4">
      <Button variant="outline">Click me</Button>
      <Card>
        <div className="p-6">Content</div>
      </Card>
    </div>
  )
}
```

---

## Tailwind Styling

```jsx
// Use utility classes
<div className="flex gap-4 p-6 bg-white rounded-lg shadow">
  <p className="text-lg font-bold text-gray-900">Hello</p>
</div>
```

---

## React State & Events

```jsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  )
}
```

---

## Passing Data from Laravel to React

**Route** (`routes/web.php`):
```php
Route::get('/posts', fn() => 
  Inertia::render('Posts', [
    'posts' => Post::all()
  ])
);
```

**Component** (`resources/js/Pages/Posts.jsx`):
```jsx
export default function Posts({ posts }) {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

---

## Navigation with Inertia

```jsx
import { Link } from '@inertiajs/react'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/posts">Posts</Link>
    </nav>
  )
}
```

---

## Adding New shadcn/ui Components

1. Go to [ui.shadcn.com](https://ui.shadcn.com)
2. Find the component you want
3. Copy the JSX code
4. Create file in `resources/js/components/ui/component-name.jsx`
5. Paste code
6. Import and use in your pages

**Example**: Adding Card component
```jsx
// resources/js/components/ui/card.jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
```

---

## Building for Production

```bash
npm run build
```

Then deploy with:
```bash
git push heroku main  # or your deployment command
```

---

## Debugging

**Browser Console**
- Open DevTools (F12)
- Check Console for React errors
- Use Network tab to see API calls

**Laravel**
```bash
php artisan tinker
# Query database directly
Post::all();
```

---

## Common Patterns

### Form Submission
```jsx
import { useForm } from '@inertiajs/react'

export default function CreatePost() {
  const { data, setData, post, processing } = useForm({
    title: '',
    body: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/posts')
  }

  return (
    <form onSubmit={submit}>
      <input
        value={data.title}
        onChange={(e) => setData('title', e.target.value)}
      />
      <button disabled={processing}>Save</button>
    </form>
  )
}
```

### Conditional Rendering
```jsx
export default function Dashboard({ user }) {
  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  )
}
```

### Lists with Keys
```jsx
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

---

## Useful Commands

```bash
# Create a new controller
php artisan make:controller PostController

# Create a migration
php artisan make:migration create_posts_table

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Check routes
php artisan route:list

# Install a package
npm install package-name
composer require vendor/package
```

---

## Tailwind Utilities Cheat Sheet

```jsx
// Spacing
<div className="p-4 m-2">  {/* padding, margin */}
<div className="px-4 py-2"> {/* x/y padding */}

// Colors
<div className="text-red-600 bg-blue-100 border-green-500">

// Typography
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-gray-600 leading-relaxed">Text</p>

// Layout
<div className="flex gap-4">         {/* flexbox */}
<div className="grid grid-cols-3">   {/* grid */}
<div className="flex justify-between items-center"> {/* alignment */}

// Sizing
<div className="w-full h-32">        {/* width, height */}
<img className="w-16 h-16" />       {/* square */}

// Responsive
<div className="text-sm md:text-lg lg:text-2xl">

// State
<button className="hover:bg-blue-600 active:bg-blue-800 disabled:opacity-50">

// Shadows & Borders
<div className="shadow-lg rounded-lg border-2 border-gray-300">
```

---

## Resources

- [Full Setup Docs](./SETUP.md)
- [Installation Complete](./INSTALLATION_COMPLETE.md)
- [Inertia Docs](https://inertiajs.com)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Docs](https://react.dev)

---

## Need Help?

1. Check the browser console (F12)
2. Check the Laravel logs: `php artisan pail`
3. Read the official docs for each tool
4. Make sure both `php artisan serve` and `npm run dev` are running
