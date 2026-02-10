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
    XCircle,
    X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import useAllRoute from '../Hooks/useAllRoute';

const API_BASE = import.meta.env.VITE_BASE_URL;

const AddRoute = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        routeName: '',
        routeCode: '',
        boardingPoints: '',
    });
    const [boardingPointsArray, setBoardingPointsArray] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { routeRefetch } = useAllRoute();

    // ── Fetch all routes ────────────────────────────────────────
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

    // ── Update boarding points preview when input changes ──────
    useEffect(() => {
        const points = formData.boardingPoints
            .split(',')
            .map(p => p.trim())
            .filter(p => p);
        setBoardingPointsArray(points);
    }, [formData.boardingPoints]);

    // ── Form handlers ───────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            routeName: '',
            routeCode: '',
            boardingPoints: '',
        });
        setBoardingPointsArray([]);
        setEditingId(null);
    };

    // ── Remove individual boarding point ────────────────────────
    const removeBoardingPoint = (indexToRemove) => {
        const updatedPoints = boardingPointsArray.filter((_, index) => index !== indexToRemove);
        setFormData(prev => ({
            ...prev,
            boardingPoints: updatedPoints.join(', ')
        }));
    };

    // ── Submit (Create or Update) ───────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.routeName.trim() || !formData.routeCode.trim()) {
            toast.error('Route Name and Code are required');
            return;
        }

        if (boardingPointsArray.length === 0) {
            toast.error('Please add at least one boarding point');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            routeName: formData.routeName.trim(),
            routeCode: formData.routeCode.trim(),
            boardingPoints: boardingPointsArray, // Send as array
        };

        try {
            let res;
            let message;

            if (editingId) {
                // Update
                res = await fetch(`${API_BASE}/route/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                message = 'Route updated successfully!';

            } else {
                // Create
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

    // ── Edit route ──────────────────────────────────────────────
    const handleEdit = (route) => {
        setFormData({
            routeName: route.routeName || '',
            routeCode: route.routeCode || '',
            boardingPoints: (route.boardingPoints || []).join(', '),
        });
        setEditingId(route._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Delete route ────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;

        try {
            const res = await fetch(`${API_BASE}/route/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            toast.success('Route deleted', { icon: <Trash2 className="text-red-500" /> });
            fetchRoutes();
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
                    {/* Form + Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left - Form */}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Route Name
                                    </label>
                                    <input
                                        type="text"
                                        name="routeName"
                                        value={formData.routeName}
                                        onChange={handleChange}
                                        placeholder="e.g. Dhaka - Rajshahi Highway"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Route Code
                                    </label>
                                    <input
                                        type="text"
                                        name="routeCode"
                                        value={formData.routeCode}
                                        onChange={handleChange}
                                        placeholder="e.g. DH-RJ-01"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Boarding Points (comma separated)
                                    </label>
                                    <textarea
                                        name="boardingPoints"
                                        value={formData.boardingPoints}
                                        onChange={handleChange}
                                        placeholder="e.g. Gabtoli, Savar, Nabinagar, Rajshahi Bus Terminal"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    />

                                    {/* Boarding Points Preview */}
                                    {boardingPointsArray.length > 0 && (
                                        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Preview ({boardingPointsArray.length} points)
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <AnimatePresence>
                                                    {boardingPointsArray.map((point, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                                                        >
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span>{point}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBoardingPoint(index)}
                                                                className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`
                                            flex-1 py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-all
                                            ${isSubmitting
                                                ? 'bg-gray-500 cursor-not-allowed'
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

                        {/* Right - Stats + List */}
                        <div className="space-y-6 order-1 lg:order-2">
                            {/* Total count card */}
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Available Routes</p>
                                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                                    {loading ? '...' : routes.length}
                                </p>
                            </div>

                            {/* Quick list preview */}
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
                                            <div key={route._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {route.routeName}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                            {route.routeCode}
                                                        </p>
                                                        {route.boardingPoints && route.boardingPoints.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {route.boardingPoints.map((point, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                                    >
                                                                        <MapPin className="h-3 w-3" />
                                                                        {point}
                                                                    </span>
                                                                ))}

                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => handleEdit(route)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(route._id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                        >
                                                            <Trash2 size={18} />
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