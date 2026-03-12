// AddBus.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, DollarSign, Clock, Users, Loader2, CheckCircle2, Plus, Trash2, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import useAllRoute from '../Hooks/useAllRoute';
import AdminHeader from './AdminHeader';

const API_BASE = import.meta.env.VITE_BASE_URL;

const emptyBoardingPoint = () => ({ boarding_point: '', time: '' });
const emptyDroppingPoint = () => ({ dropping_point: '', time: '' });

const AddBus = () => {
    const [formData, setFormData] = useState({
        bus_name: '',
        bus_number: '',
        perSeatFees: '',
        bus_starting_time: '',
        bus_last_stoppage_time: '',
        availability: 'yes',
        bus_route: '',
    });

    const [all_boarding_points, setAllBoardingPoints] = useState([emptyBoardingPoint()]);
    const [all_dropping_points, setAllDroppingPoints] = useState([emptyDroppingPoint()]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { routeLoading, allRoutes } = useAllRoute();

    // ── Main form fields ──────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Boarding points ───────────────────────────────────────────
    const handleBoardingChange = (index, field, value) => {
        setAllBoardingPoints(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };
    const addBoardingPoint = () => setAllBoardingPoints(prev => [...prev, emptyBoardingPoint()]);
    const removeBoardingPoint = (index) => {
        if (all_boarding_points.length === 1) return;
        setAllBoardingPoints(prev => prev.filter((_, i) => i !== index));
    };

    // ── Dropping points ───────────────────────────────────────────
    const handleDroppingChange = (index, field, value) => {
        setAllDroppingPoints(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };
    const addDroppingPoint = () => setAllDroppingPoints(prev => [...prev, emptyDroppingPoint()]);
    const removeDroppingPoint = (index) => {
        if (all_dropping_points.length === 1) return;
        setAllDroppingPoints(prev => prev.filter((_, i) => i !== index));
    };

    // ── Reset ─────────────────────────────────────────────────────
    const resetForm = () => {
        setFormData({
            bus_name: '',
            bus_number: '',
            perSeatFees: '',
            bus_starting_time: '',
            bus_last_stoppage_time: '',
            availability: 'yes',
            bus_route: '',
        });
        setAllBoardingPoints([emptyBoardingPoint()]);
        setAllDroppingPoints([emptyDroppingPoint()]);
    };

    // ── Submit ────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bus_name.trim()) return toast.error('Bus name is required');
        if (!formData.bus_number.trim()) return toast.error('Bus number is required');
        if (!formData.perSeatFees || Number(formData.perSeatFees) <= 0) return toast.error('Enter a valid seat fee');
        if (!formData.bus_starting_time) return toast.error('Starting time is required');
        if (!formData.bus_last_stoppage_time) return toast.error('Last stoppage time is required');

        const validBoarding = all_boarding_points.filter(p => p.boarding_point.trim() && p.time);
        const validDropping = all_dropping_points.filter(p => p.dropping_point.trim() && p.time);

        if (validBoarding.length === 0) return toast.error('Add at least one boarding point');
        if (validDropping.length === 0) return toast.error('Add at least one dropping point');

        setIsSubmitting(true);

        const payload = {
            bus_name: formData.bus_name.trim(),
            bus_number: formData.bus_number.trim(),
            perSeatFees: Number(formData.perSeatFees),
            bus_starting_time: formData.bus_starting_time,
            bus_last_stoppage_time: formData.bus_last_stoppage_time,
            availability: formData.availability,
            bus_route: formData.bus_route || null,
            all_boarding_points: validBoarding,
            all_dropping_points: validDropping,
        };

        try {
            const res = await fetch(`${API_BASE}/bus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to add bus');
            }

            toast.success('Bus added successfully!', {
                icon: <CheckCircle2 className="text-green-500" />,
                duration: 4500,
            });
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to add bus. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (routeLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="animate-spin h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
        );
    }

    // ── Reusable section header ───────────────────────────────────
    const SectionTitle = ({ icon, title, subtitle }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <>
            <Toaster position="top-right" richColors toastOptions={{ duration: 4000 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10"
            >


                <div className="mt-6">
                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">

                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
                            <div className="flex items-center gap-3">
                                <Bus className="h-8 w-8" />
                                <div>
                                    <h1 className="text-3xl font-bold">Add New Bus</h1>
                                    <p className="mt-1 text-emerald-100">Enter all bus details below</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-10">

                            {/* ── Section 1: Basic Info ── */}
                            <div>
                                <SectionTitle icon={<Bus size={18} />} title="Basic Information" subtitle="Bus name, number & fare" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                                    {/* Bus Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Bus Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="bus_name"
                                            value={formData.bus_name}
                                            onChange={handleChange}
                                            placeholder="e.g. Green Line Paribahan"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Bus Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Bus Number / Reg <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="bus_number"
                                            value={formData.bus_number}
                                            onChange={handleChange}
                                            placeholder="e.g. DHAKA METRO-G-5678"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Per Seat Fee */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <DollarSign size={15} /> Per Seat Fee (BDT) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="perSeatFees"
                                            value={formData.perSeatFees}
                                            onChange={handleChange}
                                            placeholder="e.g. 950"
                                            min="1"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Starting Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <Clock size={15} /> Starting Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="bus_starting_time"
                                            value={formData.bus_starting_time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Last Stoppage Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <Clock size={15} /> Last Stoppage Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="bus_last_stoppage_time"
                                            value={formData.bus_last_stoppage_time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Availability */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Availability <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="availability"
                                            value={formData.availability}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>

                                    {/* Bus Route */}
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Bus Route (optional)
                                        </label>
                                        <select
                                            name="bus_route"
                                            value={formData.bus_route}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">— Select Route —</option>
                                            {allRoutes.map((route) => (
                                                <option key={route._id} value={route._id}>
                                                    {route?.route_name} — {route?.route_id_num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ── Section 2: Boarding Points ── */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                <SectionTitle
                                    icon={<MapPin size={18} />}
                                    title="Boarding Points"
                                    subtitle="Add all stops where passengers can board"
                                />

                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {all_boarding_points.map((point, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="grid grid-cols-1 sm:grid-cols-[1fr_160px_40px] gap-3 items-end p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl"
                                            >
                                                {/* Point Number Badge */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Stop {index + 1} — Boarding Point
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                                                        <input
                                                            type="text"
                                                            value={point.boarding_point}
                                                            onChange={(e) => handleBoardingChange(index, 'boarding_point', e.target.value)}
                                                            placeholder="e.g. Gabtoli Bus Stand"
                                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Pickup Time
                                                    </label>
                                                    <div className="relative">
                                                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                                                        <input
                                                            type="time"
                                                            value={point.time}
                                                            onChange={(e) => handleBoardingChange(index, 'time', e.target.value)}
                                                            className="w-full pl-9 pr-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeBoardingPoint(index)}
                                                    disabled={all_boarding_points.length === 1}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <button
                                    type="button"
                                    onClick={addBoardingPoint}
                                    className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                                >
                                    <Plus size={16} />
                                    Add Boarding Point
                                </button>
                            </div>

                            {/* ── Section 3: Dropping Points ── */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                <SectionTitle
                                    icon={<ArrowRight size={18} />}
                                    title="Dropping Points"
                                    subtitle="Add all stops where passengers will be dropped off"
                                />

                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {all_dropping_points.map((point, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="grid grid-cols-1 sm:grid-cols-[1fr_160px_40px] gap-3 items-end p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl"
                                            >
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Stop {index + 1} — Dropping Point
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500" />
                                                        <input
                                                            type="text"
                                                            value={point.dropping_point}
                                                            onChange={(e) => handleDroppingChange(index, 'dropping_point', e.target.value)}
                                                            placeholder="e.g. Rajshahi Bus Terminal"
                                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Drop Time
                                                    </label>
                                                    <div className="relative">
                                                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500" />
                                                        <input
                                                            type="time"
                                                            value={point.time}
                                                            onChange={(e) => handleDroppingChange(index, 'time', e.target.value)}
                                                            className="w-full pl-9 pr-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeDroppingPoint(index)}
                                                    disabled={all_dropping_points.length === 1}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <button
                                    type="button"
                                    onClick={addDroppingPoint}
                                    className="mt-3 flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                                >
                                    <Plus size={16} />
                                    Add Dropping Point
                                </button>
                            </div>

                            {/* ── Submit ── */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-3 shadow-lg transition-all
                                        ${isSubmitting
                                            ? 'bg-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                                        }
                                    `}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Adding Bus...
                                        </>
                                    ) : (
                                        <>
                                            <Bus className="h-5 w-5" />
                                            Add Bus to Fleet
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AddBus;