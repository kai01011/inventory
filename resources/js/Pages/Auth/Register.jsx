import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
                {/* Left Side - Branding (Desktop Only) */}
                <div className="hidden lg:flex lg:w-1/2 bg-white flex-col items-center justify-center px-12">
                    <div className="text-center">
                        <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-24 mb-4 mx-auto" />
                        <h1 className="text-5xl font-bold text-gray-900 mb-2">CRAVE</h1>
                        <p className="text-sm text-gray-500 font-semibold">Digital Advertising Supplies and Services</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-8 lg:py-0 overflow-y-auto lg:overflow-y-visible">
                    <div className="w-full max-w-[440px] border border-gray-200 rounded-lg p-7 sm:p-8 bg-white shadow-sm">
                        {/* Form Header */}
                        <div className="text-center mb-8">
                            {/* Logo - Mobile only */}
                            <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-10 mb-4 mx-auto lg:hidden" />
                            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                        </div>

                        {/* Error Messages */}
                        {(errors.name || errors.email || errors.password || errors.password_confirmation) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg space-y-1">
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    className={`h-11 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </div>

                            {/* Email */}
                            <div className="pt-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className={`h-11 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </div>

                            {/* Password */}
                            <div className="pt-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className={`h-11 pr-11 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="pt-2">
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className={`h-11 pr-11 ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                                    >
                                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Register Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold h-11 mt-6"
                            >
                                {processing ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Sign In Link */}
                        <p className="text-center text-gray-600 mt-6 text-sm">
                            Already have an account?{' '}
                            <a href={route('login')} className="text-red-600 hover:text-red-700 font-semibold">
                                Log in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
