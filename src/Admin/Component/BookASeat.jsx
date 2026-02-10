import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bus, MapPin, X, Loader2, RefreshCcw, CheckCircle2, Info, User, UserCircle2, Calendar, Route, Sparkles, ChevronRight,
    ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import useAllRoute from "../Hooks/useAllRoute";
import useAllBuses from "../Hooks/useAllBuses";

const API_BASE = import.meta.env.VITE_BASE_URL;

const BookASeat = () => {
    const { allRoutes } = useAllRoute();
    const { allBuses } = useAllBuses();

    const initialFilters = {
        fromLocation: "",
        toLocation: "",
        routeId: "",
        date: new Date().toISOString().split("T")[0],
    };

    const [filters, setFilters] = useState(initialFilters);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [genderPicker, setGenderPicker] = useState(null);

    const [passenger, setPassenger] = useState({
        name: "", phone: "", email: "", boardingPoint: "", droppingPoint: ""
    });

    const [loading, setLoading] = useState(false);

    // Filter Logic
    useEffect(() => {
        let list = [...allBuses];
        if (filters.routeId) list = list.filter(b => b.route === filters.routeId);
        if (filters.fromLocation) {
            list = list.filter(b => b.fromLocation.toLowerCase().includes(filters.fromLocation.toLowerCase()));
        }
        if (filters.toLocation) {
            list = list.filter(b => b.toLocation.toLowerCase().includes(filters.toLocation.toLowerCase()));
        }
        list = list.filter(b => b.availability === "yes");
        setFilteredBuses(list);
    }, [filters, allBuses]);

    const clearFilters = () => {
        setFilters(initialFilters);
        setSelectedBus(null);
        setSelectedSeats([]);
        setSeats([]);
        setPassenger({ name: "", phone: "", email: "", boardingPoint: "", droppingPoint: "" });
    };

    const generateSeatLayout = (bookedMap) => {
        let layout = [];
        layout.push({ id: "GD1", isBooked: !!bookedMap["GD1"], gender: bookedMap["GD1"] || null });

        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        rows.forEach(row => {
            for (let i = 1; i <= 4; i++) {
                const id = `${row}${i}`;
                layout.push({ id, isBooked: !!bookedMap[id], gender: bookedMap[id] || null });
            }
        });

        for (let i = 1; i <= 5; i++) {
            const id = `J${i}`;
            layout.push({ id, isBooked: !!bookedMap[id], gender: bookedMap[id] || null });
        }
        return layout;
    };

    const loadSeats = async (bus) => {
        setSelectedBus(bus);
        setSelectedSeats([]);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bookings/bus/${bus._id}?date=${filters.date}`);
            const bookings = await res.json();
            const bookedMap = {};
            bookings.forEach(b => b.seats.forEach(s => bookedMap[s.seatNumber] = s.gender));
            setSeats(generateSeatLayout(bookedMap));
        } catch (error) {
            toast.error("Failed to load seats");
        } finally {
            setLoading(false);
        }
    };

    const toggleSeatSelection = (seat, gender) => {
        if (selectedSeats.find(s => s.seatNumber === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, { seatNumber: seat.id, gender }]);
        }
        setGenderPicker(null);
    };

    const formatTimeAMPM = (time24) => {
        if (!time24) return "";

        const [h, m] = time24.split(":");
        const hour = Number(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${m} ${ampm}`;
    };


    const confirmBooking = async () => {
        if (!passenger.name || !passenger.phone || !passenger.boardingPoint) {
            return toast.error("Name, Phone, and Boarding Point are required");
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    busId: selectedBus._id,
                    travelDate: filters.date,
                    seats: selectedSeats,
                    ...passenger,
                    perSeatFees: selectedBus.perSeatFees,
                    totalAmount: selectedSeats.length * selectedBus.perSeatFees,
                    status: "confirmed"
                }),
            });
            if (res.ok) {
                toast.success("Ticket Booked Successfully!");
                clearFilters();
            }
        } catch (e) { toast.error("Booking failed"); } finally { setLoading(false); }
    };

    const availableCount = seats.filter(s => !s.isBooked).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">



                {/* TOP FILTERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl shadow-indigo-200/50 mb-8 border border-white/50"
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-indigo-400 transition-all group-focus-within:text-indigo-600 group-focus-within:scale-110" />
                            <input
                                className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-gray-400"
                                placeholder="From Location"
                                value={filters.fromLocation}
                                onChange={e => setFilters({ ...filters, fromLocation: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-purple-400 transition-all group-focus-within:text-purple-600 group-focus-within:scale-110" />
                            <input
                                className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all font-medium placeholder:text-gray-400"
                                placeholder="To Location"
                                value={filters.toLocation}
                                onChange={e => setFilters({ ...filters, toLocation: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-pink-400 transition-all group-focus-within:text-pink-600 group-focus-within:scale-110" />
                            <input
                                type="date"
                                className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
                                value={filters.date}
                                onChange={e => setFilters({ ...filters, date: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <Route className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-indigo-400 transition-all group-focus-within:text-indigo-600 group-focus-within:scale-110" />
                            <select
                                className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-medium appearance-none bg-white"
                                value={filters.routeId}
                                onChange={e => setFilters({ ...filters, routeId: e.target.value })}
                            >
                                <option value="">All Routes</option>
                                {allRoutes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <RefreshCcw size={18} /> Clear All
                        </button>
                    </div>
                </motion.div>

                {!selectedBus ? (
                    /* BUS LIST */
                    <div className="grid gap-5">
                        {filteredBuses.length > 0 ? filteredBuses.map((bus, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={bus._id}
                                className="group bg-white/90 backdrop-blur-sm p-6 rounded-3xl border-2 border-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                            <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
                                                <Bus size={32} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-gray-800 mb-1">{bus.busName}</h3>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span className="font-semibold">{bus.fromLocation}</span>
                                                <ChevronRight className="w-4 h-4" />
                                                <span className="font-semibold">{bus.toLocation}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500 mb-1">Price per seat</div>
                                            <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">৳{bus.perSeatFees}</span>
                                        </div>
                                        <button
                                            onClick={() => loadSeats(bus)}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                        >
                                            Select Seat
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32 bg-white/60 backdrop-blur-sm rounded-3xl"
                            >
                                <Bus className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-400 text-lg font-medium">No buses found for this criteria.</p>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    /* BUS SEAT MAP & FORM */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >

                        {/* LEFT: SEAT MAP */}
                        <div className="lg:col-span-7 order-2 lg:order-1">

                            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border-2 border-white shadow-2xl shadow-indigo-200/50">

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                            {selectedBus.busName}
                                        </h2>
                                        {/* time */}
                                        <div className="flex gap-2 items-center">
                                            <p className="text-gray-600 font-medium">
                                                Boarding Time: {formatTimeAMPM(selectedBus?.startTime)}
                                            </p>
                                            <p className=""> <ArrowRight size={16} /> </p>
                                            <p className="text-gray-600 font-medium">
                                                Dropping Time: {formatTimeAMPM(selectedBus?.endTime)}
                                            </p>
                                        </div>
                                        {/* date---. */}
                                        <p className="">

                                        </p>

                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-md opacity-50"></div>
                                        <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                            </span>
                                            {availableCount} Seats Available
                                        </div>
                                    </div>
                                </div>


                                {/* LEGEND */}
                                <div className="flex flex-wrap gap-5 text-sm mb-8 pb-6 border-b-2 border-gray-100">
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-lg shadow-sm"></div>
                                        <span className="font-semibold text-gray-700">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                                        <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg"></div>
                                        <span className="font-semibold text-emerald-700">Selected</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg"></div>
                                        <span className="font-semibold text-blue-700">Male Booked</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full">
                                        <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg"></div>
                                        <span className="font-semibold text-pink-700">Female Booked</span>
                                    </div>
                                </div>

                                {/* SEAT MAP CONTAINER */}
                                <div className="relative max-w-lg mx-auto bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 p-10 rounded-3xl border-4 border-white/80 shadow-2xl shadow-inner overflow-hidden">

                                    {/* Decorative elements */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                                    {/* Driver indicator */}
                                    <div className="absolute top-6 right-8 text-gray-500">
                                        <div className="flex flex-col items-center text-xs font-bold">
                                            <div className="w-12 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full mb-2 shadow-xl flex items-center justify-center">
                                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                            </div>
                                            <span className="uppercase tracking-wide">Driver</span>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex flex-col justify-center items-center min-h-[400px]">
                                            <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
                                            <p className="text-gray-600 font-medium">Loading seats...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">

                                            {/* GD1 seat */}
                                            <div className="grid grid-cols-4 gap-4">
                                                <SeatItem
                                                    seat={seats[0]}
                                                    selected={selectedSeats.some(s => s.seatNumber === seats[0]?.id)}
                                                    onClick={() => setGenderPicker(seats[0])}
                                                    className="scale-110 origin-bottom shadow-xl hover:scale-125"
                                                />
                                                <div className="col-span-3"></div>
                                            </div>

                                            {/* Main rows A-I */}
                                            <div className="space-y-4">
                                                {[...Array(9)].map((_, rowIndex) => (
                                                    <div
                                                        key={rowIndex}
                                                        className="grid grid-cols-4 gap-4 relative"
                                                    >
                                                        {/* Aisle line */}
                                                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-gray-400/40 to-transparent pointer-events-none"></div>

                                                        <SeatItem seat={seats[1 + rowIndex * 4]} selected={selectedSeats.some(s => s.seatNumber === seats[1 + rowIndex * 4]?.id)} onClick={() => setGenderPicker(seats[1 + rowIndex * 4])} />
                                                        <SeatItem seat={seats[2 + rowIndex * 4]} selected={selectedSeats.some(s => s.seatNumber === seats[2 + rowIndex * 4]?.id)} onClick={() => setGenderPicker(seats[2 + rowIndex * 4])} />
                                                        <SeatItem seat={seats[3 + rowIndex * 4]} selected={selectedSeats.some(s => s.seatNumber === seats[3 + rowIndex * 4]?.id)} onClick={() => setGenderPicker(seats[3 + rowIndex * 4])} />
                                                        <SeatItem seat={seats[4 + rowIndex * 4]} selected={selectedSeats.some(s => s.seatNumber === seats[4 + rowIndex * 4]?.id)} onClick={() => setGenderPicker(seats[4 + rowIndex * 4])} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Last row J */}
                                            <div className="grid grid-cols-5 gap-3 mt-6 pt-6 border-t-2 border-dashed border-gray-300/70">
                                                {seats.slice(-5).map(s => (
                                                    <SeatItem
                                                        key={s.id}
                                                        seat={s}
                                                        selected={selectedSeats.some(x => x.seatNumber === s.id)}
                                                        onClick={() => setGenderPicker(s)}
                                                        className="hover:scale-110"
                                                    />
                                                ))}
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: PASSENGER FORM */}
                        <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-6 h-fit">

                            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border-2 border-white shadow-2xl shadow-purple-200/50">

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
                                        <UserCircle2 className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Passenger Details
                                    </h3>
                                </div>

                                <div className="space-y-6">

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name *</label>
                                        <input
                                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm hover:shadow-md font-medium"
                                            placeholder="Enter your full name"
                                            value={passenger.name}
                                            onChange={e => setPassenger({ ...passenger, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Phone Number *</label>
                                            <input
                                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all shadow-sm hover:shadow-md font-medium"
                                                placeholder="01XXXXXXXXX"
                                                value={passenger.phone}
                                                onChange={e => setPassenger({ ...passenger, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Email (Optional)</label>
                                            <input
                                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all shadow-sm hover:shadow-md font-medium"
                                                placeholder="email@example.com"
                                                value={passenger.email}
                                                onChange={e => setPassenger({ ...passenger, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Boarding Point *</label>
                                        <input
                                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm hover:shadow-md font-medium"
                                            placeholder="Enter boarding location"
                                            value={passenger.boardingPoint}
                                            onChange={e => setPassenger({ ...passenger, boardingPoint: e.target.value })}
                                        />
                                    </div>

                                    {/* Summary Card */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-[2px] rounded-3xl mt-6">
                                        <div className="bg-white rounded-3xl p-6">
                                            <div className="flex justify-between items-center text-sm mb-5 pb-4 border-b-2 border-gray-100">
                                                <span className="font-bold text-gray-700">Selected Seats</span>
                                                <span className="font-black text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                    {selectedSeats.map(s => s.seatNumber).join(", ") || "None"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-sm text-gray-500 font-semibold">Total Amount</span>
                                                    <p className="text-xs text-gray-400 mt-1">All charges included</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                        ৳{selectedSeats.length * (selectedBus?.perSeatFees || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 mt-8">
                                        <button
                                            onClick={confirmBooking}
                                            disabled={selectedSeats.length === 0 || loading}
                                            className="relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            {loading ? (
                                                <Loader2 className="h-7 w-7 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-7 w-7 group-hover:scale-110 transition-transform" />
                                                    Confirm Booking
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setSelectedBus(null)}
                                            className="w-full py-4 text-gray-600 hover:text-red-600 font-bold transition-colors rounded-xl hover:bg-red-50"
                                        >
                                            ← Back to Bus Selection
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* GENDER MODAL */}
            <AnimatePresence>
                {genderPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4"
                        onClick={() => setGenderPicker(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl border-2 border-white"
                        >
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                                    <span className="text-2xl font-black text-white">{genderPicker.id}</span>
                                </div>
                                <h4 className="font-black text-2xl text-gray-800 mb-2">Select Gender</h4>
                                <p className="text-gray-500 text-sm">Choose passenger gender for this seat</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => toggleSeatSelection(genderPicker, "male")}
                                    className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl flex flex-col items-center gap-3 hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"></div>
                                    <User size={32} className="text-white relative z-10" strokeWidth={2.5} />
                                    <span className="font-black text-white text-lg relative z-10">Male</span>
                                </button>
                                <button
                                    onClick={() => toggleSeatSelection(genderPicker, "female")}
                                    className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl flex flex-col items-center gap-3 hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"></div>
                                    <User size={32} className="text-white relative z-10" strokeWidth={2.5} />
                                    <span className="font-black text-white text-lg relative z-10">Female</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setGenderPicker(null)}
                                className="w-full py-3 text-gray-600 font-bold hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add custom animations to your CSS */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

const SeatItem = ({ seat, selected, onClick, className = "" }) => {
    if (!seat) return <div className="h-12 w-full" />;

    let colorClasses = "bg-white border-gray-300 text-gray-600 hover:border-indigo-400 hover:shadow-lg";
    let additionalEffects = "";

    if (seat.isBooked) {
        if (seat.gender === "female") {
            colorClasses = "bg-gradient-to-br from-pink-500 to-rose-600 border-pink-700 text-white shadow-lg";
        } else {
            colorClasses = "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-700 text-white shadow-lg";
        }
    } else if (selected) {
        colorClasses = "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-700 text-white shadow-xl ring-4 ring-emerald-200";
        additionalEffects = "scale-110";
    }

    return (
        <motion.button
            whileHover={{ scale: seat.isBooked ? 1 : 1.1 }}
            whileTap={{ scale: seat.isBooked ? 1 : 0.95 }}
            disabled={seat.isBooked}
            onClick={onClick}
            className={`h-14 w-full rounded-xl flex items-center justify-center border-b-4 transition-all duration-200 text-xs font-black uppercase tracking-wide ${colorClasses} ${additionalEffects} ${className} disabled:opacity-100 disabled:cursor-not-allowed`}
        >
            {seat.id}
        </motion.button>
    );
};

export default BookASeat;