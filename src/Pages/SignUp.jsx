// src/pages/auth/SignUp.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
    Eye, EyeOff, Mail, Lock, User, ArrowRight,
    CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from './AuthLayout';

// Zod schema with password strength rules
const signUpSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signUpSchema),
        mode: 'onTouched',
    });

    const password = watch('password') || '';

    // Password strength calculation
    const getPasswordStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const strength = getPasswordStrength();
    const strengthText = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Great'][strength - 1] || 'Very Weak';
    const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'][strength - 1] || 'bg-gray-300';

    // Fake async submission
    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError('');

        try {
            // Simulate API call
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.2) {
                        resolve();
                        alert('Account created successfully!');
                    } else {
                        reject(new Error('Email already exists'));
                    }
                }, 2000);
            });
        } catch (err) {
            setServerError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start shopping with exclusive benefits today"
            isSignUp={true}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            placeholder="Alex"
                            {...register('firstName')}
                            className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <XCircle size={14} /> {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            placeholder="Smith"
                            {...register('lastName')}
                            className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <XCircle size={14} /> {errors.lastName.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email')}
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-3">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">{strengthText}</span>
                                <span className="text-gray-500">{strength}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(strength / 5) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                    className={`h-full ${strengthColor} transition-all`}
                                />
                            </div>
                        </div>
                    )}

                    {errors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword')}
                            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3">
                    <Checkbox id="terms" {...register('terms')} />
                    <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                        I agree to the{' '}
                        <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
                    </Label>
                </div>
                {errors.terms && (
                    <p className="text-sm text-red-600 flex items-center gap-1 -mt-3">
                        <XCircle size={14} /> {errors.terms.message}
                    </p>
                )}

                {/* Server Error */}
                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span className="text-sm">{serverError}</span>
                    </div>
                )}

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/signin" className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
                        Sign in
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
}