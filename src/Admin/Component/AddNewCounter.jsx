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
        canCancelBooking: false,          // ← NEW FIELD
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { refetch } = useAllCountar();
    const { allRoutes, routeLoading } = useAllRoute();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check required fields (excluding checkbox)
        const requiredFields = ['name', 'id', 'location', 'password', 'confirmPassword', 'route'];
        if (requiredFields.some(field => !form[field]?.toString().trim())) {
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
                canCancelBooking: form.canCancelBooking,     // ← NEW FIELD sent to backend
                createdAt: new Date().toISOString(),
                role: 'counter',
            };

            await axios.post(`${import.meta.env.VITE_BASE_URL}/user`, payload);

            toast.dismiss(loadingToast);
            toast.success('Counter created successfully', {
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            });

            refetch();
            setForm({
                name: '',
                id: '',
                location: '',
                password: '',
                confirmPassword: '',
                status: 'active',
                route: '',
                canCancelBooking: false,
            });
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (routeLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/70 pb-12 pt-6 sm:pt-10">
            <div className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:max-w-2xl">
                {/* Card */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    {/* Header */}
                    <div className="border-b bg-gray-50 px-5 py-6 sm:px-7 sm:py-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <Bus className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                                    Add New Counter
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Fill in the details for the new counter
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 px-5 py-6 sm:px-7 sm:py-8">
                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Counter Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-11 py-3 text-base placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
                                    placeholder="e.g. Mirpur Counter"
                                    required
                                    autoCapitalize="words"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Counter ID */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Counter ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        name="id"
                                        value={form.id}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-11 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
                                        placeholder="CTR-001"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-11 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
                                        placeholder="e.g. Mirpur-10, Dhaka"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-11 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-11 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Route */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Route <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Bus className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="route"
                                        value={form.route}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-lg border border-gray-300 px-11 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:py-2.5"
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

                        {/* NEW FIELD - Checkbox */}
                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="canCancelBooking"
                                    checked={form.canCancelBooking}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Counter is allowed to cancel bookings
                                </span>
                            </label>
                            <p className="mt-1 ml-8 text-xs text-gray-500">
                                If checked, this counter can cancel passenger bookings
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`
                  flex w-full items-center justify-center gap-2.5 rounded-lg 
                  bg-emerald-600 px-6 py-3.5 text-base font-medium text-white 
                  transition-colors hover:bg-emerald-700 focus:outline-none 
                  focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                  disabled:cursor-not-allowed disabled:bg-emerald-400
                  sm:py-3
                `}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} />
                                        Add Counter
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewCounter;