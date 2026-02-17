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
    Bus,
    Plus,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import useAllCountar from '../Hooks/useAllCountar';
import useAllRoute from '../Hooks/useAllRoute';

const AddNewCounter = () => {
    const [form, setForm] = useState({
        name: '',
        id: '',
        location: '',
        password: '',
        confirmPassword: '',
        status: 'active',
        route: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { refetch } = useAllCountar();
    const { allRoutes, routeLoading } = useAllRoute();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.values(form).some((val) => !val && val !== 'active')) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading('Creating counter...');

        try {
            const payload = {
                counterName: form.name.trim(),
                counterID: form.id.trim(),
                counterLocation: form.location.trim(),
                password: form.password,
                status: form.status,
                selectedRoute: form.route,
                createdAt: new Date().toISOString(),
                role: 'counter',
            };

            await axios.post(`${import.meta.env.VITE_BASE_URL}/user`, payload);

            toast.dismiss(loadingToast);
            toast.success('Counter created successfully', {
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            });

            refetch();

            // Reset form
            setForm({
                name: '',
                id: '',
                location: '',
                password: '',
                confirmPassword: '',
                status: 'active',
                route: '',
            });
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || 'Failed to create counter');
        } finally {
            setSubmitting(false);
        }
    };

    if (routeLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-3xl px-4 py-8"
        >
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                {/* Header - very minimal */}
                <div className="border-b bg-gray-50/80 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                            <Bus className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Add New Counter</h1>
                            <p className="mt-0.5 text-sm text-gray-500">
                                Register a new ticket counter
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Counter Name
                            </label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    placeholder="e.g. Mirpur Counter"
                                    required
                                />
                            </div>
                        </div>

                        {/* ID */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Counter ID
                            </label>
                            <div className="relative">
                                <Hash className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="id"
                                    value={form.id}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    placeholder="CTR-001"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    placeholder="Mirpur-10, Dhaka"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Status & Route */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Route
                            </label>
                            <div className="relative">
                                <Bus className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="route"
                                    value={form.route}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-lg border border-gray-300 pl-10 pr-8 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select route...</option>
                                    {allRoutes?.map((r) => (
                                        <option key={r.routeName} value={r.routeName}>
                                            {r.routeName} — {r.routeCode}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`
                flex w-full items-center justify-center gap-2 rounded-lg 
                bg-emerald-600 px-6 py-3 font-medium text-white 
                transition-colors hover:bg-emerald-700 
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:bg-emerald-400
              `}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Create Counter
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <p className="mt-8 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Transport Management
            </p>
        </motion.div>
    );
};

export default AddNewCounter;