import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Login" />
            <div className="fixed inset-0 bg-gray-50 flex overflow-hidden">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-white flex-col items-center justify-center px-12">
                    <div className="text-center">
                        <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-24 mb-4 mx-auto" />
                        <h1 className="text-5xl font-bold text-gray-900 mb-2">CRAVE</h1>
                        <p className="text-sm text-gray-500 font-semibold">Digital Advertising Supplies and Services</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                    <div className="w-full max-w-md border-2 border-red-600 rounded-lg p-8 bg-white shadow-lg">
                        {/* Form Header */}
                        <div className="text-center mb-8">
                            <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-12 mb-6 mx-auto" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
                            <p className="text-gray-600">Enter your credentials to continue</p>
                        </div>

                        {/* Error Messages */}
                        {(errors.email || errors.password) && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-1">
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="test@example.com"
                                    className="bg-gray-100 border-red-400 focus:border-red-600 focus:ring-red-400 focus:ring-2"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-gray-100 pr-10 border-red-400 focus:border-red-600 focus:ring-red-400 focus:ring-2"
                                    />
                                    <button
                                        type="button"
                                        name="password_toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="remember" className="w-4 h-4 rounded" />
                                    <span className="text-sm text-gray-700">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-red-600 hover:text-red-700 font-semibold">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 mt-6"
                            >
                                {processing ? 'Signing in...' : 'Login'}
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <p className="text-center text-gray-600 mt-6 text-sm">
                            Don't have an account?{' '}
                            <a href={route('register')} className="text-red-600 hover:text-red-700 font-semibold">
                                Register
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
