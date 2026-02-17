'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Search,
    RefreshCw,
    Edit,
    Trash2,
    X,
    Save,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Lock,
    User,
    MapPin,
    ShieldCheck,
    UserCog,
} from 'lucide-react';
import axios from 'axios';
import useAllCountar from '../Hooks/useAllCountar';

const ITEMS_PER_PAGE = 15;

const AllCounters = () => {
    const { refetch, isLoading, allCountar = [] } = useAllCountar();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedCounter, setSelectedCounter] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const baseUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const filteredCounters = useMemo(() => {
        return allCountar.filter((c) => {
            const matchesSearch =
                !searchTerm ||
                c.counterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.counterID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.counterLocation?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allCountar, searchTerm, statusFilter]);

    const totalItems = filteredCounters.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredCounters.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ─── Edit ───
    const openEdit = (counter) => {
        setSelectedCounter(counter);
        setEditForm({ ...counter });
        setNewPassword('');
        setConfirmPassword('');
        setShowNewPass(false);
        setShowConfirmPass(false);
        setIsEditOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedCounter?._id) return;

        if (newPassword || confirmPassword) {
            if (newPassword.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
        }

        setSaving(true);
        const toastId = toast.loading('Updating...');

        try {
            const payload = { ...editForm };
            if (newPassword) payload.password = newPassword;

            await axios.patch(`${baseUrl}/user/${selectedCounter._id}`, payload);

            toast.success('Counter updated successfully', { id: toastId });
            refetch();
            setIsEditOpen(false);
        } catch (err) {
            toast.error('Update failed', { id: toastId });
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // ─── Delete ───
    const openDelete = (counter) => {
        setSelectedCounter(counter);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCounter?._id) return;

        setDeleting(true);
        const toastId = toast.loading('Deleting...');

        try {
            await axios.delete(`${baseUrl}/user/${selectedCounter._id}`);
            toast.success('Counter deleted', { id: toastId });
            refetch();
            setIsDeleteOpen(false);
        } catch (err) {
            toast.error('Delete failed', { id: toastId });
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header + Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Counters & Admins</h1>
                <button
                    onClick={() => {
                        refetch();
                        toast.success('Data refreshed');
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 pl-10 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:w-44"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Mobile Card View + Desktop Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3.5 text-left font-semibold text-gray-700">Name</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-gray-700">ID</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-gray-700">Location</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-gray-700">Role</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-gray-700">Status</th>
                                <th className="px-5 py-3.5 text-right font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-500">
                                        No counters found
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((c) => (
                                    <tr key={c._id} className="border-t hover:bg-gray-50">
                                        <td className="px-5 py-4 font-medium">{c.counterName}</td>
                                        <td className="px-5 py-4 font-mono text-emerald-700">{c.counterID}</td>
                                        <td className="px-5 py-4 text-gray-600">{c.counterLocation}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${c.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {c.role || 'counter'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                                    }`}
                                            >
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => openEdit(c)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => openDelete(c)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                    {currentItems.length === 0 ? (
                        <div className="py-16 text-center text-gray-500">No counters found</div>
                    ) : (
                        currentItems.map((c) => (
                            <div key={c._id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium">{c.counterName}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">{c.counterID}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(c)}
                                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => openDelete(c)}
                                            className="rounded p-2 text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-gray-500">Location</div>
                                        <div className="mt-0.5">{c.counterLocation}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Role</div>
                                        <div className="mt-0.5">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-full text-xs ${c.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {c.role || 'counter'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Status</div>
                                        <div className="mt-0.5">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-full text-xs ${c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                    }`}
                                            >
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-5 py-4 text-sm text-gray-600">
                        <div>
                            Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="rounded border p-2 disabled:opacity-40 hover:bg-gray-100"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="rounded border p-2 disabled:opacity-40 hover:bg-gray-100"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Edit Modal ─── */}
            <AnimatePresence>
                {isEditOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.96, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.96, y: 20 }}
                            className="w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                                <h2 className="text-xl font-semibold text-gray-900">Edit Counter</h2>
                                <button onClick={() => setIsEditOpen(false)} className="rounded p-2 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Counter Name</label>
                                    <input
                                        name="counterName"
                                        value={editForm.counterName || ''}
                                        onChange={handleEditChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Counter ID</label>
                                    <input
                                        name="counterID"
                                        value={editForm.counterID || ''}
                                        onChange={handleEditChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        name="counterLocation"
                                        value={editForm.counterLocation || ''}
                                        onChange={handleEditChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            name="status"
                                            value={editForm.status || 'active'}
                                            onChange={handleEditChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            name="role"
                                            value={editForm.role || 'counter'}
                                            onChange={handleEditChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="counter">Counter</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t pt-5">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-700">
                                        <Lock size={16} /> Reset Password (optional)
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label>
                                            <input
                                                type={showConfirmPass ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(false)}
                                        className="rounded-lg border px-5 py-2.5 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-400"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Delete Confirmation ─── */}
            <AnimatePresence>
                {isDeleteOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.94 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.94 }}
                            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-semibold text-rose-700">Confirm Delete</h2>
                            <p className="mt-3 text-gray-700">
                                Are you sure you want to delete <strong>{selectedCounter?.counterName}</strong>?
                            </p>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="rounded-lg border px-5 py-2.5 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 font-medium text-white hover:bg-rose-700 disabled:bg-rose-400"
                                >
                                    {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllCounters;