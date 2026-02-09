// src/components/AuthLayout.jsx
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function AuthLayout({
    children,
    title,
    subtitle,
    isSignUp = false,
}) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* LEFT - Branding / Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
                {/* Background patterns */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -left-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute right-10 bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center px-12 text-white w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <ShoppingBag className="h-12 w-12" />
                            <h1 className="text-4xl font-bold tracking-tight">ShopSphere</h1>
                        </div>

                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-3xl md:text-4xl font-bold mb-6"
                        >
                            {isSignUp ? "Join our growing community" : "Welcome back!"}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="text-lg text-emerald-100/90 max-w-md mx-auto"
                        >
                            {isSignUp
                                ? "Discover exclusive deals, fast delivery, and a shopping experience tailored just for you."
                                : "Log in to access your wishlist, track orders, and continue shopping seamlessly."}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="mt-12 flex flex-col items-center gap-4"
                        >
                            <div className="flex gap-6 text-sm opacity-80">
                                <span>✓ Free shipping over $50</span>
                                <span>✓ 30-day returns</span>
                                <span>✓ 24/7 support</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50/50 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                        <p className="mt-2 text-gray-600">{subtitle}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
}