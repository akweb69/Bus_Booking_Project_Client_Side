import React from "react";
import useAllBuses from "../Hooks/useAllBuses";
import axios from "axios";
import { toast } from "react-hot-toast";

const seatRows = [
    ["EX1", "EX2", null, "EX3", "EX4"],
    ["GD1", null, null, null, null],

    ["A1", "A2", null, "A3", "A4"],
    ["B1", "B2", null, "B3", "B4"],
    ["C1", "C2", null, "C3", "C4"],
    ["D1", "D2", null, "D3", "D4"],
    ["E1", "E2", null, "E3", "E4"],
    ["F1", "F2", null, "F3", "F4"],
    ["G1", "G2", null, "G3", "G4"],
    ["H1", "H2", null, "H3", "H4"],
    ["I1", "I2", null, "I3", "I4"],

    ["J1", "J2", null, "J3", "J4"],
    [null, null, null, null, "J5"],
];

const VangaSeatManagement = () => {
    const { allBuses, busRefetch } = useAllBuses();

    const base_url = import.meta.env.VITE_BASE_URL;

    const [selectedBus, setSelectedBus] = React.useState(null);
    const [damageSeats, setDamageSeats] = React.useState([]);

    const handleBusSelect = (bus) => {
        setSelectedBus(bus);
        setDamageSeats(bus?.damage_seats || []);
    };

    const handleSeatClick = (seat) => {
        if (!seat) return;

        if (damageSeats.includes(seat)) {
            setDamageSeats(damageSeats.filter((s) => s !== seat));
        } else {
            setDamageSeats([...damageSeats, seat]);
        }
    };

    const getSeatColor = (seat) => {
        if (!seat) return "invisible";

        if (damageSeats.includes(seat)) {
            return "bg-red-500 text-white";
        }

        return "bg-green-500 text-white";
    };

    const handleUpdate = async () => {
        try {
            await axios.patch(`${base_url}/bus/damage-seats/${selectedBus._id}`, {
                seats: damageSeats,
            });

            toast.success("Seats updated");

            busRefetch();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Bus Seat Damage Management
            </h1>

            {/* Bus Select */}

            <div className="flex flex-wrap gap-2 mb-8">
                {allBuses?.map((bus) => (
                    <button
                        key={bus._id}
                        onClick={() => handleBusSelect(bus)}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        {bus.bus_name} ({bus.bus_number})
                    </button>
                ))}
            </div>

            {selectedBus && (
                <div>

                    <h2 className="font-semibold mb-4">
                        Seat Layout - {selectedBus.bus_name}
                    </h2>

                    {/* Driver */}

                    <div className="mb-4 text-sm bg-gray-200 w-32 p-2 rounded">
                        🧑‍✈️ Driver
                    </div>

                    {/* Seat Grid */}

                    <div className="bg-yellow-100 p-3 rounded w-fit">

                        {seatRows.map((row, rowIndex) => (
                            <div
                                key={rowIndex}
                                className="grid grid-cols-5 gap-2 mb-2"
                            >
                                {row.map((seat, seatIndex) => (
                                    <div
                                        key={seatIndex}
                                        onClick={() => handleSeatClick(seat)}
                                        className={`w-10 h-8 flex items-center justify-center rounded cursor-pointer text-xs font-semibold ${getSeatColor(
                                            seat
                                        )}`}
                                    >
                                        {seat}
                                    </div>
                                ))}
                            </div>
                        ))}

                    </div>

                    {/* Update Button */}

                    <button
                        onClick={handleUpdate}
                        className="mt-6 bg-black text-white px-6 py-2 rounded"
                    >
                        Update Damage Seats
                    </button>
                </div>
            )}
        </div>
    );
};

export default VangaSeatManagement;