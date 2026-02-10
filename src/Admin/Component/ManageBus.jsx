import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus,
    Edit,
    Trash2,
    Loader2,
    CheckCircle2,
    XCircle,
    Search,
    MapPin,
    Clock,
    Users,
    DollarSign,
    Filter,
    X,
    CalendarDays,
    Route as RouteIcon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import useAllBuses from '../Hooks/useAllBuses';

const API_BASE = import.meta.env.VITE_BASE_URL;

const ManageBus = () => {
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all');
    const [editingBus, setEditingBus] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const { busRefetch } = useAllBuses();
    const [formData, setFormData] = useState({
        busName: '',
        busNumber: '',
        perSeatFees: '',
        fromLocation: '',
        toLocation: '',
        startTime: '',
        endTime: '',
        availableSeats: '',
        availability: 'yes',
        route: '',
    });

    // ── Fetch Buses ────────────────────────────────────────────
    const fetchBuses = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/bus`);
            if (!res.ok) throw new Error('Failed to fetch buses');
            const data = await res.json();
            setBuses(data);
        } catch (err) {
            console.error(err);
            toast.error('Could not load buses');
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch Routes ───────────────────────────────────────────
    const fetchRoutes = async () => {
        try {
            const res = await fetch(`${API_BASE}/routes`);
            if (!res.ok) throw new Error('Failed to fetch routes');
            const data = await res.json();
            setRoutes(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBuses();
        fetchRoutes();
    }, []);

    // ── Form Handlers ──────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            busName: '',
            busNumber: '',
            perSeatFees: '',
            fromLocation: '',
            toLocation: '',
            startTime: '',
            endTime: '',
            availableSeats: '',
            availability: 'yes',
            route: '',
        });
        setEditingBus(null);
        setShowEditModal(false);
    };

    // ── Edit Bus ───────────────────────────────────────────────
    const handleEdit = (bus) => {
        setEditingBus(bus);
        setFormData({
            busName: bus.busName || '',
            busNumber: bus.busNumber || '',
            perSeatFees: bus.perSeatFees || '',
            fromLocation: bus.fromLocation || '',
            toLocation: bus.toLocation || '',
            startTime: bus.startTime || '',
            endTime: bus.endTime || '',
            availableSeats: bus.availableSeats || '',
            availability: bus.availability || 'yes',
            route: bus.route || '',
        });
        setShowEditModal(true);
    };

    // ── Update Bus ─────────────────────────────────────────────
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.busName.trim() || !formData.busNumber.trim()) {
            toast.error('Bus name and number are required');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE}/bus/${editingBus._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success('Bus updated successfully!', {
                icon: <CheckCircle2 className="text-green-500" />
            });
            resetForm();
            fetchBuses();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update bus');
        } finally {
            setIsSubmitting(false);
            busRefetch();
        }
    };

    // ── Delete Bus ─────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bus?')) return;

        try {
            const res = await fetch(`${API_BASE}/bus/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            toast.success('Bus deleted successfully', {
                icon: <Trash2 className="text-red-500" />
            });
            fetchBuses();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete bus');
        }
    };

    // ── Filter & Search ────────────────────────────────────────
    const filteredBuses = buses.filter(bus => {
        const matchesSearch =
            bus.busName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.toLocation?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAvailability =
            filterAvailability === 'all' || bus.availability === filterAvailability;

        return matchesSearch && matchesAvailability;
    });

    // ── Get Route Name ─────────────────────────────────────────
    const getRouteName = (routeId) => {
        const route = routes.find(r => r._id === routeId);
        return route ? `${route.routeName} (${route.routeCode})` : 'No route';
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
                    title="বাস ম্যানেজ করুন"
                    subtitle="এখানে সকল বাস দেখতে, এডিট এবং ডিলিট করতে পারবেন"
                />

                <div className="mt-6 ">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Buses</p>
                                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                        {buses.length}
                                    </p>
                                </div>
                                <Bus className="h-12 w-12 text-indigo-600 dark:text-indigo-400 opacity-20" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                        {buses.filter(b => b.availability === 'yes').length}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 opacity-20" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Unavailable</p>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                                        {buses.filter(b => b.availability === 'no').length}
                                    </p>
                                </div>
                                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 opacity-20" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by bus name, number, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            {/* Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={filterAvailability}
                                    onChange={(e) => setFilterAvailability(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="all">All Buses</option>
                                    <option value="yes">Available Only</option>
                                    <option value="no">Unavailable Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bus List */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Bus className="h-5 w-5" />
                                All Buses ({filteredBuses.length})
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                                    Loading buses...
                                </div>
                            ) : filteredBuses.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Bus className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    No buses found
                                </div>
                            ) : (
                                filteredBuses.map((bus, index) => (
                                    <motion.div
                                        key={bus._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Bus Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                            <Bus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                            {bus.busName}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {bus.busNumber}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bus.availability === 'yes'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {bus.availability === 'yes' ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {/* Route */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        <span>{bus.fromLocation} → {bus.toLocation}</span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        <span>{bus.startTime} - {bus.endTime}</span>
                                                    </div>

                                                    {/* Seats */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        <span>{bus.availableSeats} Seats</span>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        <span>৳{Number(bus.perSeatFees).toLocaleString()}</span>
                                                    </div>

                                                    {/* Route Info */}
                                                    {bus.route && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
                                                            <RouteIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span>{getRouteName(bus.route)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(bus)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow transition"
                                                >
                                                    <Edit size={18} />
                                                    Edit
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(bus._id)}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 shadow transition"
                                                >
                                                    <Trash2 size={18} />
                                                    Delete
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <Edit className="h-6 w-6" />
                                    <h2 className="text-2xl font-bold">Edit Bus</h2>
                                </div>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Bus Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bus Name
                                    </label>
                                    <input
                                        type="text"
                                        name="busName"
                                        value={formData.busName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                {/* Bus Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bus Number
                                    </label>
                                    <input
                                        type="text"
                                        name="busNumber"
                                        value={formData.busNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* Per Seat Fees */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Per Seat Fee (BDT)
                                    </label>
                                    <input
                                        type="number"
                                        name="perSeatFees"
                                        value={formData.perSeatFees}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* Available Seats */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Available Seats
                                    </label>
                                    <input
                                        type="number"
                                        name="availableSeats"
                                        value={formData.availableSeats}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* From */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        From
                                    </label>
                                    <input
                                        type="text"
                                        name="fromLocation"
                                        value={formData.fromLocation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* To */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        To
                                    </label>
                                    <input
                                        type="text"
                                        name="toLocation"
                                        value={formData.toLocation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Departure Time
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Arrival Time
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    />
                                </div>

                                {/* Availability */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Availability
                                    </label>
                                    <select
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                {/* Route */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Route (optional)
                                    </label>
                                    <select
                                        name="route"
                                        value={formData.route}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900"
                                    >
                                        <option value="">— Select Route —</option>
                                        {routes.map((route) => (
                                            <option key={route._id} value={route._id}>
                                                {route.routeName} - {route.routeCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Submit Buttons */}
                                <div className="md:col-span-2 flex gap-4 pt-4">
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition ${isSubmitting
                                            ? 'bg-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Bus'
                                        )}
                                    </motion.button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ManageBus;