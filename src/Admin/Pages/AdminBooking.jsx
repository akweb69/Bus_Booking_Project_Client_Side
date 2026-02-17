import useAllBuses from '@/Admin/Hooks/useAllBuses';
import React, { useEffect } from 'react';
import axios from 'axios';
import useAllRoute from '../Hooks/useAllRoute';

const AdminBooking = ({ boardingPoints }) => {
    const { busLoading, allBuses } = useAllBuses();
    const [selectedBus, setSelectedBus] = React.useState(null);
    const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
    const [showBusDetails, setShowBusDetails] = React.useState(false);
    const [detailsBus, setDetailsBus] = React.useState(null);

    // Booking states
    const [existingBookings, setExistingBookings] = React.useState([]);
    const [selectedSeats, setSelectedSeats] = React.useState([]);
    const [showCancelModal, setShowCancelModal] = React.useState(false);
    const [bookingToCancel, setBookingToCancel] = React.useState(null);
    const [passengerInfo, setPassengerInfo] = React.useState({
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

    // All available seats
    const allSeats = [
        'EX1', 'EX2',
        'GD1', 'GD2', 'GD3',
        ...Array.from('ABCDEFGHI').flatMap(letter => [`${letter}1`, `${letter}2`, `${letter}3`, `${letter}4`]),
        'J1', 'J2', 'J5', 'J3', 'J4'
    ];

    const dashData = [
        { title: "Todays Sells", value: "0" },
        { title: "Todays Online Sells", value: "0" },
        { title: "Todays Online Ticket Sells", value: "0" },
        { title: "Earn form cancelations", value: "0" },
        { title: "Todays Total Sells", value: "0" },
    ];

    // Fetch bookings when bus and date change
    useEffect(() => {
        if (detailsBus && date) {
            fetchBookings();
        }
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

    // Get seat status
    const getSeatStatus = (seatNumber) => {
        // Ensure existingBookings is an array
        const bookings = Array.isArray(existingBookings) ? existingBookings : [];

        const booking = bookings.find(b => b.seatNumber === seatNumber);
        if (booking) {
            return {
                status: 'booked',
                gender: booking.gender,
                booking: booking
            };
        }
        if (selectedSeats.includes(seatNumber)) {
            return { status: 'selected' };
        }
        return { status: 'available' };
    };

    // Get seat color based on status
    const getSeatColor = (seatNumber) => {
        const seatStatus = getSeatStatus(seatNumber);

        if (seatStatus.status === 'booked') {
            // Male booked = blue, Female booked = pink (both clickable for cancellation)
            return seatStatus.gender === 'Male'
                ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 hover:ring-2 hover:ring-red-500'
                : 'bg-pink-500 text-white cursor-pointer hover:bg-pink-600 hover:ring-2 hover:ring-red-500';
        }
        if (seatStatus.status === 'selected') {
            return 'bg-yellow-400 text-black cursor-pointer border-2 border-yellow-600';
        }
        return 'bg-green-500 text-white cursor-pointer hover:bg-green-600';
    };

    // Handle seat click
    const handleSeatClick = (seatNumber) => {
        const seatStatus = getSeatStatus(seatNumber);

        // If seat is booked, show cancel option
        if (seatStatus.status === 'booked') {
            setBookingToCancel(seatStatus.booking);
            setShowCancelModal(true);
            return;
        }

        // Toggle seat selection
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    // Handle opening cancel modal
    const handleOpenCancelModal = (booking) => {
        setBookingToCancel(booking);
        setShowCancelModal(true);
    };

    // Handle closing cancel modal
    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setBookingToCancel(null);
    };

    // get bus route info------->
    const { allRoutes } = useAllRoute();
    const getBusRoutes = (id) => {
        const route = allRoutes?.find(route => route._id === id);
        return route?.boardingPoints?.join(", ") || "";
    }


    // Handle cancel booking confirmation
    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;

        try {
            // Delete booking from backend
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/bookings/${bookingToCancel._id}`);

            alert(`Successfully cancelled seat ${bookingToCancel.seatNumber}!`);

            // Close modal
            handleCloseCancelModal();

            // Refresh bookings
            fetchBookings();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    // Calculate statistics
    const getBookingStats = () => {
        // Ensure existingBookings is an array
        const bookings = Array.isArray(existingBookings) ? existingBookings : [];

        const maleBooked = bookings.filter(b => b.gender === 'Male').length;
        const femaleBooked = bookings.filter(b => b.gender === 'Female').length;
        const totalBooked = bookings.length;
        const available = allSeats.length - totalBooked;

        return {
            soldCounter: 0, // You can filter by booking type if needed
            soldOnline: totalBooked,
            bookedMale: maleBooked,
            bookedFemale: femaleBooked,
            available: available,
            blocked: 0 // Implement if you have blocked seats
        };
    };

    const stats = getBookingStats();

    // Calculate fare
    const calculateFare = () => {
        const perSeatFare = detailsBus?.perSeatFees || 0;
        const totalSeats = selectedSeats.length;
        const grossPay = perSeatFare * totalSeats;
        const discount = parseFloat(passengerInfo.discount) || 0;
        const netPay = grossPay - discount;

        return {
            perSeatFare,
            totalSeats,
            grossPay,
            discount,
            netPay
        };
    };

    const fare = calculateFare();

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPassengerInfo({
            ...passengerInfo,
            [name]: value
        });
    };

    // Validate required fields
    const validateForm = () => {
        const required = ['name', 'mobile', 'gender', 'age', 'boardingPoint', 'droppingPoint'];
        for (let field of required) {
            if (!passengerInfo[field] || passengerInfo[field].trim() === '') {
                alert(`Please fill in ${field.toUpperCase()}`);
                return false;
            }
        }

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return false;
        }

        if (passengerInfo.mobile.length < 14) {
            alert('Please enter a valid mobile number');
            return false;
        }

        return true;
    };

    // Handle booking confirmation
    const handleConfirmBooking = async () => {
        if (!validateForm()) return;

        try {
            // Create booking for each selected seat
            const bookings = selectedSeats.map(seatNumber => ({
                busId: detailsBus._id,
                busName: detailsBus.busName,
                busNumber: detailsBus.busNumber,
                fromLocation: detailsBus.fromLocation,
                toLocation: detailsBus.toLocation,
                travelDate: date,
                seatNumber: seatNumber,
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
                status: 'confirmed'
            }));

            // Send all bookings to backend
            for (let booking of bookings) {
                await axios.post(`${import.meta.env.VITE_BASE_URL}/bookings`, booking);
            }

            alert(`Successfully booked ${selectedSeats.length} seat(s)!`);

            // Reset form and selections
            handleReset();

            // Refresh bookings
            fetchBookings();
        } catch (error) {
            console.error('Error booking seats:', error);
            alert('Failed to book seats. Please try again.');
        }
    };

    // Handle reset
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

    // Remove selected seat
    const handleRemoveSeat = (seatNumber) => {
        setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    };

    if (busLoading) {
        return <div className="w-full h-screen flex justify-center items-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                <div className="text-sm">Loading buses...</div>
            </div>
        </div>
    }

    const handleBusSelectWithBusCode = (busCode) => {
        if (!busCode.trim()) {
            setSelectedBus(null);
            return;
        }

        const res0 = allBuses.filter(bus =>
            bus.busNumber.toLowerCase().includes(busCode.toLowerCase())
        );

        setSelectedBus(res0);
    };

    const handleOpenBusDetails = async (bus) => {
        setShowBusDetails(true);
        setSelectedBus([]);
        setDetailsBus(bus);
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

    // Handle date change
    const handleDateChange = (e) => {
        setDate(e.target.value);
        // Reset selections when date changes
        setSelectedSeats([]);
    };

    return (
        <div className='w-full min-h-screen bg-gray-50'>
            {/* navbar */}
            <div className="w-full py-2 text-sm bg-green-700">
                <div className="w-11/12 mx-auto flex gap-4 items-center justify-center">
                    <div className="">
                        <p className="text-white">Leaving from</p>
                        <select className='bg-white p-1 outline-none rounded min-w-30' name="" id="">
                            <option value="">Select boarding point</option>
                            {
                                boardingPoints?.split(",")?.map((boardingPoint, index) => <option key={index} value={boardingPoint}>{boardingPoint}</option>)
                            }
                        </select>
                    </div>

                    <div className="">
                        <p className="text-white">Going to</p>
                        <select className='bg-white p-1 outline-none rounded min-w-30' name="" id="">
                            <option value="">Select Departing point</option>
                            {
                                boardingPoints?.split(",")?.map((boardingPoint, index) => <option key={index} value={boardingPoint}>{boardingPoint}</option>)
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
                                        {getBusRoutes(detailsBus?._id)}
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
                                        {Array.isArray(existingBookings) ? existingBookings.length : 0}
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
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('EX1')}`}>
                                            EX1
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('EX2')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('EX2')}`}>
                                            EX2
                                        </div>
                                        <div></div>

                                        <div
                                            onClick={() => handleSeatClick('GD1')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('GD1')}`}>
                                            GD1
                                        </div>
                                        <div></div>
                                        <div
                                            onClick={() => handleSeatClick('GD2')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('GD2')}`}>
                                            GD2
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('GD3')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('GD3')}`}>
                                            GD3
                                        </div>
                                        <div></div>

                                        {/* A to I */}
                                        {
                                            Array.from("ABCDEFGHI").map(letter => (
                                                <React.Fragment key={letter}>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}1`)}
                                                        className={`seat text-[10px] p-1 text-center rounded ${getSeatColor(`${letter}1`)}`}>
                                                        {letter}1
                                                    </div>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}2`)}
                                                        className={`seat text-[10px] p-1 text-center rounded ${getSeatColor(`${letter}2`)}`}>
                                                        {letter}2
                                                    </div>
                                                    <div></div>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}3`)}
                                                        className={`seat text-[10px] p-1 text-center rounded ${getSeatColor(`${letter}3`)}`}>
                                                        {letter}3
                                                    </div>
                                                    <div
                                                        onClick={() => handleSeatClick(`${letter}4`)}
                                                        className={`seat text-[10px] p-1 text-center rounded ${getSeatColor(`${letter}4`)}`}>
                                                        {letter}4
                                                    </div>
                                                </React.Fragment>
                                            ))
                                        }

                                        <div
                                            onClick={() => handleSeatClick('J1')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('J1')}`}>
                                            J1
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J2')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('J2')}`}>
                                            J2
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J5')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('J5')}`}>
                                            J5
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J3')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('J3')}`}>
                                            J3
                                        </div>
                                        <div
                                            onClick={() => handleSeatClick('J4')}
                                            className={`seat text-[10px] p-1 text-center rounded ${getSeatColor('J4')}`}>
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
                                        <span>Booked (Male) - Click to cancel</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-pink-500 rounded"></div>
                                        <span>Booked (Female) - Click to cancel</span>
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
                                                        {boardingPoints?.split(",")?.map((point, idx) => (
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
                                                        {boardingPoints?.split(",")?.map((point, idx) => (
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
                !selectedBus && !showBusDetails && <div className="w-80 mx-auto border mt-4">
                    {
                        dashData?.map(i =>
                            <div key={i.title} className="">
                                <p className="w-full bg-gray-500 text-white p-2 text-sm font-medium">{i.title}</p>
                                <div className="w-full flex justify-center items-center p-6 bg-gray-100">
                                    <p className="text-xl md:text-2xl font-medium">{i.value}</p>
                                </div>
                            </div>
                        )
                    }
                </div>
            }

            {/* Cancel Booking Modal */}
            {showCancelModal && bookingToCancel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Cancel Booking</h2>

                        <div className="mb-4 text-sm space-y-2">
                            <p><span className="font-semibold">Seat Number:</span> {bookingToCancel.seatNumber}</p>
                            <p><span className="font-semibold">Passenger Name:</span> {bookingToCancel.passengerName}</p>
                            <p><span className="font-semibold">Mobile:</span> {bookingToCancel.mobile}</p>
                            <p><span className="font-semibold">Fare:</span> ৳{bookingToCancel.fare}</p>
                            <p><span className="font-semibold">Boarding Point:</span> {bookingToCancel.boardingPoint}</p>
                            <p><span className="font-semibold">Dropping Point:</span> {bookingToCancel.droppingPoint}</p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Warning:</strong> Are you sure you want to cancel this booking? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCloseCancelModal}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
                                No, Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                                Yes, Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooking;