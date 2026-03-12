import useAllBuses from '@/Admin/Hooks/useAllBuses';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAllRoute from '@/Admin/Hooks/useAllRoute';
import { useNavigate } from 'react-router-dom';

// ── helpers ───────────────────────────────────────────────────
const to12hr = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    let hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ampm}`;
};

const BASE = import.meta.env.VITE_BASE_URL;

const TicketBookingUi = ({ activeRoute }) => {
    const navigate = useNavigate();
    const { busLoading, allBuses } = useAllBuses();
    const { allRoutes } = useAllRoute();

    // ── current user info ─────────────────────────────────────
    const counterCode = localStorage.getItem('counterCode') || '';
    const counterName = localStorage.getItem('counterName') || 'N/A';

    // Permission rules:
    // onlyBooking=true  → শুধু SEAT BOOK করতে পারবে (কোনো form নেই, counter info দিয়ে)
    // onlyBooking=false → SEAT BOOK + SEAT SELL দুটোই করতে পারবে
    // canCancelBooking  → booked/sold seat cancel করতে পারবে
    const [userPerms, setUserPerms] = useState({
        canCancelBooking: false,
        onlyBooking: false,
        isAdmin: false,
    });

    useEffect(() => {
        if (!counterCode) return;
        axios.get(`${BASE}/user/check/${counterCode}`).then(res => {
            if (res.status === 200) {
                const d = res.data;
                setUserPerms({
                    canCancelBooking: d.canCancelBooking === true || d.role === 'admin',
                    onlyBooking: d.onlyBooking === true && d.role !== 'admin',
                    isAdmin: d.role === 'admin',
                });
            }
        }).catch(() => { });
    }, [counterCode]);

    // ── filter / search state ─────────────────────────────────
    const [selectedBus, setSelectedBus] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // ── active bus (details view) ─────────────────────────────
    const [showBusDetails, setShowBusDetails] = useState(false);
    const [detailsBus, setDetailsBus] = useState(null);

    const boardingPoints = detailsBus?.all_boarding_points || [];
    const droppingPoints = detailsBus?.all_dropping_points || [];

    // ── bookings ──────────────────────────────────────────────
    const [existingBookings, setExistingBookings] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // ── dashboard ─────────────────────────────────────────────
    const [dashboardBookings, setDashboardBookings] = useState([]);
    const [todaysSells, setTodaysSells] = useState(0);

    // ── modals ────────────────────────────────────────────────
    const [showBookingDetails, setShowBookingDetails] = useState(false);
    const [cancelModal, setCancelModal] = useState({ open: false, seat: null });
    const [cancelLoading, setCancelLoading] = useState(false);
    const [openUpdatePasswordModal, setOpenUpdatePasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // ── passenger form (for SELL) ─────────────────────────────
    const emptyPassenger = {
        name: '', mobile: '', gender: 'Male', age: '',
        address: '', passportNo: '', nationality: 'Bangladesh',
        boardingPlace: '', email: '',
        boardingPoint: '', droppingPoint: '',
        goods: '', discount: 0, paymentMethod: 'Cash',
    };
    const [passengerInfo, setPassengerInfo] = useState(emptyPassenger);

    // ── seat layout ───────────────────────────────────────────
    const allSeats = [
        'EX1', 'EX2', 'EX3', 'EX4', 'GD1',
        ...Array.from('ABCDEFGHI').flatMap(l => [`${l}1`, `${l}2`, `${l}3`, `${l}4`]),
        'J1', 'J2', 'J3', 'J4', 'J5',
    ];

    // ── fetch helpers ─────────────────────────────────────────
    const fetchBookings = async () => {
        if (!detailsBus?._id) return;
        try {
            const r = await axios.get(`${BASE}/bookings/bus/${detailsBus._id}?date=${date}`);
            setExistingBookings(Array.isArray(r.data) ? r.data : []);
        } catch { setExistingBookings([]); }
    };

    const fetchDashboard = async () => {
        if (!counterCode) return;
        try {
            const r = await axios.get(`${BASE}/bbbbbb/${counterCode}/${date}`);
            setDashboardBookings(r.data);
            setTodaysSells(r.data.length);
        } catch { }
    };

    useEffect(() => { fetchDashboard(); }, [date]);
    useEffect(() => { if (detailsBus && date) fetchBookings(); }, [detailsBus, date]);

    // ── seat status ───────────────────────────────────────────
    const getSeatInfo = (seat) => {
        const b = existingBookings.find(b => b.seatNumber === seat);
        if (b) return { status: b.bookingStatus, gender: b.gender, booking: b };
        if (selectedSeats.includes(seat)) return { status: 'selected' };
        return { status: 'available' };
    };

    const getSeatColor = (seatNumber) => {
        const { status, gender } = getSeatInfo(seatNumber);
        if (status === 'selected')
            return 'text-center p-4 rounded shadow bg-yellow-400 text-black cursor-pointer border-2 border-yellow-600';
        if (status === 'booked')
            return 'text-center p-4 rounded shadow bg-blue-700 text-white cursor-pointer';
        if (status === 'sold')
            return gender === 'Female'
                ? 'text-center p-4 rounded shadow bg-orange-600 text-white cursor-not-allowed'
                : 'text-center p-4 rounded shadow bg-rose-600 text-white cursor-not-allowed';
        return 'text-center p-4 rounded shadow bg-green-800 text-white cursor-pointer hover:bg-green-600';
    };
    // seat click — booked/sold যেকোনো seat এ click করলে modal খুলবে
    // Cancel button শুধু নিজের seat এ দেখাবে (same counterCode) বা admin
    const handleSeatClick = (seat) => {
        const info = getSeatInfo(seat);
        if (info.status === 'available' || info.status === 'selected') {
            setSelectedSeats(prev =>
                prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
            );
            return;
        }
        // booked বা sold — সবসময় modal দেখাবে (details + conditional buttons)
        setCancelModal({ open: true, seat });
    };

    // ── cancel ticket ─────────────────────────────────────────
    const handleConfirmCancel = async () => {
        const booking = existingBookings.find(b => b.seatNumber === cancelModal.seat);
        if (!booking?._id) { toast.error('Booking not found'); return; }
        if (!window.confirm(`Cancel seat ${cancelModal.seat}?`)) return;
        setCancelLoading(true);
        const tid = toast.loading('Cancelling...');
        try {
            await axios.delete(`${BASE}/bookings/${booking._id}`);
            toast.success(`Seat ${cancelModal.seat} cancelled`, { id: tid });
            fetchBookings(); fetchDashboard();
            setCancelModal({ open: false, seat: null });
        } catch (e) {
            toast.error(e.response?.data?.message || 'Cancel failed', { id: tid });
        } finally { setCancelLoading(false); }
    };

    // ── QUICK BOOK — শুধু counterCode + counterName, কোনো form নেই ──────────
    const handleQuickBook = async () => {
        if (selectedSeats.length === 0) { toast.error('Select at least one seat'); return; }
        const tid = toast.loading('Booking...');
        try {
            for (const seat of selectedSeats) {
                await axios.post(`${BASE}/bookings`, {
                    busId: detailsBus._id,
                    bus_name: detailsBus.bus_name,
                    bus_number: detailsBus.bus_number,
                    travelDate: date,
                    seatNumber: seat,
                    passengerName: '',
                    gender: 'Male',
                    bookingStatus: 'booked',
                    counterCode,
                    counterName,
                    fare: detailsBus.perSeatFees,
                    discount: 0,
                    netPay: detailsBus.perSeatFees,
                    bookingDate: new Date().toISOString(),
                });
            }
            toast.success(`${selectedSeats.length} seat(s) booked!`, { id: tid });
            setSelectedSeats([]);
            fetchBookings(); fetchDashboard();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Booking failed', { id: tid });
        }
    };

    // ── SELL — full passenger form দিয়ে ─────────────────────────────────────
    const fare = (() => {
        const perSeatFare = detailsBus?.perSeatFees || 0;
        const grossPay = perSeatFare * selectedSeats.length;
        const discount = parseFloat(passengerInfo.discount) || 0;
        return { perSeatFare, grossPay, discount, netPay: grossPay - discount };
    })();

    const validateSell = () => {
        const req = ['name', 'mobile', 'gender', 'boardingPoint', 'droppingPoint'];
        for (const f of req) {
            if (!passengerInfo[f]?.toString().trim()) {
                toast.error(`Fill in ${f.toUpperCase()}`); return false;
            }
        }
        if (selectedSeats.length === 0) { toast.error('Select at least one seat'); return false; }
        if (passengerInfo.mobile.length < 10) { toast.error('Invalid mobile number'); return false; }
        return true;
    };

    const handleSellSeats = async () => {
        if (!validateSell()) return;
        const tid = toast.loading('Processing...');
        try {
            for (const seat of selectedSeats) {
                const existing = existingBookings.find(
                    b => b.seatNumber === seat && b.bookingStatus === 'booked'
                );
                if (existing) {
                    // booked → sold (PATCH)
                    await axios.patch(`${BASE}/bookings/${existing._id}`, {
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
                        fare: detailsBus.perSeatFees,
                        discount: passengerInfo.discount,
                        netPay: fare.netPay / selectedSeats.length,
                        paymentMethod: passengerInfo.paymentMethod,
                        bookingStatus: 'sold',
                    });
                } else {
                    // new → sold (POST)
                    await axios.post(`${BASE}/bookings`, {
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
                        fare: detailsBus.perSeatFees,
                        discount: passengerInfo.discount,
                        netPay: fare.netPay / selectedSeats.length,
                        paymentMethod: passengerInfo.paymentMethod,
                        bookingStatus: 'sold',
                        counterCode,
                        counterName,
                        bookingDate: new Date().toISOString(),
                    });
                }
            }
            toast.success(`${selectedSeats.length} seat(s) sold!`, { id: tid });
            setSelectedSeats([]);
            setPassengerInfo(emptyPassenger);
            fetchBookings(); fetchDashboard();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed', { id: tid });
        }
    };

    const handleReset = () => {
        setSelectedSeats([]);
        setPassengerInfo(emptyPassenger);
    };

    // ── bus search helpers ────────────────────────────────────
    const filterByRoute = (buses) => {
        if (userPerms.isAdmin) return buses;
        const route = allRoutes?.find(r => r.route_name === activeRoute);
        return route ? buses.filter(b => b.bus_route === route._id) : buses;
    };

    const handleBusCodeSearch = (val) => {
        if (!val.trim()) { setSelectedBus([]); return; }
        setSelectedBus(filterByRoute(allBuses.filter(b =>
            b.bus_number?.toLowerCase().includes(val.toLowerCase())
        )));
    };

    const handleFromChange = (val) => {
        if (!val) { setSelectedBus([]); return; }
        setSelectedBus(filterByRoute(allBuses.filter(b =>
            b.all_boarding_points?.some(p => p.boarding_point === val)
        )));
    };

    const handleToChange = (val) => {
        if (!val) { setSelectedBus([]); return; }
        setSelectedBus(filterByRoute(allBuses.filter(b =>
            b.all_dropping_points?.some(p => p.dropping_point === val)
        )));
    };

    const routeBuses = filterByRoute(allBuses || []);
    const allBoardingOptions = [...new Map(
        routeBuses.flatMap(b => b.all_boarding_points || []).map(p => [p.boarding_point, p])
    ).values()];
    const allDroppingOptions = [...new Map(
        routeBuses.flatMap(b => b.all_dropping_points || []).map(p => [p.dropping_point, p])
    ).values()];

    const handleOpenBusDetails = (bus) => {
        setDetailsBus(bus);
        setShowBusDetails(true);
        setSelectedBus([]);
        handleReset();
    };

    // ── stats ─────────────────────────────────────────────────
    const booked = existingBookings.filter(b => b.bookingStatus === 'booked').length;
    const soldMale = existingBookings.filter(b => b.bookingStatus === 'sold' && b.gender === 'Male').length;
    const soldFemale = existingBookings.filter(b => b.bookingStatus === 'sold' && b.gender === 'Female').length;
    const available = allSeats.length - existingBookings.length;

    // cancel modal data
    const cancelBk = cancelModal.seat
        ? existingBookings.find(b => b.seatNumber === cancelModal.seat)
        : null;
    const cancelIsBooked = cancelBk?.bookingStatus === 'booked';
    const cancelIsMine = cancelBk?.counterCode === counterCode;
    // নিজের seat cancel করতে পারবে (canCancelBooking=true হলে) অথবা admin
    const canCancelThisSeat = (cancelIsMine && userPerms.canCancelBooking) || userPerms.isAdmin;
    // Convert to sell: booked + not onlyBooking + (same counter or admin)
    const canConvertToSell = cancelIsBooked && !userPerms.onlyBooking && (cancelIsMine || userPerms.isAdmin);

    // ── password update ───────────────────────────────────────
    const handleUpdatePassword = async () => {
        if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }
        try {
            await axios.patch(`${BASE}/user/update/${counterCode}`, { password: newPassword });
            toast.success('Password updated');
            localStorage.clear(); navigate('/');
        } catch { toast.error('Failed to update password'); }
    };

    const handleLogout = () => {
        localStorage.clear(); navigate('/'); window.location.reload();
    };

    if (busLoading) return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2" />
                <div className="text-sm text-gray-500">Loading buses...</div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────
    return (
        <div className="w-full min-h-screen bg-gray-50">

            {/* ══ Cancel / Action Modal ════════════════════════════════════ */}
            {cancelModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div
                        className={`
      bg-gradient-to-b from-white to-gray-50 
      rounded-2xl sm:rounded-3xl 
      p-5 sm:p-7 
      w-full max-w-md lg:max-w-lg 
      shadow-2xl ring-1 ring-black/5 
      transform transition-all duration-300 scale-100
    `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                Seat {cancelModal.seat}
                            </h3>

                            <div className={`
        px-4 py-1.5 rounded-full font-semibold text-sm flex items-center gap-2 shadow-sm
        ${cancelIsBooked
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}
      `}>
                                {cancelIsBooked ? (
                                    <>🔵 Booked</>
                                ) : (
                                    <>🟢 Sold</>
                                )}
                            </div>
                        </div>

                        {/* Passenger Info Card */}
                        {cancelBk && (
                            <div className="mb-6 bg-white/80 rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    {cancelBk.passengerName && (
                                        <div>
                                            <dt className="text-gray-500 font-medium">Passenger</dt>
                                            <dd className="text-gray-900 font-semibold">{cancelBk.passengerName}</dd>
                                        </div>
                                    )}

                                    {cancelBk.mobile && (
                                        <div>
                                            <dt className="text-gray-500 font-medium">Mobile</dt>
                                            <dd className="text-gray-900 font-semibold">{cancelBk.mobile}</dd>
                                        </div>
                                    )}

                                    <div>
                                        <dt className="text-gray-500 font-medium">Gender</dt>
                                        <dd className="text-gray-900 capitalize">{cancelBk.gender}</dd>
                                    </div>

                                    <div>
                                        <dt className="text-gray-500 font-medium">Booked by</dt>
                                        <dd className="text-gray-900 font-semibold">{cancelBk.counterCode}</dd>
                                    </div>

                                    {cancelBk.boardingPoint && (
                                        <div>
                                            <dt className="text-gray-500 font-medium">Boarding</dt>
                                            <dd className="text-gray-900">{cancelBk.boardingPoint}</dd>
                                        </div>
                                    )}

                                    {cancelBk.droppingPoint && (
                                        <div>
                                            <dt className="text-gray-500 font-medium">Dropping</dt>
                                            <dd className="text-gray-900">{cancelBk.droppingPoint}</dd>
                                        </div>
                                    )}

                                    <div className="col-span-full pt-2 border-t border-gray-100 mt-1">
                                        <dt className="text-gray-600 font-medium">Net Pay</dt>
                                        <dd className="text-xl font-bold text-emerald-600">৳{cancelBk.netPay}</dd>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-2">
                            <button
                                onClick={() => setCancelModal({ open: false, seat: null })}
                                className={`
          px-5 py-2.5 rounded-xl font-medium text-sm
          bg-gray-200 hover:bg-gray-300 active:bg-gray-400
          transition-all duration-200
        `}
                            >
                                Close
                            </button>

                            {/* View-only hint */}
                            {!cancelIsMine && !userPerms.isAdmin && (
                                <div className="text-xs text-gray-500 italic self-center sm:mr-auto">
                                    View only — booked by another counter
                                </div>
                            )}

                            {/* Convert to Sell */}
                            {canConvertToSell && (
                                <button
                                    onClick={() => {
                                        if (!selectedSeats.includes(cancelModal.seat))
                                            setSelectedSeats(prev => [...prev, cancelModal.seat]);
                                        setCancelModal({ open: false, seat: null });
                                        toast('Seat added — fill passenger info and click SEAT SELL', { icon: '📋' });
                                    }}
                                    className={`
            px-6 py-2.5 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-green-600 to-emerald-600
            hover:from-green-700 hover:to-emerald-700
            text-white shadow-md hover:shadow-lg
            transform hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
          `}
                                >
                                    Convert to Sell
                                </button>
                            )}

                            {/* Cancel Ticket (destructive) */}
                            {canCancelThisSeat && (
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={cancelLoading}
                                    className={`
            px-6 py-2.5 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-red-600 to-rose-600
            hover:from-red-700 hover:to-rose-700
            text-white shadow-md hover:shadow-lg
            transform hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            disabled:transform-none disabled:shadow-none
          `}
                                >
                                    {cancelLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Cancelling...
                                        </span>
                                    ) : (
                                        'Cancel Ticket'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Booking Details Modal ═════════════════════════════════════ */}
            {showBookingDetails && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
                            <button onClick={() => setShowBookingDetails(false)}
                                className="px-5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-medium text-sm">
                                Close
                            </button>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto flex-1">
                            {existingBookings.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            {['Bus', 'Date', 'Counter', 'Passenger', 'Seat', 'Boarding/Dropping', 'Fare/Net', 'Status'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">{h}</th>
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
                                                <td className="px-4 py-3 text-xs text-gray-600">{b.travelDate}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div>{b.counterCode}</div>
                                                    <div className="text-gray-400">{b.counterName}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{b.passengerName || '—'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {b.gender}{b.age ? ` · ${b.age}y` : ''}{b.mobile ? ` · ${b.mobile}` : ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono font-bold">{b.seatNumber}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div>{b.boardingPoint || '—'}</div>
                                                    <div className="text-gray-400">↓ {b.droppingPoint || '—'}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-gray-500 text-xs">৳{b.fare}</div>
                                                    <div className="font-semibold text-green-700">৳{b.netPay}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.bookingStatus === 'sold' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
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
                                {existingBookings.length} record(s) · Booked: {booked} · Sold M: {soldMale} · Sold F: {soldFemale}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══ Update Password Modal ══════════════════════════════════════ */}
            {openUpdatePasswordModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Update Password</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm mb-1">New Password</p>
                                <input onChange={e => setNewPassword(e.target.value)} type="password"
                                    className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="New password" />
                            </div>
                            <div>
                                <p className="text-sm mb-1">Confirm Password</p>
                                <input onChange={e => setConfirmNewPassword(e.target.value)} type="password"
                                    className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Confirm password" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleUpdatePassword}
                                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm">Update</button>
                            <button onClick={() => setOpenUpdatePasswordModal(false)}
                                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Navbar ════════════════════════════════════════════════════ */}
            <div className="w-full py-3 text-sm bg-green-700">
                <div className="w-11/12 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">

                    <div className="w-full">
                        <p className="text-white text-xs sm:text-sm">Leaving from</p>
                        <select onChange={e => handleFromChange(e.target.value)}
                            className="bg-white p-2 outline-none rounded w-full text-sm">
                            <option value="">Select boarding point</option>
                            {allBoardingOptions.map((p, i) => (
                                <option key={i} value={p.boarding_point}>
                                    {p.boarding_point}{p.time ? ` · ${to12hr(p.time)}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <p className="text-white text-xs sm:text-sm">Going to</p>
                        <select onChange={e => handleToChange(e.target.value)}
                            className="bg-white p-2 outline-none rounded w-full text-sm">
                            <option value="">Select dropping point</option>
                            {allDroppingOptions.map((p, i) => (
                                <option key={i} value={p.dropping_point}>
                                    {p.dropping_point}{p.time ? ` · ${to12hr(p.time)}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <p className="text-white text-xs sm:text-sm">Coach</p>
                        <input onChange={e => handleBusCodeSearch(e.target.value)}
                            className="bg-white p-2 rounded w-full text-sm" placeholder="Enter coach number" type="text" />
                    </div>

                    <div className="w-full">
                        <p className="text-white text-xs sm:text-sm">Departing on</p>
                        <input value={date} onChange={e => { setDate(e.target.value); setSelectedSeats([]); }}
                            className="bg-white p-2 rounded w-full text-sm" type="date" />
                    </div>

                    <div className="w-full">
                        <p className="text-white text-xs sm:text-sm">Change password</p>
                        <button onClick={() => setOpenUpdatePasswordModal(true)}
                            className="bg-rose-600 text-white w-full p-2 rounded hover:bg-rose-700 transition text-sm">
                            Update Password
                        </button>
                    </div>

                    <div className="w-full">
                        <p className="text-white text-xs sm:text-sm">Back to login</p>
                        <button onClick={handleLogout}
                            className="bg-rose-600 text-white w-full p-2 rounded hover:bg-rose-700 transition text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ Bus Search Results ═════════════════════════════════════════ */}
            {selectedBus.length > 0 && (
                <div className="w-11/12 mx-auto md:w-2/3 border p-4 shadow rounded mt-4 bg-white">
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="grid grid-cols-12 bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 border-b">
                            <div className="col-span-3">Bus</div>
                            <div className="col-span-3">Time</div>
                            <div className="col-span-2">Fare</div>
                            <div className="col-span-2">Coach No</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>
                        {selectedBus.map((bus, i) => (
                            <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-0 hover:bg-gray-50 text-sm">
                                <div className="col-span-3 font-medium text-gray-800">{bus.bus_name}</div>
                                <div className="col-span-3 text-gray-600 text-xs">
                                    {to12hr(bus.bus_starting_time)} → {to12hr(bus.bus_last_stoppage_time)}
                                </div>
                                <div className="col-span-2 text-gray-700">৳{bus.perSeatFees}</div>
                                <div className="col-span-2 text-gray-500">{bus.bus_number}</div>
                                <div className="col-span-2 text-right">
                                    <button onClick={() => handleOpenBusDetails(bus)}
                                        className="border border-gray-400 px-3 py-1 rounded text-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700 transition text-xs">
                                        Book a Seat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══ Bus Details Section ════════════════════════════════════════ */}
            {showBusDetails && detailsBus && (
                <div className="w-11/12 mx-auto my-4">

                    {/* Bus info table */}
                    <div className="overflow-x-auto">
                        <table className="text-xs w-full text-white">
                            <thead>
                                <tr className="bg-blue-950">
                                    {['SL', 'TIME', 'COACH NO', 'ROUTE', 'FROM', 'TO', 'FARE', 'TYPE', 'BOOKED', 'SOLD', 'AVAILABLE'].map(h => (
                                        <th key={h} className="py-2 border px-1">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-black text-center">
                                    <td className="py-2 border border-gray-300">1</td>
                                    <td className="py-2 border border-gray-300">
                                        {to12hr(detailsBus.bus_starting_time)} → {to12hr(detailsBus.bus_last_stoppage_time)}
                                        <div className="text-xs text-gray-400">{date}</div>
                                    </td>
                                    <td className="py-2 border border-gray-300">{detailsBus.bus_number}</td>
                                    <td className="py-2 border border-gray-300">{
                                        allRoutes?.find(r => r._id === detailsBus.bus_route)?.route_name || '—'
                                    }</td>
                                    <td className="py-2 border border-gray-300">{boardingPoints[0]?.boarding_point || '—'}</td>
                                    <td className="py-2 border border-gray-300">{droppingPoints[droppingPoints.length - 1]?.dropping_point || '—'}</td>
                                    <td className="py-2 border border-gray-300">৳{detailsBus.perSeatFees}</td>
                                    <td className="py-2 border border-gray-300">{detailsBus.couchType || 'Non-AC'}</td>
                                    <td className="py-2 border border-gray-300 text-blue-600 font-bold">{booked}</td>
                                    <td className="py-2 border border-gray-300 text-green-700 font-bold">{soldMale + soldFemale}</td>
                                    <td className="py-2 border border-gray-300">{available}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="w-full grid grid-cols-12 gap-3 mt-2">

                        {/* ── Left: Seat Plan ── */}
                        <div className="col-span-3">
                            <div className="flex gap-1 items-center flex-wrap justify-center">
                                {['Not Arrived', 'Not Depart', 'STATUS'].map(label => (
                                    <div key={label} className="rounded bg-rose-500 text-white text-[10px] p-1.5 px-2">{label}</div>
                                ))}
                                <div onClick={fetchBookings}
                                    className="rounded bg-rose-500 text-white text-[10px] p-1.5 px-2 cursor-pointer hover:bg-rose-600">
                                    REFRESH
                                </div>
                                <div onClick={() => setShowBookingDetails(true)}
                                    className="rounded cursor-pointer bg-rose-500 text-white text-[10px] p-1.5 px-2">
                                    SEAT STATUS
                                </div>
                            </div>

                            <div className="bg-green-600 text-white text-[10px] p-1.5 uppercase text-center mt-1">
                                Departure: {to12hr(detailsBus.bus_starting_time)}
                            </div>

                            {/* Stats mini-table */}
                            <table className="w-full mt-1 border-collapse text-[10px]">
                                <thead>
                                    <tr>
                                        <th className="border py-1" colSpan={2}>BOOKED</th>
                                        <th className="border py-1" colSpan={2}>SOLD</th>
                                        <th className="border py-1">AVAIL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        <td className="border py-1 text-blue-600 font-bold" colSpan={2}>{booked}</td>
                                        <td className="border py-1 text-green-700 font-bold">♂ {soldMale}</td>
                                        <td className="border py-1 text-pink-600 font-bold">♀ {soldFemale}</td>
                                        <td className="border py-1 font-semibold">{available}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Seat grid */}
                            <div className="bg-yellow-200 mt-2 p-1 border rounded">
                                <div className="w-full grid grid-cols-5 gap-1 text-[11px]">
                                    <div /><div />
                                    {['EX1', 'EX2'].map(s => (
                                        <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>
                                    ))}
                                    <div />
                                    <div onClick={() => handleSeatClick('GD1')} className={getSeatColor('GD1')}>GD1</div>
                                    <div />
                                    {['EX3', 'EX4'].map(s => (
                                        <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>
                                    ))}
                                    <div />
                                    {Array.from('ABCDEFGHI').map(letter => (
                                        <React.Fragment key={letter}>
                                            {[`${letter}1`, `${letter}2`].map(s => (
                                                <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>
                                            ))}
                                            <div />
                                            {[`${letter}3`, `${letter}4`].map(s => (
                                                <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {['J1', 'J2'].map(s => (
                                        <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>
                                    ))}
                                    <div onClick={() => handleSeatClick('J5')} className={getSeatColor('J5')}>J5</div>
                                    {['J3', 'J4'].map(s => (
                                        <div key={s} onClick={() => handleSeatClick(s)} className={getSeatColor(s)}>{s}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-2 p-2 bg-white border rounded text-[10px] space-y-1">
                                <p className="font-semibold">Legend:</p>
                                {[
                                    { color: 'bg-green-700', label: 'Available' },
                                    { color: 'bg-yellow-400 border-2 border-yellow-600', label: 'Selected' },
                                    { color: 'bg-blue-600', label: 'Booked' },
                                    { color: 'bg-green-600', label: 'Sold (Male)' },
                                    { color: 'bg-pink-500', label: 'Sold (Female)' },
                                ].map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-1">
                                        <div className={`w-3.5 h-3.5 rounded ${color}`} />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Booking / Sell Panel ── */}
                        <div className="col-span-9">
                            <div className="border rounded overflow-hidden">
                                <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit">Seat Information</p>

                                {/* Selected seats table */}
                                <table className="w-full border-collapse border text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-center">SEAT NO</th>
                                            <th className="border p-2 text-center">FARE</th>
                                            <th className="border p-2 text-center">STATUS</th>
                                            <th className="border p-2 text-center">REMOVE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSeats.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="border p-3 text-center text-gray-400 text-xs">
                                                    No seats selected — click on a seat to select
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {selectedSeats.map(seat => {
                                                    const info = getSeatInfo(seat);
                                                    return (
                                                        <tr key={seat}>
                                                            <td className="border p-2 text-center font-bold font-mono">{seat}</td>
                                                            <td className="border p-2 text-center">৳{detailsBus.perSeatFees}</td>
                                                            <td className="border p-2 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${info.status === 'booked' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {info.status === 'booked' ? 'Convert → Sell' : 'New'}
                                                                </span>
                                                            </td>
                                                            <td className="border p-2 text-center">
                                                                <button
                                                                    onClick={() => setSelectedSeats(prev => prev.filter(s => s !== seat))}
                                                                    className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-gray-50 font-medium text-xs">
                                                    <td className="border p-2 text-center">
                                                        TOTAL: <span className="text-red-500 text-base">{selectedSeats.length}</span>
                                                    </td>
                                                    <td className="border p-2 text-center" colSpan={3}>
                                                        GROSS: <span className="text-red-500 text-base">৳{fare.grossPay}</span>
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>

                                {/* ══ onlyBooking=true → শুধু SEAT BOOK button, কোনো form নেই ══ */}
                                {userPerms.onlyBooking && (
                                    <div className="p-4 border-t bg-blue-50 flex items-center justify-between flex-wrap gap-3">
                                        <div className="text-xs text-gray-500">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold mr-2">
                                                Only Booking Mode
                                            </span>
                                            Counter: <strong>{counterCode}</strong>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleQuickBook}
                                                disabled={selectedSeats.length === 0}
                                                className={`px-6 py-2 text-sm font-semibold text-white rounded transition ${selectedSeats.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                SEAT BOOK
                                            </button>
                                            <button onClick={handleReset}
                                                className="bg-red-500 text-white px-4 py-2 text-sm font-semibold rounded hover:bg-red-600">
                                                RESET
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ══ onlyBooking=false → full form + SEAT BOOK + SEAT SELL ══ */}
                                {!userPerms.onlyBooking && (
                                    <div>
                                        <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit mt-2">
                                            Passenger Information
                                        </p>

                                        <div className="w-full text-xs border border-gray-300">

                                            {/* Name + Mobile */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">PASSENGER NAME <span className="text-red-500">*</span>:</label>
                                                    <input type="text" name="name" value={passengerInfo.name}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-50 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">MOBILE <span className="text-red-500">*</span>:</label>
                                                    <input type="text" name="mobile" value={passengerInfo.mobile} maxLength="11"
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-50 outline-none" />
                                                </div>
                                            </div>

                                            {/* Gender + Age */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">GENDER <span className="text-red-500">*</span>:</label>
                                                    <select name="gender" value={passengerInfo.gender}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none">
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">AGE:</label>
                                                    <input type="number" name="age" value={passengerInfo.age}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                            </div>

                                            {/* Boarding + Dropping */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">BOARDING POINT <span className="text-red-500">*</span>:</label>
                                                    <select name="boardingPoint" value={passengerInfo.boardingPoint}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none">
                                                        <option value="">Select</option>
                                                        {boardingPoints.map((p, i) => (
                                                            <option key={i} value={p.boarding_point}>
                                                                {p.boarding_point}{p.time ? ` · ${to12hr(p.time)}` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">DROPPING POINT <span className="text-red-500">*</span>:</label>
                                                    <select name="droppingPoint" value={passengerInfo.droppingPoint}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none">
                                                        <option value="">Select</option>
                                                        {droppingPoints.map((p, i) => (
                                                            <option key={i} value={p.dropping_point}>
                                                                {p.dropping_point}{p.time ? ` · ${to12hr(p.time)}` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="grid grid-cols-3 border-b border-gray-300">
                                                <label className="p-2 border-r border-gray-300 font-bold">ADDRESS:</label>
                                                <input type="text" name="address" value={passengerInfo.address}
                                                    onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                    className="col-span-2 p-2 bg-gray-200 outline-none" />
                                            </div>

                                            {/* Passport + Nationality */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">PASSPORT NO:</label>
                                                    <input type="text" name="passportNo" value={passengerInfo.passportNo}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">NATIONALITY:</label>
                                                    <input type="text" name="nationality" value={passengerInfo.nationality}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                            </div>

                                            {/* Boarding Place + Email */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">BOARDING PLACE:</label>
                                                    <input type="text" name="boardingPlace" value={passengerInfo.boardingPlace}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">E-MAIL:</label>
                                                    <input type="email" name="email" value={passengerInfo.email}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                            </div>

                                            {/* Goods + Gross Pay */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">GOODS:</label>
                                                    <input type="text" name="goods" value={passengerInfo.goods}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">GROSS PAY:</label>
                                                    <input readOnly value={`৳${fare.grossPay}`}
                                                        className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                            </div>

                                            {/* Discount + Net Pay */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">DISCOUNT:</label>
                                                    <input type="number" name="discount" value={passengerInfo.discount}
                                                        onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                        className="col-span-2 p-2 bg-gray-200 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">NET PAY:</label>
                                                    <input readOnly value={`৳${fare.netPay}`}
                                                        className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                            </div>

                                            {/* Total + Refund */}
                                            <div className="grid grid-cols-2 border-b border-gray-300">
                                                <div className="grid grid-cols-3 border-r border-gray-300">
                                                    <label className="p-2 border-r border-gray-300 font-bold">TOTAL:</label>
                                                    <input readOnly value={`৳${fare.netPay}`}
                                                        className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <label className="p-2 border-r border-gray-300 font-bold">REFUND:</label>
                                                    <input readOnly defaultValue="0"
                                                        className="col-span-2 p-2 bg-gray-300 outline-none" />
                                                </div>
                                            </div>

                                            {/* Payment */}
                                            <div className="grid grid-cols-3">
                                                <label className="p-2 border-r border-gray-300 font-bold">PAYMENT METHOD <span className="text-red-500">*</span>:</label>
                                                <select name="paymentMethod" value={passengerInfo.paymentMethod}
                                                    onChange={e => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value })}
                                                    className="col-span-2 p-2 bg-gray-200 outline-none">
                                                    <option>Cash</option>
                                                    <option>Bkash</option>
                                                    <option>Nagad</option>
                                                    <option>Card</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* ── Action Buttons ── */}
                                        <div className="p-4 flex gap-3 justify-end items-center flex-wrap">

                                            {/* SEAT BOOK — form ছাড়া, শুধু counter info দিয়ে booked */}
                                            <button
                                                onClick={handleQuickBook}
                                                disabled={selectedSeats.length === 0}
                                                className={`px-5 py-2 text-sm font-semibold text-white rounded transition ${selectedSeats.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                SEAT BOOK
                                            </button>

                                            {/* SEAT SELL — full form দিয়ে sold */}
                                            <button
                                                onClick={handleSellSeats}
                                                disabled={selectedSeats.length === 0}
                                                className={`px-5 py-2 text-sm font-semibold text-white rounded transition ${selectedSeats.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                                                SEAT SELL
                                            </button>

                                            <button onClick={handleReset}
                                                className="bg-red-500 text-white px-5 py-2 text-sm font-semibold rounded hover:bg-red-600">
                                                RESET FORM
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Dashboard (no bus selected) ═══════════════════════════════ */}
            {!showBusDetails && (
                <div className="w-80 mx-auto border rounded-xl shadow mt-8 overflow-hidden bg-white">
                    {[
                        { label: 'Date', value: date },
                        { label: "Today's Sells", value: dashboardBookings.filter(b => b.bookingStatus === 'sold').length },
                        { label: "Today's Online Sells", value: 0 },
                        { label: "Today's Ticket Sells", value: todaysSells },
                        { label: "Today's Total Revenue", value: `৳${dashboardBookings.reduce((t, b) => t + (b.netPay || 0), 0)}` },
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

export default TicketBookingUi;