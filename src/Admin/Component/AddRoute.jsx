// AddRoute.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Route as RouteIcon,
    MapPin,
    Edit,
    Trash2,
    Loader2,
    CheckCircle2,
    ArrowRight,
    Hash,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import useAllRoute from '../Hooks/useAllRoute';

const API_BASE = import.meta.env.VITE_BASE_URL;

const AddRoute = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        route_name: '',
        from_location: '',
        to_location: '',
        route_id_num: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { routeRefetch } = useAllRoute();

    // ── Fetch all routes ──────────────────────────────────────────
    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/routes`);
            if (!res.ok) throw new Error('Failed to fetch routes');
            const data = await res.json();
            setRoutes(data);
        } catch (err) {
            console.error(err);
            toast.error('Could not load routes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // ── Form handlers ─────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            route_name: '',
            from_location: '',
            to_location: '',
            route_id_num: '',
        });
        setEditingId(null);
    };

    // ── Submit (Create or Update) ─────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.route_name.trim() ||
            !formData.from_location.trim() ||
            !formData.to_location.trim() ||
            !formData.route_id_num.trim()
        ) {
            toast.error('All fields are required');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            route_name: formData.route_name.trim(),
            from_location: formData.from_location.trim(),
            to_location: formData.to_location.trim(),
            route_id_num: formData.route_id_num.trim(),
        };

        try {
            let res;
            let message;

            if (editingId) {
                res = await fetch(`${API_BASE}/route/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                message = 'Route updated successfully!';
            } else {
                res = await fetch(`${API_BASE}/routes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                message = 'Route added successfully!';
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Operation failed');
            }

            toast.success(message, { icon: <CheckCircle2 className="text-green-500" /> });
            resetForm();
            fetchRoutes();
            routeRefetch();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Edit route ────────────────────────────────────────────────
    const handleEdit = (route) => {
        setFormData({
            route_name: route.route_name || '',
            from_location: route.from_location || '',
            to_location: route.to_location || '',
            route_id_num: route.route_id_num || '',
        });
        setEditingId(route._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Delete route ──────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;

        try {
            const res = await fetch(`${API_BASE}/route/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Route deleted');
            fetchRoutes();
            routeRefetch();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete route');
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors toastOptions={{ duration: 4000 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 pb-12"
            >
                <AdminHeader
                    title="Manage Routes"
                    subtitle="Add, Edit, and Delete Routes"
                />

                <div className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Left — Form */}
                        <motion.div
                            className="bg-white order-2 lg:order-1 dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <RouteIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {editingId ? 'Edit Route' : 'Add New Route'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Route Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Route Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <RouteIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="route_name"
                                            value={formData.route_name}
                                            onChange={handleChange}
                                            placeholder="e.g. Dhaka - Rajshahi Express"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Route ID Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Route ID Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="route_id_num"
                                            value={formData.route_id_num}
                                            onChange={handleChange}
                                            placeholder="e.g. RT-1001"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* From & To — side by side */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* From Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            From Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                                            <input
                                                type="text"
                                                name="from_location"
                                                value={formData.from_location}
                                                onChange={handleChange}
                                                placeholder="e.g. Dhaka"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>

                                    {/* To Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            To Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500" />
                                            <input
                                                type="text"
                                                name="to_location"
                                                value={formData.to_location}
                                                onChange={handleChange}
                                                placeholder="e.g. Rajshahi"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Route Preview */}
                                {(formData.from_location || formData.to_location) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg"
                                    >
                                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.from_location || '—'}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0" />
                                        <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.to_location || '—'}
                                        </span>
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-4 pt-2">
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`
                                            flex-1 py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-all
                                            ${isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                                            }
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                {editingId ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : editingId ? (
                                            'Update Route'
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                Add Route
                                            </>
                                        )}
                                    </motion.button>

                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>

                        {/* Right — Stats + List */}
                        <div className="space-y-6 order-1 lg:order-2">

                            {/* Total count card */}
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Available Routes</p>
                                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                                    {loading ? '...' : routes.length}
                                </p>
                            </div>

                            {/* Routes list */}
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Recent Routes</h3>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-6 text-center text-gray-500">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading...
                                        </div>
                                    ) : routes.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500">No routes yet</div>
                                    ) : (
                                        routes.map(route => (
                                            <div
                                                key={route._id}
                                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Route Name + ID */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                {route.route_name}
                                                            </p>
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-xs font-mono">
                                                                <Hash className="h-3 w-3" />
                                                                {route.route_id_num}
                                                            </span>
                                                        </div>

                                                        {/* From → To */}
                                                        <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                            <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                            <span>{route.from_location}</span>
                                                            <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                            <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                                            <span>{route.to_location}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleEdit(route)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                        >
                                                            <Edit size={17} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(route._id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AddRoute;