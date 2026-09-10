import { Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    if (auth.user) {
        window.location.href = route('dashboard');
        return null;
    }

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900">Hello</h1>
                </div>
            </div>
        </>
    );
}

