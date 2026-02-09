// src/pages/auth/SignIn.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from './AuthLayout';

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Sign in to your account"
            subtitle="Enter your credentials to access your dashboard"
        >
            <form className="space-y-6">
                {/* Email field */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a
                            href="#"
                            className="text-sm text-emerald-600 hover:text-emerald-500 hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none cursor-pointer"
                    >
                        Remember me
                    </Label>
                </div>

                {/* Submit button */}
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-50/50 px-4 text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="gap-2">
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="h-4 w-4"
                        />
                        Google
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <img
                            src="https://github.githubassets.com/favicons/favicon.svg"
                            alt="GitHub"
                            className="h-4 w-4"
                        />
                        GitHub
                    </Button>
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a
                        href="/signup"
                        className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
                    >
                        Sign up
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
}