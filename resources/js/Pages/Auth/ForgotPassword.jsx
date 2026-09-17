import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-[440px] border border-gray-200 rounded-lg p-7 sm:p-8 bg-white shadow-sm">
                    <div className="text-center mb-8">
                        <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-10 mb-4 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                    </div>

                    <div className="mb-4 text-sm text-gray-600">
                        No problem. Just let us know your email address and we will email you a password reset link that will
                        allow you to choose a new one.
                    </div>

                    {status && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <a href={route('login')} className="text-sm text-red-600 hover:text-red-700 font-semibold">
                                Back to Login
                            </a>
                            <PrimaryButton className="ms-4" disabled={processing}>
                                Email Password Reset Link
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
