'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    User,
    Hash,
    MapPin,
    Lock,
    Eye,
    EyeOff,
    Route as RouteIcon,
    PlusCircle,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import useAllCountar from '../Hooks/useAllCountar';

const AddNewCounter = () => {
    const [counterName, setCounterName] = useState('');
    const [counterID, setCounterID] = useState('');
    const [counterLocation, setCounterLocation] = useState('');
    const [counterPassword, setCounterPassword] = useState('');
    const [counterConfirmPassword, setCounterConfirmPassword] = useState('');
    const [counterStatus, setCounterStatus] = useState('active');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { refetch } = useAllCountar();

    const startDate = new Date();

    // Sample routes
    const routes = [
        { value: '11', label: 'রুট ১১' },
        { value: '12', label: 'রুট ১২' },
        { value: '23', label: 'রুট ২৩' },
        { value: '45', label: 'রুট ৪৫' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.loading('কাউন্টার যোগ করা হচ্ছে...');

        if (!counterName || !counterID || !counterLocation || !counterPassword || !counterConfirmPassword || !selectedRoute) {
            toast.dismiss();
            toast.error('সবগুলো ফিল্ড পূরণ করুন!');
            return;
        }

        if (counterPassword !== counterConfirmPassword) {
            toast.dismiss();
            toast.error('পাসওয়ার্ড মিলছে না!');
            return;
        }

        setLoading(true);

        const formData = {
            counterName,
            counterID,
            counterLocation,
            password: counterPassword,
            status: counterStatus,
            selectedRoute,
            createdAt: startDate.toISOString(),
            role: 'counter',
        };

        const res = axios.post(`${import.meta.env.VITE_BASE_URL}/user`, formData);
        if (res) {
            toast.dismiss();
            toast.success('কাউন্টার সফলভাবে যোগ করা হয়েছে!', {
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            });
            refetch();

            // Reset form
            setCounterName('');
            setCounterID('');
            setCounterLocation('');
            setCounterPassword('');
            setCounterConfirmPassword('');
            setCounterStatus('active');
            setSelectedRoute('');
            setLoading(false);
        }
        else {
            toast.dismiss();
            toast.error('কাউন্টার যোগ করা যায়নি!', {
                icon: <CheckCircle2 className="w-5 h-5 text-red-500" />,
            });
            setLoading(false);
        }

    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full  mx-auto mt-6"
        >
            <div className="bg-white border border-emerald-100 rounded-3xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-10 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl">
                            <PlusCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">নতুন কাউন্টার যোগ করুন</h2>
                            <p className="text-emerald-100 mt-1">কাউন্টারের সকল তথ্য সঠিকভাবে দিন</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Counter Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">কাউন্টারের নাম</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={counterName}
                                    onChange={(e) => setCounterName(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-zinc-400"
                                    placeholder="যেমন: মিরপুর কাউন্টার"
                                    required
                                />
                            </div>
                        </div>

                        {/* Counter ID */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">কাউন্টার আইডি</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={counterID}
                                    onChange={(e) => setCounterID(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-zinc-400"
                                    placeholder="CTR-001"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">অবস্থান</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={counterLocation}
                                    onChange={(e) => setCounterLocation(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-zinc-400"
                                    placeholder="মিরপুর-১০, ঢাকা"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">পাসওয়ার্ড</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={counterPassword}
                                    onChange={(e) => setCounterPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">পাসওয়ার্ড নিশ্চিত করুন</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={counterConfirmPassword}
                                    onChange={(e) => setCounterConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">স্ট্যাটাস</label>
                            <select
                                value={counterStatus}
                                onChange={(e) => setCounterStatus(e.target.value)}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Route */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">রুট নির্বাচন করুন</label>
                            <div className="relative">
                                <RouteIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                                    required
                                >
                                    <option value="">রুট নির্বাচন করুন</option>
                                    {routes.map((route) => (
                                        <option key={route.value} value={route.value}>
                                            {route.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        type="submit"
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                কাউন্টার যোগ করা হচ্ছে...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="w-6 h-6" />
                                কাউন্টার যোগ করুন
                            </>
                        )}
                    </motion.button>
                </form>
            </div>

            <p className="text-center text-zinc-400 text-sm mt-6">
                সকল তথ্য সুরক্ষিতভাবে সংরক্ষিত হবে
            </p>
        </motion.div>
    );
};

export default AddNewCounter;