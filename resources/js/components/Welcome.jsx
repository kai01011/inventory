import React from 'react'
import { Button } from '@/components/ui/button'

/**
 * Welcome component example showing how to use shadcn/ui with Inertia
 * @returns {JSX.Element}
 */
export default function Welcome() {
  const [count, setCount] = React.useState(0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Your App</h2>
        <p className="mt-2 text-gray-600">
          This component demonstrates Inertia, React, Tailwind, and shadcn/ui working together.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Counter Example</h3>
          <p className="mt-1 text-sm text-gray-500">
            This shows React state management with a shadcn/ui Button.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-gray-900">{count}</div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setCount(c => c - 1)}
            >
              Decrease
            </Button>
            <Button 
              onClick={() => setCount(c => c + 1)}
            >
              Increase
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900">Next Steps</h4>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc list-inside">
          <li>Add more shadcn/ui components to <code>resources/js/components/ui/</code></li>
          <li>Create pages in <code>resources/js/Pages/</code></li>
          <li>Customize layouts in <code>resources/js/Layouts/</code></li>
          <li>Style with Tailwind utility classes</li>
        </ul>
      </div>
    </div>
  )
}
