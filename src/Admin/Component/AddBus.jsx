import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, DollarSign, Clock, Users, Loader2, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import useAllRoute from '../Hooks/useAllRoute';
import AdminHeader from './AdminHeader';

const API_BASE = import.meta.env.VITE_BASE_URL;

const AddBus = () => {
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { routeLoading, allRoutes } = useAllRoute();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!formData.busName.trim()) {
            toast.error('Bus name is required');
            return;
        }
        if (!formData.busNumber.trim()) {
            toast.error('Bus number is required');
            return;
        }
        if (!formData.perSeatFees || Number(formData.perSeatFees) <= 0) {
            toast.error('Please enter a valid per seat fee');
            return;
        }
        if (!formData.fromLocation.trim() || !formData.toLocation.trim()) {
            toast.error('Both locations are required');
            return;
        }
        if (!formData.startTime || !formData.endTime) {
            toast.error('Start and end time are required');
            return;
        }
        if (!formData.availableSeats || Number(formData.availableSeats) < 1) {
            toast.error('Please enter valid number of available seats');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare payload
            const payload = {
                busName: formData.busName.trim(),
                busNumber: formData.busNumber.trim(),
                perSeatFees: Number(formData.perSeatFees),
                fromLocation: formData.fromLocation.trim(),
                toLocation: formData.toLocation.trim(),
                startTime: formData.startTime,
                endTime: formData.endTime,
                availableSeats: Number(formData.availableSeats),
                availability: formData.availability,
                route: formData.route || null,
            };

            // Send to backend
            const res = await fetch(`${API_BASE}/bus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to add bus');
            }

            const result = await res.json();

            // ── Pretty console output ───────────────────────────────────────
            console.log('╔════════════════════════════════════════════╗');
            console.log('║            NEW BUS SUBMISSION              ║');
            console.log('╠════════════════════════════════════════════╣');
            console.log(`║ Bus Name         │ ${formData.busName.padEnd(27)} ║`);
            console.log(`║ Bus Number       │ ${formData.busNumber.padEnd(27)} ║`);
            console.log(`║ Per Seat Fee     │ ৳${Number(formData.perSeatFees).toLocaleString().padEnd(26)} ║`);
            console.log(`║ Route            │ ${formData.fromLocation} → ${formData.toLocation.padEnd(20)} ║`);
            console.log(`║ Time             │ ${formData.startTime} - ${formData.endTime.padEnd(21)} ║`);
            console.log(`║ Available Seats  │ ${formData.availableSeats.padEnd(27)} ║`);
            console.log(`║ Availability     │ ${formData.availability.toUpperCase().padEnd(27)} ║`);
            console.log(`║ Selected Route   │ ${(formData.route || 'Not selected').padEnd(27)} ║`);
            console.log(`║ Database ID      │ ${(result.insertedId || 'N/A').toString().padEnd(27)} ║`);
            console.log('╚════════════════════════════════════════════╝');

            toast.success('Bus added successfully!', {
                icon: <CheckCircle2 className="text-green-500" />,
                duration: 4500,
            });

            // Reset form
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
        } catch (error) {
            console.error('Error adding bus:', error);
            toast.error(error.message || 'Failed to add bus. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (routeLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 mx-auto text-emerald-600 dark:text-emerald-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Loading routes...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" richColors toastOptions={{ duration: 4000 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10"
            >
                <AdminHeader
                    title="Add a new bus"
                    subtitle="here you can add a new bus to the system"
                />

                <div className="mt-6">
                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6 text-white">
                            <div className="flex items-center gap-3">
                                <Bus className="h-8 w-8" />
                                <div>
                                    <h1 className="text-3xl font-bold">Add New Bus</h1>
                                    <p className="mt-1 text-emerald-100">Enter bus details to add to the system</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Bus Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bus Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="busName"
                                    value={formData.busName}
                                    onChange={handleChange}
                                    placeholder="e.g. Green Line Paribahan"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* Bus Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bus Number / Reg <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="busNumber"
                                    value={formData.busNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. DHAKA METRO-G-5678"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* Per Seat Fees */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <DollarSign size={16} /> Per Seat Fee (BDT) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="perSeatFees"
                                    value={formData.perSeatFees}
                                    onChange={handleChange}
                                    placeholder="e.g. 950"
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <MapPin size={16} /> From <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fromLocation"
                                    value={formData.fromLocation}
                                    onChange={handleChange}
                                    placeholder="e.g. Dhaka"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <MapPin size={16} /> To <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="toLocation"
                                    value={formData.toLocation}
                                    onChange={handleChange}
                                    placeholder="e.g. Cox's Bazar"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> Departure Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> Arrival Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* Available Seats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Users size={16} /> Available Seats <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="availableSeats"
                                    value={formData.availableSeats}
                                    onChange={handleChange}
                                    placeholder="e.g. 42"
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                />
                            </div>

                            {/* Availability */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Availability <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            {/* Route (optional) */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Route (optional)
                                </label>
                                <select
                                    name="route"
                                    value={formData.route}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
                                >
                                    <option value="">— Select Route —</option>
                                    {allRoutes.map((route) => (
                                        <option key={route._id} value={route._id}>
                                            {route?.routeName} - {route?.routeCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit */}
                            <div className="md:col-span-2 lg:col-span-3 mt-4">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-3 shadow-lg transition-all
                                        ${isSubmitting
                                            ? 'bg-gray-600 cursor-not-allowed'
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