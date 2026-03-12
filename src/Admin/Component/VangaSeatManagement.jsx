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

    const getSeatStyle = (seat) => {
        if (!seat) return "bg-transparent";

        const isDamaged = damageSeats.includes(seat);

        return isDamaged
            ? "bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-red-700/40 ring-2 ring-red-400/60"
            : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-700/40 hover:ring-2 hover:ring-teal-300/70";
    };

    const handleUpdate = async () => {
        try {
            await axios.patch(`${base_url}/bus/damage-seats/${selectedBus._id}`, {
                seats: damageSeats,
            });

            toast.success("Damage seats updated successfully!", {
                style: { background: "#10b981", color: "white" },
            });

            busRefetch();
        } catch (err) {
            toast.error("Failed to update seats", {
                style: { background: "#ef4444", color: "white" },
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-8 tracking-tight">
                    Bus Damage Seat Management
                </h1>

                {/* Bus Selection */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {allBuses?.map((bus) => (
                        <button
                            key={bus._id}
                            onClick={() => handleBusSelect(bus)}
                            className={`
                px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 shadow-sm
                ${selectedBus?._id === bus._id
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/40 scale-105 ring-2 ring-indigo-400/60"
                                    : "bg-white text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border border-indigo-200 hover:border-indigo-400"
                                }
              `}
                        >
                            {bus.bus_name} <span className="opacity-80">({bus.bus_number})</span>
                        </button>
                    ))}
                </div>

                {selectedBus && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {selectedBus.bus_name}
                                <span className="ml-3 text-lg font-normal text-gray-500">
                                    ({selectedBus.bus_number})
                                </span>
                            </h2>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500"></div>
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-600 to-rose-600"></div>
                                    <span>Damaged</span>
                                </div>
                            </div>
                        </div>

                        {/* Driver Area */}
                        <div className="mb-8 inline-block bg-gradient-to-r from-amber-100 to-yellow-100 px-5 py-2.5 rounded-full text-amber-800 font-medium shadow-sm">
                            🧑‍✈️ Driver
                        </div>

                        {/* Seat Map */}
                        <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-6 rounded-xl border border-slate-200 shadow-inner w-fit mx-auto">
                            {seatRows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="grid grid-cols-5 gap-2.5 md:gap-3 mb-2.5 last:mb-0"
                                >
                                    {row.map((seat, seatIndex) => (
                                        <div
                                            key={seatIndex}
                                            onClick={() => handleSeatClick(seat)}
                                            className={`
                        w-12 h-10 md:w-14 md:h-11 flex items-center justify-center 
                        rounded-lg text-xs md:text-sm font-bold tracking-wide
                        transition-all duration-200 cursor-pointer select-none
                        shadow-md hover:scale-105 active:scale-95
                        ${getSeatStyle(seat)}
                      `}
                                        >
                                            {seat || " "}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Action Button */}
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={handleUpdate}
                                className="
                  px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 
                  hover:from-purple-700 hover:to-indigo-700
                  text-white font-bold text-lg rounded-xl
                  shadow-lg shadow-purple-500/30 hover:shadow-purple-600/50
                  transform transition-all duration-300 hover:scale-105 active:scale-95
                  ring-1 ring-purple-400/40
                "
                            >
                                Update Damage Seats
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VangaSeatManagement;