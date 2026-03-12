import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus, Edit, Trash2, Loader2, CheckCircle2, XCircle,
    Search, MapPin, Clock, DollarSign, Filter, X,
    Route as RouteIcon, Plus, ArrowRight, Hash,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import useAllBuses from '../Hooks/useAllBuses';

const API_BASE = import.meta.env.VITE_BASE_URL;

// ── 24hr → 12hr AM/PM ────────────────────────────────────────
const to12hr = (time24) => {
    if (!time24) return '—';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
};

const emptyBoarding = () => ({ boarding_point: '', time: '' });
const emptyDropping = () => ({ dropping_point: '', time: '' });

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
        bus_name: '',
        bus_number: '',
        perSeatFees: '',
        bus_starting_time: '',
        bus_last_stoppage_time: '',
        availability: 'yes',
        bus_route: '',
    });
    const [boardingPoints, setBoardingPoints] = useState([emptyBoarding()]);
    const [droppingPoints, setDroppingPoints] = useState([emptyDropping()]);

    // ── Fetch ─────────────────────────────────────────────────
    const fetchBuses = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/bus`);
            if (!res.ok) throw new Error('Failed to fetch buses');
            setBuses(await res.json());
        } catch {
            toast.error('Could not load buses');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const res = await fetch(`${API_BASE}/routes`);
            if (!res.ok) throw new Error();
            setRoutes(await res.json());
        } catch { }
    };

    useEffect(() => { fetchBuses(); fetchRoutes(); }, []);

    // ── Form handlers ─────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBoardingChange = (i, field, value) =>
        setBoardingPoints(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    const addBoarding = () => setBoardingPoints(prev => [...prev, emptyBoarding()]);
    const removeBoarding = (i) => {
        if (boardingPoints.length === 1) return;
        setBoardingPoints(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleDroppingChange = (i, field, value) =>
        setDroppingPoints(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    const addDropping = () => setDroppingPoints(prev => [...prev, emptyDropping()]);
    const removeDropping = (i) => {
        if (droppingPoints.length === 1) return;
        setDroppingPoints(prev => prev.filter((_, idx) => idx !== i));
    };

    const resetForm = () => {
        setFormData({
            bus_name: '', bus_number: '', perSeatFees: '',
            bus_starting_time: '', bus_last_stoppage_time: '',
            availability: 'yes', bus_route: '',
        });
        setBoardingPoints([emptyBoarding()]);
        setDroppingPoints([emptyDropping()]);
        setEditingBus(null);
        setShowEditModal(false);
    };

    // ── Edit ──────────────────────────────────────────────────
    const handleEdit = (bus) => {
        setEditingBus(bus);
        setFormData({
            bus_name: bus.bus_name || '',
            bus_number: bus.bus_number || '',
            perSeatFees: bus.perSeatFees || '',
            bus_starting_time: bus.bus_starting_time || '',
            bus_last_stoppage_time: bus.bus_last_stoppage_time || '',
            availability: bus.availability || 'yes',
            bus_route: bus.bus_route || '',
        });
        setBoardingPoints(bus.all_boarding_points?.length ? bus.all_boarding_points : [emptyBoarding()]);
        setDroppingPoints(bus.all_dropping_points?.length ? bus.all_dropping_points : [emptyDropping()]);
        setShowEditModal(true);
    };

    // ── Update ────────────────────────────────────────────────
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!formData.bus_name.trim() || !formData.bus_number.trim())
            return toast.error('Bus name and number are required');

        const validBoarding = boardingPoints.filter(p => p.boarding_point.trim() && p.time);
        const validDropping = droppingPoints.filter(p => p.dropping_point.trim() && p.time);
        if (!validBoarding.length) return toast.error('Add at least one boarding point');
        if (!validDropping.length) return toast.error('Add at least one dropping point');

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                perSeatFees: Number(formData.perSeatFees),
                all_boarding_points: validBoarding,
                all_dropping_points: validDropping,
            };
            const res = await fetch(`${API_BASE}/bus/${editingBus._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error();
            toast.success('Bus updated successfully!', { icon: <CheckCircle2 className="text-green-500" /> });
            resetForm();
            fetchBuses();
            busRefetch();
        } catch {
            toast.error('Failed to update bus');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bus?')) return;
        try {
            const res = await fetch(`${API_BASE}/bus/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Bus deleted successfully');
            fetchBuses();
            busRefetch();
        } catch {
            toast.error('Failed to delete bus');
        }
    };

    // ── Filter ────────────────────────────────────────────────
    const filteredBuses = buses.filter(bus => {
        const matchesSearch =
            bus.bus_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.bus_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAvailability =
            filterAvailability === 'all' || bus.availability === filterAvailability;
        return matchesSearch && matchesAvailability;
    });

    const getRouteName = (routeId) => {
        const route = routes.find(r => r._id === routeId);
        return route ? `${route.route_name} (${route.route_id_num})` : 'No route';
    };

    // ── Reusable point row ────────────────────────────────────
    const PointRow = ({ color, iconColor, label, nameField, value, timeValue, index, onChange, onRemove, canRemove }) => (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className={`grid grid-cols-1 sm:grid-cols-[1fr_150px_36px] gap-2 items-end p-3 rounded-xl border ${color}`}
        >
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Stop {index + 1} — {label}</label>
                <div className="relative">
                    <MapPin className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${iconColor}`} />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(index, nameField, e.target.value)}
                        placeholder={`e.g. ${label} name`}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="time"
                        value={timeValue}
                        onChange={(e) => onChange(index, 'time', e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={!canRemove}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
                <Trash2 size={15} />
            </button>
        </motion.div>
    );

    return (
        <>
            <Toaster position="top-right" richColors toastOptions={{ duration: 4000 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 pb-12"
            >
                <AdminHeader title="Manage Buses" subtitle="Manage your buses here." />

                <div className="mt-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {[
                            { label: 'Total Buses', value: buses.length, color: 'text-indigo-600 dark:text-indigo-400', Icon: Bus },
                            { label: 'Available', value: buses.filter(b => b.availability === 'yes').length, color: 'text-green-600 dark:text-green-400', Icon: CheckCircle2 },
                            { label: 'Unavailable', value: buses.filter(b => b.availability === 'no').length, color: 'text-red-600 dark:text-red-400', Icon: XCircle },
                        ].map(({ label, value, color, Icon }, i) => (
                            <motion.div
                                key={label}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                                        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                                    </div>
                                    <Icon className={`h-12 w-12 opacity-20 ${color}`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by bus name or number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={filterAvailability}
                                    onChange={(e) => setFilterAvailability(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                                        transition={{ delay: index * 0.04 }}
                                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="flex-1">
                                                {/* Name + Badge */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                            <Bus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                            {bus.bus_name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{bus.bus_number}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bus.availability === 'yes'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {bus.availability === 'yes' ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>

                                                {/* Info grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                                                    {/* ✅ AM/PM time display */}
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                                                        <span>
                                                            {to12hr(bus.bus_starting_time)}
                                                            <ArrowRight className="inline h-3 w-3 mx-1 text-gray-400" />
                                                            {to12hr(bus.bus_last_stoppage_time)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-indigo-500 shrink-0" />
                                                        <span>৳{Number(bus.perSeatFees).toLocaleString()} / seat</span>
                                                    </div>
                                                    {bus.bus_route && (
                                                        <div className="flex items-center gap-2">
                                                            <RouteIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                                                            <span>{getRouteName(bus.bus_route)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Boarding points — ✅ AM/PM */}
                                                {bus.all_boarding_points?.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Boarding</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {bus.all_boarding_points.map((p, i) => (
                                                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium">
                                                                    <MapPin size={10} />
                                                                    {p.boarding_point}
                                                                    <span className="text-emerald-500 dark:text-emerald-400">
                                                                        · {to12hr(p.time)}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dropping points — ✅ AM/PM */}
                                                {bus.all_dropping_points?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Dropping</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {bus.all_dropping_points.map((p, i) => (
                                                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-medium">
                                                                    <MapPin size={10} />
                                                                    {p.dropping_point}
                                                                    <span className="text-rose-400">
                                                                        · {to12hr(p.time)}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 lg:flex-col lg:w-28">
                                                <motion.button
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => handleEdit(bus)}
                                                    className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow transition"
                                                >
                                                    <Edit size={16} /> Edit
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => handleDelete(bus._id)}
                                                    className="flex-1 lg:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow transition"
                                                >
                                                    <Trash2 size={16} /> Delete
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

            {/* ── Edit Modal ── */}
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
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <Edit className="h-6 w-6" />
                                    <h2 className="text-2xl font-bold">Edit Bus</h2>
                                </div>
                                <button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-lg transition">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-8">

                                {/* Basic Info */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Basic Information</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bus Name</label>
                                            <input type="text" name="bus_name" value={formData.bus_name} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bus Number</label>
                                            <input type="text" name="bus_number" value={formData.bus_number} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Per Seat Fee (BDT)</label>
                                            <input type="number" name="perSeatFees" value={formData.perSeatFees} onChange={handleChange} min="1"
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Availability</label>
                                            <select name="availability" value={formData.availability} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>

                                        {/* ✅ Time inputs stay 24hr for browser UX */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Starting Time
                                                {formData.bus_starting_time && (
                                                    <span className="ml-2 text-indigo-500 font-normal">({to12hr(formData.bus_starting_time)})</span>
                                                )}
                                            </label>
                                            <input type="time" name="bus_starting_time" value={formData.bus_starting_time} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Last Stoppage Time
                                                {formData.bus_last_stoppage_time && (
                                                    <span className="ml-2 text-indigo-500 font-normal">({to12hr(formData.bus_last_stoppage_time)})</span>
                                                )}
                                            </label>
                                            <input type="time" name="bus_last_stoppage_time" value={formData.bus_last_stoppage_time} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bus Route (optional)</label>
                                            <select name="bus_route" value={formData.bus_route} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                                <option value="">— Select Route —</option>
                                                {routes.map((r) => (
                                                    <option key={r._id} value={r._id}>
                                                        {r.route_name} — {r.route_id_num}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Boarding Points */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Boarding Points</p>
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {boardingPoints.map((p, i) => (
                                                <PointRow
                                                    key={i} index={i}
                                                    color="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                                                    iconColor="text-emerald-500"
                                                    label="Boarding Point"
                                                    nameField="boarding_point"
                                                    value={p.boarding_point}
                                                    timeValue={p.time}
                                                    onChange={handleBoardingChange}
                                                    onRemove={removeBoarding}
                                                    canRemove={boardingPoints.length > 1}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <button type="button" onClick={addBoarding}
                                        className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                                        <Plus size={15} /> Add Boarding Point
                                    </button>
                                </div>

                                {/* Dropping Points */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dropping Points</p>
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {droppingPoints.map((p, i) => (
                                                <PointRow
                                                    key={i} index={i}
                                                    color="bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"
                                                    iconColor="text-rose-500"
                                                    label="Dropping Point"
                                                    nameField="dropping_point"
                                                    value={p.dropping_point}
                                                    timeValue={p.time}
                                                    onChange={handleDroppingChange}
                                                    onRemove={removeDropping}
                                                    canRemove={droppingPoints.length > 1}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <button type="button" onClick={addDropping}
                                        className="mt-2 flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                                        <Plus size={15} /> Add Dropping Point
                                    </button>
                                </div>

                                {/* Submit */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-4">
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
                                        {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Updating...</> : 'Update Bus'}
                                    </motion.button>
                                    <button type="button" onClick={resetForm}
                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition">
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