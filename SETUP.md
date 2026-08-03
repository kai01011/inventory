# Laravel Inertia React + Tailwind + shadcn/ui Setup

This project is configured with:

- **Laravel 13** - PHP web framework
- **Inertia.js** - Modern SPA framework for Laravel
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components

## Quick Start

### 1. Install Dependencies

```bash
# Composer dependencies (PHP)
composer install

# NPM dependencies (JavaScript)
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

### 3. Database (Optional)

```bash
# Run migrations
php artisan migrate
```

### 4. Development

In separate terminals, run:

```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Start Vite dev server
npm run dev
```

Visit `http://localhost:8000` to see your app.

### 5. Building for Production

```bash
npm run build
```

## Project Structure

```
resources/
├── js/
│   ├── app.jsx                 # Main entry point
│   ├── bootstrap.js            # Axios setup
│   ├── Pages/                  # Inertia pages (routes)
│   │   └── Home.jsx           # Example page
│   ├── Layouts/               # Layout components
│   │   └── AppLayout.jsx      # Default layout
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   │       └── button.jsx     # Example component
│   └── lib/
│       └── utils.js           # Utility functions
└── css/
    └── app.css                # Tailwind directives
```

## Adding shadcn/ui Components

The Button component is included as an example. To add more components from shadcn/ui:

1. Copy component files from shadcn/ui examples into `resources/js/components/ui/`
2. Import and use them in your pages or layouts

Example:
```jsx
import { Button } from '@/components/ui/button'

export default function MyPage() {
  return <Button>Click me</Button>
}
```

## Creating Pages

Pages go in `resources/js/Pages/` and automatically become routes:

```jsx
// resources/js/Pages/About.jsx
import AppLayout from '@/Layouts/AppLayout'

export default function About() {
  return (
    <AppLayout>
      <h1>About</h1>
    </AppLayout>
  )
}
```

Then create a route in `routes/web.php`:
```php
use Inertia\Inertia;

Route::get('/about', fn() => Inertia::render('About'));
```

## Key Features

- **Hot Module Replacement**: Changes appear instantly during development
- **Type-Safe Components**: Use JSDoc for type hints in JS files
- **Tailwind Utilities**: Full Tailwind CSS with customization support
- **shadcn/ui Components**: Production-ready component library
- **Inertia Links**: Use `Link` from `@inertiajs/react` for navigation

## Resources

- [Inertia.js Docs](https://inertiajs.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Laravel Docs](https://laravel.com/docs)
