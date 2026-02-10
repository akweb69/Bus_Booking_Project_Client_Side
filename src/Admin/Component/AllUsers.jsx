'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Search,
    RefreshCw,
    Edit,
    Trash2,
    X,
    Save,
    Loader2,
    Shield,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Lock,
} from 'lucide-react';
import useAllCountar from '../Hooks/useAllCountar';

const ITEMS_PER_PAGE = 20;

const AllCounters = () => {
    const { refetch, isLoading, allCountar = [] } = useAllCountar();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Edit & Delete states
    const [selectedCounter, setSelectedCounter] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Password reset fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const base_url = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);

    // Filtering & Pagination
    const filteredCounters = useMemo(() => {
        return allCountar.filter((c) => {
            const searchMatch =
                !searchTerm ||
                c.counterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.counterID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.counterLocation?.toLowerCase().includes(searchTerm.toLowerCase());

            const roleMatch = roleFilter === 'all' || c.role === roleFilter;
            const statusMatch = statusFilter === 'all' || c.status === statusFilter;

            return searchMatch && roleMatch && statusMatch;
        });
    }, [allCountar, searchTerm, roleFilter, statusFilter]);

    const totalItems = filteredCounters.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPageItems = filteredCounters.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ────────────────────────────────────────────────
    // Edit Handlers
    // ────────────────────────────────────────────────
    const openEdit = (counter) => {
        setSelectedCounter(counter);
        setEditForm({ ...counter });
        setNewPassword('');
        setConfirmPassword('');
        setIsEditModalOpen(true);
    };

    const handleEditInput = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveChanges = async (e) => {
        e.preventDefault();
        if (!selectedCounter?._id) return;

        // Password validation (only if user tried to change it)
        if (newPassword || confirmPassword) {
            if (newPassword.length < 6) {
                toast.error('New password minimum six charecter');
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error('পাসওয়ার্ড মিলছে না');
                return;
            }
        }

        setSaving(true);
        const toastId = toast.loading('আপডেট করা হচ্ছে...');

        try {
            // Prepare payload – only include password if changed
            const payload = { ...editForm };
            if (newPassword) {
                payload.password = newPassword;
            }

            const res = await axios.patch(`${base_url}/user/${selectedCounter._id}`, payload);

            if (res.data.modifiedCount === 0 && !newPassword) {
                toast('কোনো পরিবর্তন হয়নি', { id: toastId, icon: 'ℹ️' });
            } else {
                toast.success('কাউন্টার আপডেট সফল হয়েছে!', { id: toastId });
            }

            refetch();
            setIsEditModalOpen(false);
        } catch (err) {
            toast.error('আপডেট ব্যর্থ হয়েছে', { id: toastId });
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // ────────────────────────────────────────────────
    // Delete Handlers (unchanged)
    // ────────────────────────────────────────────────
    const openDeleteConfirm = (counter) => {
        setSelectedCounter(counter);
        setIsDeleteModalOpen(true);
    };

    const performDelete = async () => {
        if (!selectedCounter?._id) return;

        setDeleting(true);
        const toastId = toast.loading('মুছে ফেলা হচ্ছে...');

        try {
            await axios.delete(`${base_url}/user/${selectedCounter._id}`);
            toast.success('কাউন্টার মুছে ফেলা হয়েছে', { id: toastId });
            refetch();
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('মুছতে ব্যর্থ হয়েছে', { id: toastId });
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-lg overflow-hidden mt-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold">All Counter and Admin</h2>
                    <button
                        onClick={() => {
                            refetch();
                            toast.success('তথ্য রিফ্রেশ করা হয়েছে');
                        }}
                        className="flex items-center gap-2 bg-white/20 px-5 py-3 rounded-xl hover:bg-white/30 transition-all"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b bg-emerald-50/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="নাম, আইডি বা লোকেশন..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:border-emerald-500 outline-none"
                    >
                        <option value="all">All Role</option>
                        <option value="counter">Counter Role</option>
                        <option value="admin">Admin Role</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:border-emerald-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-emerald-50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-emerald-800">Name</th>
                            <th className="px-6 py-4 font-semibold text-emerald-800">ID</th>
                            <th className="px-6 py-4 font-semibold text-emerald-800 hidden md:table-cell">Location</th>
                            <th className="px-6 py-4 font-semibold text-emerald-800">Role</th>
                            <th className="px-6 py-4 font-semibold text-emerald-800">Status</th>
                            <th className="px-6 py-4 font-semibold text-emerald-800 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPageItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-16 text-zinc-500">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            currentPageItems.map((counter) => (
                                <tr key={counter._id} className="border-b hover:bg-emerald-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{counter.counterName}</td>
                                    <td className="px-6 py-4 font-mono text-emerald-700">{counter.counterID}</td>
                                    <td className="px-6 py-4 hidden md:table-cell text-zinc-600 truncate max-w-xs">
                                        {counter.counterLocation}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                                            {counter.role || 'counter'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${counter.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}
                                        >
                                            {counter.status === 'active' ? 'Active ' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEdit(counter)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(counter)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t bg-emerald-50/20">
                    <div className="text-sm text-zinc-600">
                        {startIndex + 1} – {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} / {totalItems}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="p-2 rounded-lg border disabled:opacity-40 hover:bg-emerald-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-4 font-medium">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="p-2 rounded-lg border disabled:opacity-40 hover:bg-emerald-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 40 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-emerald-800">Edit Counter</h3>
                                <button onClick={() => setIsEditModalOpen(false)}>
                                    <X size={24} className="text-zinc-500 hover:text-zinc-800" />
                                </button>
                            </div>

                            <form onSubmit={saveChanges} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Counter Name</label>
                                    <input
                                        name="counterName"
                                        value={editForm.counterName || ''}
                                        onChange={handleEditInput}
                                        className="w-full px-4 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Counter ID</label>
                                    <input
                                        name="counterID"
                                        value={editForm.counterID || ''}
                                        onChange={handleEditInput}
                                        className="w-full px-4 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Counter Location</label>
                                    <input
                                        name="counterLocation"
                                        value={editForm.counterLocation || ''}
                                        onChange={handleEditInput}
                                        className="w-full px-4 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={editForm.status || 'active'}
                                            onChange={handleEditInput}
                                            className="w-full px-4 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Role</label>
                                        <select
                                            name="role"
                                            value={editForm.role || 'counter'}
                                            onChange={handleEditInput}
                                            className="w-full px-4 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                        >
                                            <option value="counter">Counter</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* ── Password Reset Section ── */}
                                <div className="pt-4 border-t">
                                    <h4 className="text-base font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                                        <Lock size={18} /> Password reset (optional)
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="block text-sm font-medium mb-1">New Password</label>
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="new password"
                                                className="w-full pl-10 pr-10 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-700"
                                            >
                                                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                                            <input
                                                type={showConfirmPass ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder=" confirm password"
                                                className="w-full pl-10 pr-10 py-3 border rounded-xl focus:border-emerald-500 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-700"
                                            >
                                                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-6 py-3 border rounded-xl hover:bg-zinc-50"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 min-w-[140px] justify-center"
                                    >
                                        {saving && <Loader2 className="animate-spin" size={18} />}
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-rose-700 mb-4">Are you sure?</h3>
                            <p className="mb-6 text-zinc-700">
                                You are about to delete <strong>{selectedCounter?.counterName}</strong>
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-6 py-3 border rounded-xl hover:bg-zinc-50"
                                >
                                    না
                                </button>
                                <button
                                    onClick={performDelete}
                                    disabled={deleting}
                                    className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-60 flex items-center gap-2"
                                >
                                    {deleting && <Loader2 className="animate-spin" size={18} />}
                                    Yes! Delete
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