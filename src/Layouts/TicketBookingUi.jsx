import useAllBuses from '@/Admin/Hooks/useAllBuses';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAllRoute from '@/Admin/Hooks/useAllRoute';
import { useNavigate } from 'react-router-dom';

const TicketBookingUi = ({ boardingPoints, activeRoute }) => {

    const navigate = useNavigate();
    const { busLoading, allBuses } = useAllBuses();
    const { allRoutes } = useAllRoute();
    const [selectedBus, setSelectedBus] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [showBusDetails, setShowBusDetails] = useState(false);
    const [detailsBus, setDetailsBus] = useState(null);

    const [openSeatStatusModal, setOpenSeatStatusModal] = useState(false);

    const [existingBookings, setExistingBookings] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerInfo, setPassengerInfo] = useState({
        name: '',
        mobile: '+88',
        gender: 'Male',
        age: '',
        address: '',
        passportNo: '',
        nationality: 'Bangladesh',
        boardingPlace: '',
        email: '',
        boardingPoint: '',
        droppingPoint: '',
        goods: '',
        discount: 0,
        paymentMethod: 'Cash'
    });

    const allSeats = [
        'EX1', 'EX2', 'EX3', 'EX4', 'GD1',
        ...Array.from('ABCDEFGHI').flatMap(letter => [`${letter}1`, `${letter}2`, `${letter}3`, `${letter}4`]),
        'J1', 'J2', 'J3', 'J4', 'J5'
    ];
    const [dashboardExistingBookings, setDashboardExistingBookings] = useState([]);
    const [todaysSells, setTodaysSells] = useState(0);

    useEffect(() => {
        fetchDashboardBookings();
    }, [date]);

    const fetchDashboardBookings = async () => {

        try {

            const counterCode = localStorage.getItem('counterCode');

            if (!counterCode) return;

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/bookings/${counterCode}/${date}`
            );

            setDashboardExistingBookings(res.data);
            setTodaysSells(res.data.length);

            console.log("Dashboard bookings:", res.data);

        } catch (error) {

            console.error(error);

        }

    };



    // Fetch bookings when bus or date changes
    useEffect(() => {
        if (detailsBus && date) fetchBookings();
    }, [detailsBus, date]);




    const fetchBookings = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/bookings/bus/${detailsBus._id}?date=${date}`
            );
            setExistingBookings(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setExistingBookings([]);
        }
    };



    const getSeatStatus = (seatNumber) => {
        const booking = existingBookings.find(b => b.seatNumber === seatNumber);
        if (booking) return { status: 'booked', gender: booking.gender, booking };
        if (selectedSeats.includes(seatNumber)) return { status: 'selected' };
        return { status: 'available' };
    };

    const getSeatColor = (seatNumber) => {
        const seatStatus = getSeatStatus(seatNumber);
        // console.log("--------->", seatStatus);

        if (seatStatus?.status === 'booked')
            // console.log("--------->", seatStatus.gender);

            return seatStatus.gender === 'Male'
                ? 'text-center p-2 rounded shadow  bg-blue-600 text-white cursor-not-allowed  '
                : 'text-center p-2 rounded shadow bg-pink-500 text-white cursor-not-allowed ';

        if (seatStatus?.status === 'selected')
            return 'text-center p-2 rounded shadow bg-yellow-400 text-black cursor-pointer border-2 border-yellow-600 ';

        return 'text-center p-2 rounded shadow bg-green-500 text-white cursor-pointer hover:bg-green-600';
    };


    const handleSeatClick = (seatNumber) => {
        const seatStatus = getSeatStatus(seatNumber);
        if (seatStatus.status === 'booked') {
            toast.error(`Seat ${seatNumber} ${seatStatus.gender} is already booked!`);
            return;
        }
        setSelectedSeats(selectedSeats.includes(seatNumber) ? selectedSeats.filter(s => s !== seatNumber) : [...selectedSeats, seatNumber]);
    };

    const getBookingStats = () => {
        const maleBooked = existingBookings.filter(b => b.gender === 'Male').length;
        const femaleBooked = existingBookings.filter(b => b.gender === 'Female').length;
        const totalBooked = existingBookings.length;
        return { soldCounter: totalBooked, soldOnline: totalBooked, bookedMale: maleBooked, bookedFemale: femaleBooked, available: allSeats.length - totalBooked, blocked: 0 };
    };

    const stats = getBookingStats();

    const calculateFare = () => {
        const perSeatFare = detailsBus?.perSeatFees || 0;
        const totalSeats = selectedSeats.length;
        const grossPay = perSeatFare * totalSeats;
        const discount = parseFloat(passengerInfo.discount) || 0;
        const netPay = grossPay - discount;
        return { perSeatFare, totalSeats, grossPay, discount, netPay };
    };

    const fare = calculateFare();

    const handleInputChange = (e) => setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value });

    const validateForm = () => {
        const required = ['name', 'mobile', 'gender', 'age', 'boardingPoint', 'droppingPoint'];
        for (let field of required) if (!passengerInfo[field]?.trim()) { alert(`Please fill in ${field.toUpperCase()}`); return false; }
        if (selectedSeats.length === 0) { alert('Please select at least one seat'); return false; }
        if (passengerInfo.mobile.length < 14) { alert('Please enter a valid mobile number'); return false; }
        return true;
    };

    const handleConfirmBooking = async () => {
        if (!validateForm()) return;
        try {
            for (let seat of selectedSeats) {
                const booking = {
                    busId: detailsBus._id,
                    busName: detailsBus.busName,
                    busNumber: detailsBus.busNumber,
                    fromLocation: detailsBus.fromLocation,
                    toLocation: detailsBus.toLocation,
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
                    bookingDate: new Date().toISOString(),
                    status: 'confirmed',
                    counterCode: localStorage.getItem('counterCode')
                };
                await axios.post(`${import.meta.env.VITE_BASE_URL}/bookings`, booking);
            }
            alert(`Successfully booked ${selectedSeats.length} seat(s)!`);
            handleReset();
            fetchBookings();
            fetchDashboardBookings();
        } catch (error) {
            console.error('Error booking seats:', error);
            alert(error.response?.data?.error || 'Failed to book seats. Please try again.');
        }
    };

    const handleReset = () => {
        setSelectedSeats([]);
        setPassengerInfo({
            name: '',
            mobile: '+88',
            gender: 'Male',
            age: '',
            address: '',
            passportNo: '',
            nationality: 'Bangladesh',
            boardingPlace: '',
            email: '',
            boardingPoint: '',
            droppingPoint: '',
            goods: '',
            discount: 0,
            paymentMethod: 'Cash'
        });
    };

    const handleRemoveSeat = (seat) => setSelectedSeats(selectedSeats.filter(s => s !== seat));

    const handleBusSelectWithBusCode = async (busCode) => {
        const myRoute = await allRoutes?.find(r => r.routeName === activeRoute);
        if (!busCode.trim()) { setSelectedBus([]); return; }
        const res0 = allBuses.filter(bus => bus.busNumber.toLowerCase().includes(busCode.toLowerCase()));
        const res1 = res0.filter(b => b.route === myRoute?._id);
        setSelectedBus(res1);
    };

    const hndlelogout = () => {
        toast.loading('Logging out...');
        localStorage.clear();
        navigate('/');
        window.location.reload();
        toast.dismiss();
        toast.success('Successfully logged out');

    }


    const handleOpenBusDetails = (bus) => {
        setShowBusDetails(true);
        setSelectedBus([]);
        setDetailsBus(bus);
        handleReset();
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
        setSelectedSeats([]);
    };

    // const leaving form ------>
    const handleLeavingFromChange = async (e) => {
        const leavingForm = (e.target.value);
        const myRoute = await allRoutes?.find(r => r.routeName === activeRoute);
        const filterBuses = allBuses.filter(bus => bus.fromLocation === leavingForm);
        const res1 = filterBuses.filter(b => b.route === myRoute?._id);
        setSelectedBus(res1);
    }
    const handleGoingToChange = async (e) => {
        const goingTo = (e.target.value);
        const myRoute = await allRoutes?.find(r => r.routeName === activeRoute);
        const filterBuses = allBuses.filter(bus => bus.toLocation === goingTo);
        const res1 = filterBuses.filter(b => b.route === myRoute?._id);
        setSelectedBus(res1);
    }

    // ---------- Render (UI unchanged) ----------
    if (busLoading) return <div className="w-full h-screen flex justify-center items-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div><div className="text-sm">Loading buses...</div></div></div>;

    return (
        <div className='w-full min-h-screen bg-gray-50'>
            {/* navbar */}
            <div className="w-full py-2 text-sm bg-green-700">
                <div className="w-11/12 mx-auto flex gap-4 items-center justify-center">
                    <div className="">
                        <p className="text-white">Leaving from</p>
                        <select
                            onChange={(e) => handleLeavingFromChange(e)}
                            className='bg-white p-1 outline-none rounded min-w-30' name="" id="">
                            <option value="">Select boarding point</option>
                            {
                                boardingPoints?.map((boardingPoint, index) => <option key={index} value={boardingPoint}>{boardingPoint}</option>)
                            }
                        </select>
                    </div>

                    <div className="">
                        <p className="text-white">Going to</p>
                        <select
                            onChange={(e) => handleGoingToChange(e)}
                            className='bg-white p-1 outline-none rounded min-w-30' name="" id="">
                            <option value="">Select Departing point</option>
                            {
                                boardingPoints?.map((boardingPoint, index) => <option key={index} value={boardingPoint}>{boardingPoint}</option>)
                            }
                        </select>
                    </div>

                    <div className="">
                        <p className="text-white">Coach</p>
                        <input
                            onChange={(e) => handleBusSelectWithBusCode(e.target.value)}
                            className='bg-white p-1 rounded ' placeholder='Enter coach number' type="text" />
                    </div>

                    <div className="">
                        <p className="text-white">Departing on</p>
                        <input
                            value={date}
                            onChange={handleDateChange}
                            className='bg-white p-1 rounded'
                            type="date"
                        />
                    </div>

                    {/* logout btn */}
                    <div className="">
                        <p className="text-rose-50">Back to login</p>
                        <p onClick={hndlelogout} className="text-white p-1 bg-rose-600 h-full rounded text-center cursor-pointer">Logout</p>
                    </div>
                </div>
            </div>

            {
                selectedBus?.length > 0 && <div className="w-11/12 mx-auto md:w-1/2 border p-4 shadow rounded">
                    <div className="w-full bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="w-full bg-white border border-gray-300 rounded-md overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-12 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 border-b">
                                <div className="col-span-3">Bus</div>
                                <div className="col-span-3">Route</div>
                                <div className="col-span-2">Fare</div>
                                <div className="col-span-2">Couch Number</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>

                            {selectedBus?.map((bus, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 text-sm"
                                >
                                    <div className="col-span-3 font-medium text-gray-800">
                                        {bus.busName}
                                    </div>

                                    <div className="col-span-3 text-gray-600">
                                        {bus.fromLocation} → {bus.toLocation}
                                    </div>

                                    <div className="col-span-2 text-gray-700">
                                        ৳ {bus.perSeatFees}
                                    </div>

                                    <div className="col-span-2 text-gray-500">
                                        {bus.busNumber}
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <button
                                            onClick={() => handleOpenBusDetails(bus)}
                                            className="border border-gray-400 px-3 py-1 rounded text-gray-700 transition cursor-pointer hover:bg-rose-500 hover:text-white">
                                            Book a Seat
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }

            {/* show bus details--------> */}
            {
                showBusDetails && <div className="w-11/12 mx-auto my-4 ">
                    {/* show bus details */}
                    <div className="">
                        <table className='text-xs w-full text-white'>
                            <thead>
                                <tr className='bg-blue-950'>
                                    <th className='py-2 border'>SL</th>
                                    <th className='py-2 border'>DEPARTING TIME AND DATE</th>
                                    <th className='py-2 border'>COUCH NO</th>
                                    <th className='py-2 border'>ROUTE</th>
                                    <th className='py-2 border'>STARTING COUNTER</th>
                                    <th className='py-2 border'>END COUNTER</th>
                                    <th className='py-2 border'>REG NO</th>
                                    <th className='py-2 border'>FARE</th>
                                    <th className='py-2 border'>COUCH TYPE</th>
                                    <th className='py-2 border'>SOLD</th>
                                    <th className='py-2 border'>BOOKED</th>
                                    <th className='py-2 border'>AVAILABLE SEATS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='text-black'>
                                    <td className='py-2 text-center border border-gray-400'>
                                        1
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {detailsBus?.fromLocation} → {detailsBus?.toLocation} ({date}) 📆 ({detailsBus?.fromLocation} - {detailsBus?.startTime})
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {detailsBus?.busNumber}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {boardingPoints?.map((point, index) => (
                                            <div key={index}>
                                                {point} ,
                                            </div>
                                        ))}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {detailsBus?.fromLocation}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {detailsBus?.toLocation}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        ৳ {detailsBus?.perSeatFees}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {detailsBus?.couchType || "Non - AC"}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {stats.soldCounter}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {existingBookings.length}
                                    </td>
                                    <td className='py-2 text-center border border-gray-400'>
                                        {stats.available} seats
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* show bus details for booked ticket */}
                        <div className="w-full grid grid-cols-12 gap-3 mt-2">
                            {/* left side bus seat plans */}
                            <div className="col-span-3">
                                {/* header buttons */}
                                <div className="flex gap-2 items-center flex-wrap justify-center">
                                    <div className="rounded bg-rose-500 text-white text-xs p-2 px-3">Not Arrived</div>
                                    <div className="rounded bg-rose-500 text-white text-xs p-2 px-3">Not Depart</div>
                                    <div className="rounded bg-rose-500 text-white text-xs p-2 px-3">STATUS</div>
                                    <div
                                        onClick={fetchBookings}
                                        className="rounded bg-rose-500 text-white text-xs p-2 px-3 cursor-pointer hover:bg-rose-600">
                                        REFRESH
                                    </div>
                                    <div className="rounded bg-rose-500 text-white text-xs p-2 px-3">TRIP SEATS</div>
                                    <div className="rounded bg-rose-500 text-white text-xs p-2 px-3">SEAT STATUS</div>
                                </div>
                                <div className="bg-green-600 text-white text-xs p-2 uppercase text-center mt-1">Departure Status: @</div>

                                <table className="w-full mt-1 border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] py-1 font-medium border">SOLD</th>
                                            <th className="text-[10px] py-1 font-medium border">BOOKED</th>
                                            <th className="text-[10px] py-1 font-medium border">AVAILABLE</th>
                                            <th className="text-[10px] py-1 font-medium border">BLOCKED</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td className="border p-0">
                                                <table className="w-full text-[10px]">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border text-center py-1">Counter</td>
                                                            <td className="border text-center py-1">Online</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className="border p-0">
                                                <table className="w-full text-[10px]">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border text-center py-1">Male</td>
                                                            <td className="border text-center py-1">Female</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className="border text-center text-[10px]">
                                                <div className="py-1 bg-green-500"></div>
                                            </td>

                                            <td className="border text-center text-[10px]">
                                                <div className="py-1 bg-gray-600"></div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="border p-0">
                                                <table className="w-full text-[10px]">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border text-center py-1">{stats.soldCounter}</td>
                                                            <td className="border text-center py-1">{stats.soldOnline}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className="border p-0">
                                                <table className="w-full text-[10px]">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border text-center py-1">{stats.bookedMale}</td>
                                                            <td className="border text-center py-1">{stats.bookedFemale}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className="border text-center py-1 text-[10px]">
                                                {stats.available}
                                            </td>

                                            <td className="border text-center py-1 text-[10px]">
                                                {stats.blocked}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* seat plans */}
                                <div className="bg-yellow-200 mt-2 p-1 border">
                                    <div className="w-full grid grid-cols-5 gap-1">
                                        {/* EX & GD */}
                                        <div></div>
                                        <div></div>
                                        <div
                                            onClick={() => handleSeatClick('EX1')}
                                            className={` ${getSeatColor('EX1')}`}>
                                            EX1
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('EX2')}
                                            className={` ${getSeatColor('EX2')}`}>
                                            EX2
                                        </div>
                                        <div></div>

                                        <div
                                            onClick={() => handleSeatClick('GD1')}
                                            className={` ${getSeatColor('GD1')}`}>
                                            GD1
                                        </div>
                                        <div></div>
                                        <div
                                            onClick={() => handleSeatClick('EX3')}
                                            className={` ${getSeatColor('EX3')}`}>
                                            EX3
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('EX4')}
                                            className={` ${getSeatColor('EX4')}`}>
                                            EX4
                                        </div>
                                        <div></div>

                                        {/* A to I */}
                                        {
                                            Array.from("ABCDEFGHI").map(letter => (
                                                <React.Fragment key={letter}>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}1`)}
                                                        className={` ${getSeatColor(`${letter}1`)}`}>
                                                        {letter}1
                                                    </div>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}2`)}
                                                        className={` ${getSeatColor(`${letter}2`)}`}>
                                                        {letter}2
                                                    </div>
                                                    <div></div>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}3`)}
                                                        className={` ${getSeatColor(`${letter}3`)}`}>
                                                        {letter}3
                                                    </div>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}4`)}
                                                        className={` ${getSeatColor(`${letter}4`)}`}>
                                                        {letter}4
                                                    </div>
                                                </React.Fragment>
                                            ))
                                        }

                                        <div
                                            onClick={() => handleSeatClick('J1')}
                                            className={` ${getSeatColor('J1')}`}>
                                            J1
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J2')}
                                            className={` ${getSeatColor('J2')}`}>
                                            J2
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J5')}
                                            className={` ${getSeatColor('J5')}`}>
                                            J5
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J3')}
                                            className={` ${getSeatColor('J3')}`}>
                                            J3
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J4')}
                                            className={` ${getSeatColor('J4')}`}>
                                            J4
                                        </div>
                                    </div>
                                </div>

                                {/* Seat Legend */}
                                <div className="mt-2 p-2 bg-white border rounded text-[10px]">
                                    <p className="font-semibold mb-1">Seat Legend:</p>
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span>Available</span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className="w-4 h-4 bg-yellow-400 rounded border-2 border-yellow-600"></div>
                                        <span>Selected</span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                        <span>Booked (Male)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-pink-500 rounded"></div>
                                        <span>Booked (Female)</span>
                                    </div>
                                </div>
                            </div>

                            {/* right side booked ticket */}
                            <div className="col-span-9">
                                <div className="border">
                                    <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit">Seat Information</p>
                                    <div className="w-full mt-1">
                                        <table className="w-full border border-collapse">
                                            <thead>
                                                <tr className='w-full'>
                                                    <th className='uppercase border-collapse border text-xs font-medium text-center p-1 border-b-4 border-gray-400'>SEAT NO</th>
                                                    <th className='uppercase border-collapse border text-xs font-medium text-center p-1'>TICKET NO</th>
                                                    <th className='uppercase border-collapse border text-xs font-medium text-center p-1 border-b-4 border-gray-400'>FARE</th>
                                                    <th className='uppercase border-collapse border text-xs font-medium text-center p-1'>DISCOUNT</th>
                                                    <th className='uppercase border-collapse border text-xs font-medium text-center p-1'>REMOVE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedSeats.map((seat, index) => (
                                                    <tr key={seat}>
                                                        <td className='p-1 border-collapse border text-center text-xs'>{seat}</td>
                                                        <td className='p-1 border-collapse border text-center text-xs'>-</td>
                                                        <td className='p-1 border-collapse border text-center text-xs'>৳{detailsBus?.perSeatFees}</td>
                                                        <td className='p-1 border-collapse border text-center text-xs'>৳0</td>
                                                        <td className='p-1 border-collapse border text-center'>
                                                            <button
                                                                onClick={() => handleRemoveSeat(seat)}
                                                                className='text-red-500 hover:text-red-700 text-xs'>
                                                                ✕
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td className='p-1 border-collapse border text-center'>
                                                        TOTAL SEAT # <span className="text-red-500 text-lg font-medium">{fare.totalSeats}</span>
                                                    </td>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                    <td className='p-1 border-collapse border text-center'>
                                                        PER SEAT FARE # <span className="text-red-500 text-lg font-medium">৳{fare.perSeatFare}</span>
                                                    </td>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                </tr>
                                                <tr>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                    <td className='p-1 border-collapse border text-center'>
                                                        TOTAL FARE # <span className="text-red-500 text-lg font-medium">৳{fare.grossPay}</span>
                                                    </td>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                    <td className='p-1 border-collapse border text-center'></td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* seat selection reminder colors */}
                                        <div className="flex justify-center items-center gap-4 p-2">
                                            <div className="flex justify-center items-center gap-1">
                                                <p className="w-4 h-4 rounded-full bg-blue-600 border"></p>
                                                <p className="text-xs">Male Booked</p>
                                            </div>
                                            <div className="flex justify-center items-center gap-1">
                                                <p className="w-4 h-4 rounded-full bg-pink-500 border"></p>
                                                <p className="text-xs">Female Booked</p>
                                            </div>
                                            <div className="flex justify-center items-center gap-1">
                                                <p className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600"></p>
                                                <p className="text-xs">Selected</p>
                                            </div>
                                            <div className="flex justify-center items-center gap-1">
                                                <p className="w-4 h-4 rounded-full bg-green-500 border"></p>
                                                <p className="text-xs">Available</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* passanger informations */}
                                    <div className="">
                                        <p className="text-xs p-1 px-3 uppercase bg-gray-700 text-white w-fit">PASSANGER Information</p>

                                        {/* forms */}
                                        <form className="w-full text-xs border border-gray-400">
                                            {/* Row 1 - Name & Mobile (Required) */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r border-gray-400 font-bold">
                                                        PASSENGER NAME <span className="text-red-500">*</span>:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={passengerInfo.name}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r border-gray-400 font-bold">
                                                        MOBILE <span className="text-red-500">*</span>:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="mobile"
                                                        value={passengerInfo.mobile}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2 - Gender & Age (Required) */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r font-bold border-gray-400">
                                                        GENDER <span className="text-red-500">*</span>:
                                                    </label>
                                                    <select
                                                        name="gender"
                                                        value={passengerInfo.gender}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                        required
                                                    >
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r font-bold border-gray-400">
                                                        AGE <span className="text-red-500">*</span>:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="age"
                                                        value={passengerInfo.age}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Address (Optional) */}
                                            <div className="grid grid-cols-3 border-b border-gray-400">
                                                <label className="p-1 border-r font-bold border-gray-400">ADDRESS :</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={passengerInfo.address}
                                                    onChange={handleInputChange}
                                                    className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                />
                                            </div>

                                            {/* Passport + Nationality (Optional) */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r font-bold border-gray-400">PASSPORT NO :</label>
                                                    <input
                                                        type="text"
                                                        name="passportNo"
                                                        value={passengerInfo.passportNo}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r font-bold border-gray-400">NATIONALITY :</label>
                                                    <input
                                                        type="text"
                                                        name="nationality"
                                                        value={passengerInfo.nationality}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    />
                                                </div>
                                            </div>


                                            {/* Boarding Place + Email (Optional) */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r border-gray-400 font-bold">BOARDING PLACE :</label>
                                                    <input
                                                        type="text"
                                                        name="boardingPlace"
                                                        value={passengerInfo.boardingPlace}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r border-gray-400 font-bold">E-MAIL :</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={passengerInfo.email}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Boarding Point + Dropping Point (Required) */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r border-gray-400 font-bold">
                                                        BOARDING POINT <span className="text-red-500">*</span>:
                                                    </label>
                                                    <select
                                                        name="boardingPoint"
                                                        value={passengerInfo.boardingPoint}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                        required
                                                    >
                                                        <option value="">Select boarding point</option>
                                                        {boardingPoints?.map((point, idx) => (
                                                            <option key={idx} value={point}>{point}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r border-gray-400 font-bold">
                                                        DROPPING POINT <span className="text-red-500">*</span>:
                                                    </label>
                                                    <select
                                                        name="droppingPoint"
                                                        value={passengerInfo.droppingPoint}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                        required
                                                    >
                                                        <option value="">Select dropping point</option>
                                                        {boardingPoints?.map((point, idx) => (
                                                            <option key={idx} value={point}>{point}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Goods + Gross Pay */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r border-gray-400 font-bold">GOODS :</label>
                                                    <input
                                                        type="text"
                                                        name="goods"
                                                        value={passengerInfo.goods}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r border-gray-400 font-bold">GROSS PAY :</label>
                                                    <input
                                                        type="text"
                                                        value={`৳${fare.grossPay}`}
                                                        readOnly
                                                        className="col-span-2 p-1 bg-gray-300 border outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Discount + Net Pay */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r border-gray-400 font-bold">DISCOUNT :</label>
                                                    <input
                                                        type="number"
                                                        name="discount"
                                                        value={passengerInfo.discount}
                                                        onChange={handleInputChange}
                                                        className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r border-gray-400 font-bold">NET PAY :</label>
                                                    <input
                                                        type="text"
                                                        value={`৳${fare.netPay}`}
                                                        readOnly
                                                        className="col-span-2 p-1 bg-gray-300 border outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Total + Refund */}
                                            <div className="grid grid-cols-2 border-b border-gray-400">
                                                <div className="grid grid-cols-3 border-r border-gray-400">
                                                    <label className="p-1 border-r border-gray-400 font-bold">TOTAL :</label>
                                                    <input
                                                        type="text"
                                                        value={`৳${fare.netPay}`}
                                                        readOnly
                                                        className="col-span-2 p-1 bg-gray-300 border outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3">
                                                    <label className="p-1 border-r border-gray-400 font-bold">REFUND :</label>
                                                    <input
                                                        type="text"
                                                        defaultValue="0"
                                                        readOnly
                                                        className="col-span-2 p-1 bg-gray-300 border outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Payment (Required) */}
                                            <div className="grid grid-cols-3">
                                                <label className="p-1 border-r font-bold border-gray-400">
                                                    PAYMENT METHOD <span className="text-red-500">*</span>:
                                                </label>
                                                <select
                                                    name="paymentMethod"
                                                    value={passengerInfo.paymentMethod}
                                                    onChange={handleInputChange}
                                                    className="col-span-2 p-1 bg-gray-200 border outline-none"
                                                    required
                                                >
                                                    <option>Cash</option>
                                                    <option>Bkash</option>
                                                    <option>Nagad</option>
                                                    <option>Card</option>
                                                </select>
                                            </div>
                                        </form>

                                        {/* confirm or reset btn */}
                                        <div className="p-4 flex gap-4 justify-end items-center w-full">
                                            <button
                                                onClick={handleConfirmBooking}
                                                disabled={selectedSeats.length === 0}
                                                className={`p-2 px-4 text-sm font-medium text-white rounded ${selectedSeats.length === 0
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 cursor-pointer hover:bg-green-700'
                                                    }`}>
                                                CONFIRM BOOKING
                                            </button>
                                            <button
                                                onClick={handleReset}
                                                className="bg-red-500 cursor-pointer text-white p-2 px-4 text-sm font-medium rounded hover:bg-red-600">
                                                RESET
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* dashboard content------> */}
            {
                !selectedBus || !showBusDetails && <div className="w-80 mx-auto border mt-6 ">
                    {/* todays date */}
                    <div className="w-full p-2 bg-gray-500 text-white">Date</div>
                    <div className="p-4 flex justify-center items-center text-2xl">
                        {date}
                    </div>

                    <div className="w-full  border ">
                        <div className="w-full p-2 bg-gray-500 text-white">Todays Sells</div>
                        <div className="p-4 flex justify-center items-center text-2xl">
                            {todaysSells}
                        </div>
                    </div>
                    <div className="w-full  border ">
                        <div className="w-full p-2 bg-gray-500 text-white">Todays Online Sells</div>
                        <div className="p-4 flex justify-center items-center text-2xl">
                            0
                        </div>
                    </div>
                    <div className="w-full  border ">
                        <div className="w-full p-2 bg-gray-500 text-white">Todays Online Ticket Sells</div>
                        <div className="p-4 flex justify-center items-center text-2xl">
                            {todaysSells}
                        </div>
                    </div>
                    <div className="w-full  border ">
                        <div className="w-full p-2 bg-gray-500 text-white">Todays Total Sells</div>
                        <div className="p-4 flex justify-center items-center text-2xl">
                            {dashboardExistingBookings?.reduce((total, booking) => total + booking.netPay, 0)} TK
                        </div>
                    </div>

                </div>
            }
        </div>
    );
};

export default TicketBookingUi;
