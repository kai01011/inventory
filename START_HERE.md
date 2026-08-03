# 🚀 Laravel + Inertia + React + Tailwind + shadcn/ui

## ✅ Your setup is complete and ready to use!

---

## Quick Start (2 minutes)

### Step 1: Start Laravel Server
Open a terminal and run:
```bash
php artisan serve
```
This starts your backend on **http://localhost:8000**

### Step 2: Start Vite Dev Server
Open another terminal and run:
```bash
npm run dev
```
This handles React hot reloading and builds your frontend

### Step 3: Visit Your App
Open your browser and go to:
```
http://localhost:8000
```

**You should see the Welcome page with an interactive counter!**

---

## What You Have

✅ **Laravel 13** - Backend framework  
✅ **React 19** - Frontend library  
✅ **Inertia.js** - Connects Laravel & React seamlessly  
✅ **Tailwind CSS 4** - Styling  
✅ **shadcn/ui** - Beautiful components  
✅ **Vite** - Lightning-fast builds  

All components work together perfectly.

---

## Where Things Go

```
📁 Your App
├── 📁 resources/js/
│   ├── Pages/          ← Create page components here
│   ├── Layouts/        ← Page wrappers
│   ├── components/     ← Reusable components
│   │   └── ui/        ← shadcn/ui components
│   └── app.jsx        ← Entry point
├── 📁 routes/
│   └── web.php        ← Define your routes here
├── 📁 app/
│   └── Http/          ← Controllers & middleware
└── 📁 resources/views/
    └── app.blade.php  ← HTML shell for Inertia
```

---

## Common Tasks

### Create a New Page

**1. Create the page component** (`resources/js/Pages/About.jsx`):
```jsx
import AppLayout from '@/Layouts/AppLayout'

export default function About() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">About</h1>
      <p className="text-gray-600">This is the about page</p>
    </AppLayout>
  )
}
```

**2. Add the route** (`routes/web.php`):
```php
use Inertia\Inertia;

Route::get('/about', fn() => Inertia::render('About'));
```

**3. Link to it** in your navigation:
```jsx
import { Link } from '@inertiajs/react'

<Link href="/about" className="text-blue-600">About</Link>
```

Done! Visit `http://localhost:8000/about`

---

### Use shadcn/ui Components

```jsx
import { Button } from '@/components/ui/button'

export default function MyPage() {
  return (
    <Button variant="outline">Click me</Button>
  )
}
```

Button is already set up. For more components, copy them from [ui.shadcn.com](https://ui.shadcn.com) into `resources/js/components/ui/`

---

### Style With Tailwind

```jsx
<div className="flex gap-4 p-6 bg-white rounded-lg shadow-lg">
  <p className="text-lg font-bold text-gray-900">Hello World</p>
</div>
```

Tailwind classes work everywhere. [Full reference →](https://tailwindcss.com/docs)

---

### Pass Data from Laravel to React

**Route** (`routes/web.php`):
```php
Route::get('/posts', fn() => 
  Inertia::render('Posts', [
    'posts' => Post::all()
  ])
);
```

**Page** (`resources/js/Pages/Posts.jsx`):
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

## Documentation

We've created helpful guides:

| File | Purpose |
|------|---------|
| `START_HERE.md` | ← You are here |
| `QUICK_REFERENCE.md` | Common patterns & examples |
| `SETUP.md` | Complete setup details |
| `INSTALLATION_COMPLETE.md` | What's installed & next steps |
| `VERSIONS.md` | All versions & dependencies |

---

## Debugging Tips

### Page not showing?
- Check browser console (F12 → Console tab)
- Check if both servers are running:
  - `php artisan serve` should be running
  - `npm run dev` should be running
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Component not working?
- Check browser console for React errors
- Check terminal where `npm run dev` is running
- Check Laravel logs: `php artisan pail`

### Styling not applied?
- Verify class names are spelled correctly
- Check Tailwind has loaded (should see styles in browser)
- Hard refresh browser cache

---

## Key Commands

```bash
# Start development
npm run dev           # Terminal 1
php artisan serve     # Terminal 2

# Build for production
npm run build

# Laravel commands
php artisan tinker    # PHP REPL
php artisan migrate   # Run migrations
php artisan make:controller NameController

# Database
php artisan db:seed   # Seed database
php artisan db:fresh  # Reset & seed

# Check your work
npm run build         # Production build
composer test         # Run tests
```

---

## What's Next?

1. **Read the guides** - Check `QUICK_REFERENCE.md` for common patterns
2. **Build a feature** - Create a simple CRUD app
3. **Add components** - Copy more from [ui.shadcn.com](https://ui.shadcn.com)
4. **Style it** - Use Tailwind classes
5. **Connect to database** - Use Laravel to fetch/save data
6. **Deploy** - Push to production

---

## Need Help?

### Official Docs
- [Inertia.js Docs](https://inertiajs.com)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Laravel Docs](https://laravel.com/docs)

### Common Issues
- Port already in use? → `php artisan serve --port=8001`
- Module not found? → Check path uses `@/` alias
- Components not loading? → Verify both servers are running

---

## You're Ready! 🎉

Your development environment is fully configured with modern tools and best practices. Start building amazing applications!

**Next step:** Open two terminals and run:
```bash
php artisan serve     # Terminal 1
npm run dev          # Terminal 2
```

Then visit **http://localhost:8000**

Happy coding! 🚀
