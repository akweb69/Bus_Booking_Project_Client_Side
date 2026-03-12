import useAllBuses from '@/Admin/Hooks/useAllBuses';
import useAllRoute from '@/Admin/Hooks/useAllRoute';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ─── Helper: 24hr → 12hr AM/PM ───────────────────────────────────────────────
const to12hr = (time24) => {
    if (!time24) return '—';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
};

// ─── All seat numbers ─────────────────────────────────────────────────────────
const ALL_SEATS = [
    'EX1', 'EX2', 'EX3', 'EX4', 'GD1',
    ...Array.from('ABCDEFGHI').flatMap(l => [`${l}1`, `${l}2`, `${l}3`, `${l}4`]),
    'J1', 'J2', 'J3', 'J4', 'J5',
];

const EMPTY_PASSENGER = {
    name: '', mobile: '', gender: 'Male', age: '',
    address: '', passportNo: '', nationality: 'Bangladesh',
    boardingPlace: '', email: '', boardingPoint: '', droppingPoint: '',
    goods: '', discount: 0, paymentMethod: 'Cash',
};

// ─────────────────────────────────────────────────────────────────────────────
const FilterBuses = () => {
    const navigate = useNavigate();
    const { busLoading, allBuses } = useAllBuses();
    const { allRoutes } = useAllRoute();

    // ── current user permissions ──
    const [userInfo, setUserInfo] = useState({
        canCancelBooking: false,
        onlyBooking: false,
        isAdmin: false,
        counterCode: '',
        counterName: '',
        role: '',
        selectedRoute: '',
    });

    // ── search / filter state ──
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [coachInput, setCoachInput] = useState('');

    // ── bus detail / booking state ──
    const [detailsBus, setDetailsBus] = useState(null);
    const [existingBookings, setExistingBookings] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerInfo, setPassengerInfo] = useState({ ...EMPTY_PASSENGER });

    // ── dashboard ──
    const [dashboardBookings, setDashboardBookings] = useState([]);

    // ── modals ──
    const [cancelModal, setCancelModal] = useState({ open: false, seatNumber: null });
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
    const [updatePasswordModal, setUpdatePasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // ── convert-to-sell: when a booked seat is being converted ──
    const [convertBookingId, setConvertBookingId] = useState(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Load current user info on mount
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const cc = localStorage.getItem('counterCode');
        if (!cc) return;
        axios.get(`${import.meta.env.VITE_BASE_URL}/user/check/${cc}`)
            .then(res => {
                const d = res.data;
                setUserInfo({
                    canCancelBooking: !!d.canCancelBooking,
                    onlyBooking: !!d.onlyBooking,
                    isAdmin: d.role === 'admin',
                    counterCode: d.counterID || cc,
                    counterName: d.counterName || '',
                    role: d.role,
                    selectedRoute: d.selectedRoute || '',
                });
            })
            .catch(() => toast.error('Session validation failed'));
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Dashboard bookings (today)
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchDashboardBookings();
    }, [date]);

    const fetchDashboardBookings = async () => {
        const cc = localStorage.getItem('counterCode');
        if (!cc) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/bbbbbb/${cc}/${date}`);
            setDashboardBookings(Array.isArray(res.data) ? res.data : []);
        } catch { /* silent */ }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch bookings for selected bus + date
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (detailsBus && date) fetchBookings();
        console.log('Selected Bus:', detailsBus?.damage_seats
        );
    }, [detailsBus, date]);

    const fetchBookings = async () => {
        if (!detailsBus?._id) return;
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/bookings/bus/${detailsBus._id}?date=${date}`
            );
            setExistingBookings(Array.isArray(res.data) ? res.data : []);
        } catch { setExistingBookings([]); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Boarding & dropping points from the selected bus
    // ─────────────────────────────────────────────────────────────────────────
    const boardingPoints = detailsBus?.all_boarding_points || [];   // [{boarding_point, time}]
    const droppingPoints = detailsBus?.all_dropping_points || [];   // [{dropping_point, time}]

    // For navbar "Leaving from" — collect all unique boarding points across route buses
    const routeBuses = userInfo.isAdmin
        ? allBuses
        : allBuses?.filter(b => b.bus_route === userInfo.selectedRoute);

    const allBoardingOptions = [
        ...new Map(
            (routeBuses || [])
                .flatMap(b => b.all_boarding_points || [])
                .map(p => [p.boarding_point, p])
        ).values()
    ];
    const allDroppingOptions = [
        ...new Map(
            (routeBuses || [])
                .flatMap(b => b.all_dropping_points || [])
                .map(p => [p.dropping_point, p])
        ).values()
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Seat helpers
    // ─────────────────────────────────────────────────────────────────────────
    const getSeatInfo = (seatNumber) => {
        const booking = existingBookings.find(b => b.seatNumber === seatNumber);
        if (booking) return { status: booking.bookingStatus, gender: booking.gender, booking };
        if (selectedSeats.includes(seatNumber)) return { status: 'selected' };
        return { status: 'available' };
    };

    const getSeatColor = (seatNumber) => {
        // damage seats management--->
        if (detailsBus?.damage_seats?.includes(seatNumber)) return 'text-center p-4  rounded shadow bg-red-950 text-white cursor-not-allowed';


        const { status, gender } = getSeatInfo(seatNumber);
        if (status === 'selected')
            return 'text-center p-4 rounded shadow bg-yellow-400 text-black cursor-pointer border-2 border-yellow-600';
        if (status === 'booked')
            return 'text-center p-4 rounded shadow bg-blue-800 text-white cursor-pointer';
        if (status === 'sold')
            return gender === 'Female'
                ? 'text-center p-4 rounded shadow bg-orange-700 text-white cursor-not-allowed'
                : 'text-center p-4 rounded shadow bg-rose-700 text-white cursor-not-allowed';
        return 'text-center p-4 rounded shadow bg-green-800 text-white cursor-pointer hover:bg-green-600';
    };

    const handleSeatClick = (seatNumber) => {

        // check damage seat --->
        if (detailsBus?.damage_seats?.includes(seatNumber)) return toast.error("This is damage seat not for booking or sell");

        const { status, booking } = getSeatInfo(seatNumber);
        const { isAdmin, canCancelBooking, onlyBooking, counterCode } = userInfo;

        if (status === 'available') {
            setSelectedSeats(prev =>
                prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
            );
            return;
        }

        if (status === 'booked') {
            // Same counter or admin → can convert to sell (if not onlyBooking user)
            const isSameCounter = booking?.counterCode === counterCode;
            if ((isSameCounter || isAdmin) && !onlyBooking) {
                setCancelModal({ open: true, seatNumber, mode: 'booked' });
                return;
            }
            // canCancel → cancel
            if (canCancelBooking || isAdmin) {
                setCancelModal({ open: true, seatNumber, mode: 'cancel' });
                return;
            }
            toast.error(`Seat ${seatNumber} is already booked!`);
            return;
        }

        if (status === 'sold') {
            if (canCancelBooking || isAdmin) {
                setCancelModal({ open: true, seatNumber, mode: 'cancel' });
                return;
            }
            toast.error(`Seat ${seatNumber} is already sold!`);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Cancel ticket
    // ─────────────────────────────────────────────────────────────────────────
    const handleConfirmCancel = async () => {
        const { seatNumber } = cancelModal;
        const booking = existingBookings.find(b => b.seatNumber === seatNumber);
        if (!booking?._id) return toast.error('Booking not found');

        setCancelLoading(true);
        const tid = toast.loading('Cancelling ticket...');
        try {
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/bookings/${booking._id}`);
            toast.success(`Seat ${seatNumber} cancelled`, { id: tid });
            fetchBookings();
            fetchDashboardBookings();
            setCancelModal({ open: false, seatNumber: null });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cancel failed', { id: tid });
        } finally {
            setCancelLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Convert booked → sell (open form pre-filled)
    // ─────────────────────────────────────────────────────────────────────────
    const handleConvertToSell = () => {
        const { seatNumber } = cancelModal;
        const booking = existingBookings.find(b => b.seatNumber === seatNumber);
        setConvertBookingId(booking._id);
        setSelectedSeats([seatNumber]);
        setPassengerInfo({
            name: booking.passengerName || '',
            mobile: booking.mobile || '',
            gender: booking.gender || 'Male',
            age: booking.age || '',
            address: booking.address || '',
            passportNo: booking.passportNo || '',
            nationality: booking.nationality || 'Bangladesh',
            boardingPlace: booking.boardingPlace || '',
            email: booking.email || '',
            boardingPoint: booking.boardingPoint || '',
            droppingPoint: booking.droppingPoint || '',
            goods: booking.goods || '',
            discount: booking.discount || 0,
            paymentMethod: booking.paymentMethod || 'Cash',
        });
        setCancelModal({ open: false, seatNumber: null });
        toast('Seat loaded for selling. Fill form and click SEAT SELL.', { icon: 'ℹ️' });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Fare calculation
    // ─────────────────────────────────────────────────────────────────────────
    const perSeatFare = detailsBus?.perSeatFees || 0;
    const grossPay = perSeatFare * selectedSeats.length;
    const discount = parseFloat(passengerInfo.discount) || 0;
    const netPay = grossPay - discount;

    // ─────────────────────────────────────────────────────────────────────────
    // Submit booking (onlyBooking → booked, else → sold)
    // ─────────────────────────────────────────────────────────────────────────
    const handleConfirmBooking = async () => {
        const { onlyBooking, counterCode, counterName } = userInfo;

        if (!passengerInfo.name.trim()) return toast.error('Passenger name required');
        if (selectedSeats.length === 0) return toast.error('Select at least one seat');

        // Full validation only for sell
        if (!onlyBooking) {
            if (!passengerInfo.mobile.trim()) return toast.error('Mobile required');
            if (!passengerInfo.boardingPoint) return toast.error('Boarding point required');
            if (!passengerInfo.droppingPoint) return toast.error('Dropping point required');
        }

        const tid = toast.loading('Processing...');
        try {
            for (const seat of selectedSeats) {
                const payload = {
                    busId: detailsBus._id,
                    bus_name: detailsBus.bus_name,
                    bus_number: detailsBus.bus_number,
                    travelDate: date,
                    seatNumber: seat,
                    passengerName: passengerInfo.name,
                    mobile: passengerInfo.mobile,
                    gender: passengerInfo.gender,
                    age: passengerInfo.age,
                    address: passengerInfo.address,
                    passportNo: passengerInfo.passportNo,
                    nationality: passengerInfo.nationality,
                    boardingPlace: passengerInfo.boardingPlace,
                    email: passengerInfo.email,
                    boardingPoint: passengerInfo.boardingPoint,
                    droppingPoint: passengerInfo.droppingPoint,
                    goods: passengerInfo.goods,
                    fare: perSeatFare,
                    discount: passengerInfo.discount,
                    netPay: netPay / selectedSeats.length,
                    paymentMethod: passengerInfo.paymentMethod,
                    bookingStatus: onlyBooking ? 'booked' : 'sold',
                    counterCode,
                    counterName,
                    bookingDate: new Date().toISOString(),
                };

                if (convertBookingId && !onlyBooking) {
                    // PATCH: booked → sold
                    await axios.patch(
                        `${import.meta.env.VITE_BASE_URL}/bookings/${convertBookingId}`,
                        { ...payload, bookingStatus: 'sold' }
                    );
                    setConvertBookingId(null);
                } else {
                    await axios.post(`${import.meta.env.VITE_BASE_URL}/bookings`, payload);
                }
            }

            toast.success(
                `${selectedSeats.length} seat(s) ${onlyBooking ? 'booked' : 'sold'} successfully!`,
                { id: tid }
            );
            handleReset();
            fetchBookings();
            fetchDashboardBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed. Try again.', { id: tid });
        }
    };

    const handleReset = () => {
        setSelectedSeats([]);
        setPassengerInfo({ ...EMPTY_PASSENGER });
        setConvertBookingId(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Quick Book — শুধু counterCode + counterName দিয়ে bookingStatus: 'booked'
    // ─────────────────────────────────────────────────────────────────────────
    const handleQuickBook = async () => {
        if (selectedSeats.length === 0) return toast.error('Select at least one seat');
        const { counterCode, counterName } = userInfo;
        const tid = toast.loading('Booking seats...');
        try {
            for (const seat of selectedSeats) {
                await axios.post(`${import.meta.env.VITE_BASE_URL}/bookings`, {
                    busId: detailsBus._id,
                    bus_name: detailsBus.bus_name,
                    bus_number: detailsBus.bus_number,
                    travelDate: date,
                    seatNumber: seat,
                    passengerName: '',
                    mobile: '',
                    gender: 'Male',
                    age: '',
                    boardingPoint: '',
                    droppingPoint: '',
                    fare: perSeatFare,
                    discount: 0,
                    netPay: perSeatFare,
                    paymentMethod: 'Cash',
                    bookingStatus: 'booked',
                    counterCode,
                    counterName,
                    bookingDate: new Date().toISOString(),
                });
            }
            toast.success(`${selectedSeats.length} seat(s) booked successfully!`, { id: tid });
            handleReset();
            fetchBookings();
            fetchDashboardBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Booking failed. Try again.', { id: tid });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Search / filter buses
    // ─────────────────────────────────────────────────────────────────────────
    const getRouteBuses = () => {
        if (userInfo.isAdmin) return allBuses || [];
        return (allBuses || []).filter(b => b.bus_route === userInfo.selectedRoute);
    };

    const handleLeavingFromChange = (e) => {
        const val = e.target.value;
        if (!val) { setFilteredBuses([]); return; }
        setFilteredBuses(getRouteBuses().filter(b =>
            (b.all_boarding_points || []).some(p => p.boarding_point === val)
        ));
        setDetailsBus(null);
    };

    const handleGoingToChange = (e) => {
        const val = e.target.value;
        if (!val) { setFilteredBuses([]); return; }
        setFilteredBuses(getRouteBuses().filter(b =>
            (b.all_dropping_points || []).some(p => p.dropping_point === val)
        ));
        setDetailsBus(null);
    };

    const handleCoachSearch = (val) => {
        setCoachInput(val);
        if (!val.trim()) { setFilteredBuses([]); return; }
        setFilteredBuses(getRouteBuses().filter(b =>
            b.bus_number?.toLowerCase().includes(val.toLowerCase())
        ));
        setDetailsBus(null);
    };

    const handleOpenBusDetails = (bus) => {
        setDetailsBus(bus);
        setFilteredBuses([]);
        handleReset();
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
        setSelectedSeats([]);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Stats
    // ─────────────────────────────────────────────────────────────────────────
    const booked = existingBookings.filter(b => b.bookingStatus === 'booked').length;
    const soldMale = existingBookings.filter(b => b.bookingStatus === 'sold' && b.gender === 'Male').length;
    const soldFemale = existingBookings.filter(b => b.bookingStatus === 'sold' && b.gender === 'Female').length;
    const available = ALL_SEATS.length - existingBookings.length;
    const totalRevenue = dashboardBookings.reduce((s, b) => s + (b.netPay || 0), 0);

    // ─────────────────────────────────────────────────────────────────────────
    // Password update
    // ─────────────────────────────────────────────────────────────────────────
    const handleUpdatePassword = async () => {
        if (newPassword !== confirmNewPassword) return toast.error('Passwords do not match');
        const cc = localStorage.getItem('counterCode');
        try {
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/user/update/${cc}`, { password: newPassword });
            toast.success('Password updated. Please login again.');
            localStorage.clear();
            navigate('/');
        } catch { toast.error('Failed to update password'); }
    };

    const handleLogout = () => {
        toast.loading('Logging out...');
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Cancel modal content
    // ─────────────────────────────────────────────────────────────────────────
    const cancelBookingData = cancelModal.seatNumber
        ? existingBookings.find(b => b.seatNumber === cancelModal.seatNumber)
        : null;

    const canConvertToSell =
        cancelModal.mode === 'booked' &&
        !userInfo.onlyBooking &&
        (cancelBookingData?.counterCode === userInfo.counterCode || userInfo.isAdmin);

    if (busLoading) return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2" />
                <div className="text-sm text-gray-500">Loading buses...</div>
            </div>
        </div>
    );

    // ═════════════════════════════════════════════════════════════════════════
    return (
        <div className="w-full min-h-screen bg-gray-50">

            {/* ── Cancel / Convert Modal ─────────────────────────────────── */}
            {cancelModal.open && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-bold text-red-700">
                                Seat {cancelModal.seatNumber} — {cancelBookingData?.bookingStatus?.toUpperCase()}
                            </h3>
                        </div>
                        {cancelBookingData && (
                            <div className="px-6 py-4 text-sm space-y-1 bg-gray-50">
                                <p><span className="font-semibold">Passenger:</span> {cancelBookingData.passengerName}</p>
                                <p><span className="font-semibold">Mobile:</span> {cancelBookingData.mobile}</p>
                                <p><span className="font-semibold">Gender:</span> {cancelBookingData.gender}</p>
                                <p><span className="font-semibold">Boarding:</span> {cancelBookingData.boardingPoint}</p>
                                <p><span className="font-semibold">Dropping:</span> {cancelBookingData.droppingPoint}</p>
                                <p><span className="font-semibold">Counter:</span> {cancelBookingData.counterCode}</p>
                                <p><span className="font-semibold">Net Pay:</span> ৳{cancelBookingData.netPay}</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 px-6 py-4">
                            <button
                                onClick={() => setCancelModal({ open: false, seatNumber: null })}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                            >
                                Close
                            </button>
                            {canConvertToSell && (
                                <button
                                    onClick={handleConvertToSell}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Convert to Sell
                                </button>
                            )}
                            {(userInfo.canCancelBooking || userInfo.isAdmin) && (
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={cancelLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-60"
                                >
                                    {cancelLoading ? 'Cancelling...' : 'Cancel Ticket'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Booking Details Modal ──────────────────────────────────── */}
            {showBookingDetailsModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
                            <button
                                onClick={() => setShowBookingDetailsModal(false)}
                                className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-sm"
                            >Close</button>
                        </div>
                        <div className="overflow-auto flex-1">
                            {existingBookings.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            {['Bus', 'Date', 'Counter', 'Passenger', 'Seat', 'Boarding/Dropping', 'Fare/Net', 'Status'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {existingBookings.map((b, i) => (
                                            <tr key={b._id || i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{b.bus_name}</div>
                                                    <div className="text-xs text-gray-500">{b.bus_number}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">{b.travelDate}</td>
                                                <td className="px-4 py-3">
                                                    <div>{b.counterCode}</div>
                                                    <div className="text-xs text-gray-500">{b.counterName}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{b.passengerName}</div>
                                                    <div className="text-xs text-gray-500">{b.gender} • {b.age}yr • {b.mobile}</div>
                                                </td>
                                                <td className="px-4 py-3 font-mono">{b.seatNumber}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div>↑ {b.boardingPoint}</div>
                                                    <div>↓ {b.droppingPoint}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-gray-500">৳{b.fare}</div>
                                                    <div className="font-semibold text-green-700">৳{b.netPay}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.bookingStatus === 'sold' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {b.bookingStatus?.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex items-center justify-center py-20 text-gray-400">No bookings found</div>
                            )}
                        </div>
                        {existingBookings.length > 0 && (
                            <div className="border-t px-6 py-3 text-xs text-gray-500 bg-gray-50">
                                {existingBookings.length} record(s)
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Update Password Modal ──────────────────────────────────── */}
            {updatePasswordModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Update Password</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full border rounded-lg p-2 mt-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                    className="w-full border rounded-lg p-2 mt-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button onClick={() => setUpdatePasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300">Cancel</button>
                            <button onClick={handleUpdatePassword} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ NAVBAR ══════════════════════════════════════ */}
            <div className="w-full py-3 bg-green-700 text-sm">
                <div className="w-11/12 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">

                    {/* Leaving from */}
                    <div>
                        <p className="text-white text-xs mb-1">Leaving from</p>
                        <select onChange={handleLeavingFromChange} className="bg-white p-2 rounded w-full text-sm outline-none">
                            <option value="">Select boarding point</option>
                            {allBoardingOptions.map((p, i) => (
                                <option key={i} value={p.boarding_point}>
                                    {p.boarding_point} · {to12hr(p.time)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Going to */}
                    <div>
                        <p className="text-white text-xs mb-1">Going to</p>
                        <select onChange={handleGoingToChange} className="bg-white p-2 rounded w-full text-sm outline-none">
                            <option value="">Select dropping point</option>
                            {allDroppingOptions.map((p, i) => (
                                <option key={i} value={p.dropping_point}>
                                    {p.dropping_point} · {to12hr(p.time)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Coach */}
                    <div>
                        <p className="text-white text-xs mb-1">Coach</p>
                        <input
                            value={coachInput}
                            onChange={e => handleCoachSearch(e.target.value)}
                            className="bg-white p-2 rounded w-full text-sm"
                            placeholder="Enter coach number"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <p className="text-white text-xs mb-1">Departing on</p>
                        <input
                            type="date"
                            value={date}
                            onChange={handleDateChange}
                            className="bg-white p-2 rounded w-full text-sm"
                        />
                    </div>

                    {/* Change Password */}
                    <div>
                        <p className="text-white text-xs mb-1">Change password</p>
                        <button
                            onClick={() => setUpdatePasswordModal(true)}
                            className="bg-rose-600 hover:bg-rose-700 text-white w-full p-2 rounded transition text-sm"
                        >
                            Update Password
                        </button>
                    </div>

                    {/* Logout */}
                    <div>
                        <p className="text-white text-xs mb-1">Back to login</p>
                        <button
                            onClick={handleLogout}
                            className="bg-rose-600 hover:bg-rose-700 text-white w-full p-2 rounded transition text-sm"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </div>

            {/* ═══════════════ BUS LIST (search results) ═══════════════════ */}
            {filteredBuses.length > 0 && (
                <div className="w-11/12 lg:w-8/12 mx-auto mt-4 border rounded shadow bg-white overflow-hidden">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-3 border-b">
                        <div className="col-span-3">Bus</div>
                        <div className="col-span-3">Route / Time</div>
                        <div className="col-span-2">Fare</div>
                        <div className="col-span-2">Coach No</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    {filteredBuses.map((bus, i) => {
                        const fromRoute = allRoutes?.find(r => r._id === bus.bus_route);
                        return (
                            <div key={i}>
                                {/* Desktop */}
                                <div className="hidden md:grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-gray-50 text-sm">
                                    <div className="col-span-3 font-medium text-gray-800">{bus.bus_name}</div>

                                    <div className="col-span-3 text-gray-600 text-xs">
                                        <div>{fromRoute?.from_location} → {fromRoute?.to_location}</div>
                                        <div className="text-gray-400">{to12hr(bus.bus_starting_time)} → {to12hr(bus.bus_last_stoppage_time)}</div>
                                    </div>
                                    <div className="col-span-2 text-gray-700">৳{bus.perSeatFees}</div>
                                    <div className="col-span-2 text-gray-500">{bus.bus_number}</div>
                                    <div className="col-span-2 text-right">
                                        <button
                                            onClick={() => handleOpenBusDetails(bus)}
                                            className="border border-gray-400 px-3 py-1 rounded text-sm text-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700 transition"
                                        >
                                            Book a Seat
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="md:hidden border-b p-3 space-y-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>{bus.bus_name}</span>
                                        <span className="text-gray-500 text-sm">{bus.bus_number}</span>
                                    </div>
                                    <div className="text-gray-600 text-sm">{fromRoute?.from_location} → {fromRoute?.to_location}</div>
                                    <div className="text-gray-500 text-xs">{to12hr(bus.bus_starting_time)} → {to12hr(bus.bus_last_stoppage_time)}</div>
                                    <div className="font-medium text-gray-700">Fare: ৳{bus.perSeatFees}</div>
                                    <button
                                        onClick={() => handleOpenBusDetails(bus)}
                                        className="w-full border border-gray-400 py-2 rounded text-sm hover:bg-green-700 hover:text-white transition"
                                    >
                                        Book a Seat
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══════════════ BUS BOOKING AREA ════════════════════════════ */}
            {detailsBus && (
                <div className="w-11/12 mx-auto my-4">

                    {/* Bus info table */}
                    <div className="overflow-x-auto">
                        <table className="text-xs w-full text-white">
                            <thead>
                                <tr className="bg-blue-950">
                                    {['SL', 'DEPARTING', 'COACH NO', 'ROUTE', 'START', 'END', 'FARE', 'COACH TYPE', 'SOLD', 'BOOKED', 'AVAILABLE'].map(h => (
                                        <th key={h} className="py-2 px-2 border">{h}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="text-black text-center">
                                    <td className="py-2 border border-gray-300">1</td>
                                    <td className="py-2 border border-gray-300">
                                        {date} · {to12hr(detailsBus.bus_starting_time)}
                                    </td>
                                    <td className="py-2 border border-gray-300">{detailsBus.bus_number}</td>


                                    <td className="py-2 border border-gray-300">{
                                        allRoutes?.find(r => r._id === detailsBus.bus_route)?.route_name || '—'
                                    }</td>


                                    <td className="py-2 border border-gray-300">
                                        {detailsBus.all_boarding_points?.[0]?.boarding_point || '—'}
                                    </td>
                                    <td className="py-2 border border-gray-300">
                                        {detailsBus.all_dropping_points?.slice(-1)[0]?.dropping_point || '—'}
                                    </td>
                                    <td className="py-2 border border-gray-300">৳{detailsBus.perSeatFees}</td>
                                    <td className="py-2 border border-gray-300">{detailsBus.couchType || 'Non-AC'}</td>
                                    <td className="py-2 border border-gray-300">{soldMale + soldFemale}</td>
                                    <td className="py-2 border border-gray-300">{booked}</td>
                                    <td className="py-2 border border-gray-300">{available}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="w-full grid grid-cols-12 gap-3 mt-2">

                        {/* ── Left: Seat Plan ── */}
                        <div className="col-span-3">
                            {/* Action buttons */}
                            <div className="flex gap-1 items-center flex-wrap justify-center">
                                {['Not Arrived', 'Not Depart', 'STATUS'].map(label => (
                                    <div key={label} className="rounded bg-rose-500 text-white text-[10px] p-1 px-2">{label}</div>
                                ))}
                                <div onClick={fetchBookings} className="rounded bg-rose-500 text-white text-[10px] p-1 px-2 cursor-pointer hover:bg-rose-600">REFRESH</div>
                                <div className="rounded bg-rose-500 text-white text-[10px] p-1 px-2">TRIP SEATS</div>
                                <div onClick={() => setShowBookingDetailsModal(true)} className="rounded bg-rose-500 text-white text-[10px] p-1 px-2 cursor-pointer hover:bg-rose-600">SEAT STATUS</div>
                            </div>

                            <div className="bg-green-600 text-white text-[10px] p-1 uppercase text-center mt-1">
                                Departure: {to12hr(detailsBus.bus_starting_time)}
                            </div>

                            {/* Stats mini table */}
                            <table className="w-full mt-1 border-collapse text-[10px]">
                                <thead>
                                    <tr>
                                        <th className="border py-1 font-medium" colSpan={2}>SOLD</th>
                                        <th className="border py-1 font-medium" colSpan={2}>BOOKED</th>
                                        <th className="border py-1 font-medium">AVAIL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        <td className="border py-1">♂ {soldMale}</td>
                                        <td className="border py-1">♀ {soldFemale}</td>
                                        <td className="border py-1 text-blue-600 font-semibold" colSpan={2}>{booked}</td>
                                        <td className="border py-1 text-green-700 font-semibold">{available}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Seat grid */}
                            <div className="bg-yellow-100 mt-2 p-1 border rounded">
                                <div className="w-full grid grid-cols-5 gap-1 text-[11px]">
                                    <div /><div />
                                    {['EX1', 'EX2'].map(s => <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>)}
                                    <div />
                                    <div onClick={() => handleSeatClick('GD1')} className={getSeatColor('GD1')}>GD1</div>
                                    <div />
                                    {['EX3', 'EX4'].map(s => <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>)}
                                    <div />
                                    {Array.from('ABCDEFGHI').map(l => (
                                        <React.Fragment key={l}>
                                            {[`${l}1`, `${l}2`].map(s => <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>)}
                                            <div />
                                            {[`${l}3`, `${l}4`].map(s => <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>)}
                                        </React.Fragment>
                                    ))}
                                    {['J1', 'J2', 'J5', 'J3', 'J4'].map(s => <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>)}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-2 p-2 bg-white border rounded text-[10px] space-y-1">
                                <p className="font-semibold">Legend:</p>
                                {[
                                    ['bg-green-700', 'Available'],
                                    ['bg-yellow-400 border-2 border-yellow-600', 'Selected'],
                                    ['bg-blue-600', 'Booked'],
                                    ['bg-green-600', 'Sold (Male)'],
                                    ['bg-pink-500', 'Sold (Female)'],
                                ].map(([cls, label]) => (
                                    <div key={label} className="flex items-center gap-1">
                                        <div className={`w-3 h-3 rounded ${cls}`} />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Booking Form ── */}
                        <div className="col-span-9">
                            <div className="border rounded">
                                <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit rounded-tl">Seat Information</p>

                                {/* Selected seats table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border p-2">SEAT NO</th>
                                                <th className="border p-2">FARE</th>
                                                <th className="border p-2">DISCOUNT</th>
                                                <th className="border p-2">REMOVE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSeats.map(seat => (
                                                <tr key={seat}>
                                                    <td className="border p-2 text-center font-mono">{seat}</td>
                                                    <td className="border p-2 text-center">৳{perSeatFare}</td>
                                                    <td className="border p-2 text-center">৳0</td>
                                                    <td className="border p-2 text-center">
                                                        <button onClick={() => setSelectedSeats(s => s.filter(x => x !== seat))} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 font-medium">
                                                <td className="border p-2 text-center">Total: <span className="text-red-500 text-base">{selectedSeats.length}</span></td>
                                                <td className="border p-2 text-center">Per seat: <span className="text-red-500 text-base">৳{perSeatFare}</span></td>
                                                <td className="border p-2 text-center">Total: <span className="text-red-500 text-base">৳{grossPay}</span></td>
                                                <td className="border p-2" />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* ── onlyBooking: quick form ── */}
                                {userInfo.onlyBooking ? (
                                    <div className="p-3 border-t">
                                        <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit mb-2">Quick Booking</p>
                                        <div className="grid grid-cols-3 border border-gray-300">
                                            <label className="p-2 border-r border-gray-300 font-bold text-xs">PASSENGER NAME <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={passengerInfo.name}
                                                onChange={e => setPassengerInfo(p => ({ ...p, name: e.target.value }))}
                                                className="col-span-2 p-2 bg-gray-50 text-xs outline-none border"
                                                placeholder="Enter passenger name"
                                            />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 px-1">Counter: <span className="font-semibold">{userInfo.counterCode}</span></div>
                                    </div>
                                ) : (
                                    /* ── Full passenger form ── */
                                    <div>
                                        <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit mt-2">Passenger Information</p>
                                        <div className="border border-gray-300 text-xs">

                                            {/* Name + Mobile */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">NAME <span className="text-red-500">*</span></label>
                                                    <input type="text" name="name" value={passengerInfo.name} onChange={e => setPassengerInfo(p => ({ ...p, name: e.target.value }))} className="col-span-2 p-2 bg-gray-50 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">MOBILE <span className="text-red-500">*</span></label>
                                                    <input type="text" name="mobile" value={passengerInfo.mobile} onChange={e => setPassengerInfo(p => ({ ...p, mobile: e.target.value }))} maxLength={11} className="col-span-2 p-2 bg-gray-50 outline-none" />
                                                </div>
                                            </div>

                                            {/* Gender + Age */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">GENDER <span className="text-red-500">*</span></label>
                                                    <select name="gender" value={passengerInfo.gender} onChange={e => setPassengerInfo(p => ({ ...p, gender: e.target.value }))} className="col-span-2 p-2 bg-gray-50 outline-none">
                                                        <option>Male</option><option>Female</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">AGE</label>
                                                    <input type="number" name="age" value={passengerInfo.age} onChange={e => setPassengerInfo(p => ({ ...p, age: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                            </div>

                                            {/* Boarding + Dropping */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">BOARDING <span className="text-red-500">*</span></label>
                                                    <select name="boardingPoint" value={passengerInfo.boardingPoint} onChange={e => setPassengerInfo(p => ({ ...p, boardingPoint: e.target.value }))} className="col-span-2 p-2 bg-gray-50 outline-none">
                                                        <option value="">Select</option>
                                                        {boardingPoints.map((pt, i) => (
                                                            <option key={i} value={pt.boarding_point}>{pt.boarding_point} · {to12hr(pt.time)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">DROPPING <span className="text-red-500">*</span></label>
                                                    <select name="droppingPoint" value={passengerInfo.droppingPoint} onChange={e => setPassengerInfo(p => ({ ...p, droppingPoint: e.target.value }))} className="col-span-2 p-2 bg-gray-50 outline-none">
                                                        <option value="">Select</option>
                                                        {droppingPoints.map((pt, i) => (
                                                            <option key={i} value={pt.dropping_point}>{pt.dropping_point} · {to12hr(pt.time)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="grid grid-cols-3 border-b border-gray-300">
                                                <label className="p-2 border-r border-gray-300 font-bold">ADDRESS</label>
                                                <input type="text" name="address" value={passengerInfo.address} onChange={e => setPassengerInfo(p => ({ ...p, address: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                            </div>

                                            {/* Passport + Nationality */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">PASSPORT NO</label>
                                                    <input type="text" name="passportNo" value={passengerInfo.passportNo} onChange={e => setPassengerInfo(p => ({ ...p, passportNo: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">NATIONALITY</label>
                                                    <input type="text" name="nationality" value={passengerInfo.nationality} onChange={e => setPassengerInfo(p => ({ ...p, nationality: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                            </div>

                                            {/* Boarding Place + Email */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">BOARDING PLACE</label>
                                                    <input type="text" name="boardingPlace" value={passengerInfo.boardingPlace} onChange={e => setPassengerInfo(p => ({ ...p, boardingPlace: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">E-MAIL</label>
                                                    <input type="email" name="email" value={passengerInfo.email} onChange={e => setPassengerInfo(p => ({ ...p, email: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                            </div>

                                            {/* Goods + Gross Pay */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">GOODS</label>
                                                    <input type="text" name="goods" value={passengerInfo.goods} onChange={e => setPassengerInfo(p => ({ ...p, goods: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">GROSS PAY</label>
                                                    <input readOnly value={`৳${grossPay}`} className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                            </div>

                                            {/* Discount + Net Pay */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">DISCOUNT</label>
                                                    <input type="number" name="discount" value={passengerInfo.discount} onChange={e => setPassengerInfo(p => ({ ...p, discount: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">NET PAY</label>
                                                    <input readOnly value={`৳${netPay}`} className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                            </div>

                                            {/* Total + Refund */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">TOTAL</label>
                                                    <input readOnly value={`৳${netPay}`} className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">REFUND</label>
                                                    <input readOnly defaultValue="0" className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                            </div>

                                            {/* Payment Method */}
                                            <div className="grid grid-cols-3">
                                                <label className="p-2 border-r border-gray-300 font-bold">PAYMENT <span className="text-red-500">*</span></label>
                                                <select name="paymentMethod" value={passengerInfo.paymentMethod} onChange={e => setPassengerInfo(p => ({ ...p, paymentMethod: e.target.value }))} className="col-span-2 p-2 bg-gray-200 outline-none">
                                                    <option>Cash</option>
                                                    <option>Bkash</option>
                                                    <option>Nagad</option>
                                                    <option>Card</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="p-4 flex gap-3 justify-end items-center flex-wrap">
                                    {convertBookingId && (
                                        <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                            Converting booked seat → sold
                                        </span>
                                    )}

                                    {/* SEAT BOOK — শুধু counter info দিয়ে quick booking */}
                                    {!userInfo.onlyBooking && (
                                        <button
                                            onClick={handleQuickBook}
                                            disabled={selectedSeats.length === 0}
                                            className={`px-5 py-2 rounded text-sm font-semibold text-white transition ${selectedSeats.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        >
                                            SEAT BOOK
                                        </button>
                                    )}

                                    {/* SEAT SELL — full form দিয়ে sell */}
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={selectedSeats.length === 0}
                                        className={`px-5 py-2 rounded text-sm font-semibold text-white transition ${selectedSeats.length === 0 ? 'bg-gray-400 cursor-not-allowed' : userInfo.onlyBooking ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {userInfo.onlyBooking ? 'SEAT BOOK' : convertBookingId ? 'CONFIRM SELL' : 'SEAT SELL'}
                                    </button>

                                    <button
                                        onClick={handleReset}
                                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded text-sm font-semibold"
                                    >
                                        RESET FORM
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ DASHBOARD (no bus selected) ═════════════════ */}
            {!detailsBus && filteredBuses.length === 0 && (
                <div className="w-80 mx-auto border rounded-xl shadow mt-8 overflow-hidden bg-white">
                    {[
                        { label: 'Date', value: date },
                        { label: "Today's Sells", value: dashboardBookings.filter(b => b.bookingStatus === 'sold').length },
                        { label: "Today's Online Sells", value: 0 },
                        { label: "Today's Ticket Sells", value: dashboardBookings.length },
                        { label: "Today's Revenue", value: `৳${totalRevenue}` },
                    ].map(({ label, value }) => (
                        <div key={label} className="border-b last:border-0">
                            <div className="bg-gray-600 text-white text-xs px-4 py-2">{label}</div>
                            <div className="flex justify-center items-center py-4 text-2xl font-semibold text-gray-800">{value}</div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default FilterBuses;