import React, { useState, useEffect } from 'react';
import useAllBuses from '../Hooks/useAllBuses';

const VangaSeatManagement = () => {
    const { busRefetch, busLoading, allBuses } = useAllBuses();
    const [selectedBusId, setSelectedBusId] = useState('');
    const [selectedBus, setSelectedBus] = useState(null);
    const [damagedSeats, setDamagedSeats] = useState([]);
    const [saving, setSaving] = useState(false);
    const base_url = import.meta.env.VITE_BASE_URL;

    // Load selected bus data when selection changes
    useEffect(() => {
        if (!selectedBusId) {
            setSelectedBus(null);
            setDamagedSeats([]);
            return;
        }

        const bus = allBuses.find(b => b._id === selectedBusId);
        if (bus) {
            setSelectedBus(bus);
            setDamagedSeats(bus.damagedSeats || []);
        } else {
            // Optional: fetch single bus if not in allBuses
            setSelectedBus(null);
            setDamagedSeats([]);
        }
    }, [selectedBusId, allBuses]);

    const isDamaged = (seat) => damagedSeats.includes(seat);

    const toggleDamaged = (seat) => {
        setDamagedSeats(prev =>
            prev.includes(seat)
                ? prev.filter(s => s !== seat)
                : [...prev, seat]
        );
    };

    const getSeatColor = (seat) => {
        if (isDamaged(seat)) {
            return 'bg-red-600 text-white cursor-pointer hover:bg-red-700';
        }
        return 'bg-green-200 hover:bg-green-300 cursor-pointer';
    };

    const handleSave = async () => {
        if (!selectedBusId) {
            alert('কোনো বাস সিলেক্ট করুন');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${base_url}/api/buses/${selectedBusId}/damaged-seats`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: `Bearer ${token}`  ← add if needed
                },
                body: JSON.stringify({ damagedSeats }),
            });

            if (!res.ok) throw new Error('Failed to update');

            alert('ভাঙা সিট সফলভাবে আপডেট হয়েছে!');
            busRefetch(); // refresh list
        } catch (err) {
            console.error(err);
            alert('আপডেট করতে সমস্যা হয়েছে।');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ভাঙা সিট ম্যানেজমেন্ট</h1>

            {/* Bus Selection */}
            <div className="mb-6">
                <label className="block mb-2 font-medium">বাস সিলেক্ট করুন:</label>
                <select
                    className="border rounded px-3 py-2 w-full sm:w-96"
                    value={selectedBusId}
                    onChange={e => setSelectedBusId(e.target.value)}
                >
                    <option value="">-- বাস নির্বাচন করুন --</option>
                    {busLoading ? (
                        <option>Loading...</option>
                    ) : (
                        allBuses.map(bus => (
                            <option key={bus._id} value={bus._id}>
                                {bus.bus_name} - {bus.bus_number} ({bus.availability})
                            </option>
                        ))
                    )}
                </select>
            </div>

            {selectedBus && (
                <>
                    <div className="mb-6 p-4 bg-gray-100 rounded">
                        <p><strong>বাস:</strong> {selectedBus.bus_name} ({selectedBus.bus_number})</p>
                        <p><strong>ভাড়া:</strong> ৳{selectedBus.perSeatFees}</p>
                        <p><strong>রুট:</strong> {selectedBus.bus_route}</p>
                    </div>

                    {/* Seat Grid - Based on your original commented structure */}
                    <div className="bg-yellow-100 mt-4 p-4 border rounded shadow">
                        <div className="w-full grid grid-cols-5 gap-1 text-xs sm:text-sm font-medium select-none">
                            {/* Top row - extra seats */}
                            <div></div>
                            <div></div>
                            {['EX1', 'EX2'].map(s => (
                                <div
                                    key={s}
                                    onClick={() => toggleDamaged(s)}
                                    className={`p-2 text-center rounded border ${getSeatColor(s)}`}
                                >
                                    {s}
                                </div>
                            ))}
                            <div></div>

                            {/* Driver / GD1 */}
                            <div
                                onClick={() => toggleDamaged('GD1')}
                                className={`p-2 text-center rounded border col-start-2 ${getSeatColor('GD1')}`}
                            >
                                GD1
                            </div>
                            <div></div>

                            {['EX3', 'EX4'].map(s => (
                                <div
                                    key={s}
                                    onClick={() => toggleDamaged(s)}
                                    className={`p-2 text-center rounded border ${getSeatColor(s)}`}
                                >
                                    {s}
                                </div>
                            ))}
                            <div></div>

                            {/* Main rows A to I → 2 | aisle | 2 */}
                            {Array.from('ABCDEFGHI').map(letter => (
                                <React.Fragment key={letter}>
                                    {[`${letter}1`, `${letter}2`].map(s => (
                                        <div
                                            key={s}
                                            onClick={() => toggleDamaged(s)}
                                            className={`p-2 text-center rounded border ${getSeatColor(s)}`}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                    <div className="bg-gray-300"></div> {/* aisle */}
                                    {[`${letter}3`, `${letter}4`].map(s => (
                                        <div
                                            key={s}
                                            onClick={() => toggleDamaged(s)}
                                            className={`p-2 text-center rounded border ${getSeatColor(s)}`}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* Last row - 5 seats (J row) */}
                            {['J1', 'J2'].map(s => (
                                <div
                                    key={s}
                                    onClick={() => toggleDamaged(s)}
                                    className={`p-2 text-center rounded border ${getSeatColor(s)}`}
                                >
                                    {s}
                                </div>
                            ))}
                            <div
                                onClick={() => toggleDamaged('J5')}
                                className={`p-2 text-center rounded border ${getSeatColor('J5')}`}
                            >
                                J5
                            </div>
                            {['J3', 'J4'].map(s => (
                                <div
                                    key={s}
                                    onClick={() => toggleDamaged(s)}
                                    className={`p-2 text-center rounded border ${getSeatColor(s)}`}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-sm text-center text-gray-600">
                            লাল = ভাঙা / নিষিদ্ধ • সবুজ = ঠিক আছে • ক্লিক করে পরিবর্তন করুন
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default VangaSeatManagement;