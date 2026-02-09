import React from 'react';
import { motion } from 'framer-motion';

const AddBus = () => {
    return (
        <motion.div
            className='px-4'
            initial={{ opacity: 0, y: 600 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="w-full p-4 bg-white shadow rounded">
                <h1 className="w-full text-2xl font-semibold ">
                    Add a new bus
                </h1>

                {/* form */}
                <div className="mt-4">
                    <form action="" className='grid grid-cols-3 gap-3 items-center'>
                        {/* bus name */}
                        <div className="">
                            <p className="">Bus Name</p>
                            <input
                                type="text"
                                placeholder="Enter Bus Name"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* bus number */}
                        <div className="">
                            <p className="">Bus Number</p>
                            <input
                                type="text"
                                placeholder="Enter Bus Name"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* bus seat fees */}
                        <div className="">
                            <p className=""> Per Seat Fees (Bdt)</p>
                            <input
                                type="number"
                                placeholder="Enter Bus Seat Fees"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* form location */}
                        <div className="">
                            <p className="">Form Location</p>
                            <input
                                type="text"
                                placeholder="Enter Bus Start Location"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* to location */}
                        <div className="">
                            <p className="">To Location</p>
                            <input
                                type="text"
                                placeholder="Enter Bus To Location"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* bus start time */}
                        <div className="">
                            <p className="">Start Time</p>
                            <input
                                type="time"
                                placeholder="Enter Bus Start Time"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* bus end time */}
                        <div className="">
                            <p className="">End Time</p>
                            <input
                                type="time"
                                placeholder="Enter Bus End Time"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* available seat */}
                        <div className="">
                            <p className="">Available Seat</p>
                            <input
                                type="number"
                                placeholder="Enter Bus Available Seat"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        {/* availability */}
                        <div className="">
                            <p className="">Availability</p>
                            <select name="" id="" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        {/* select route */}
                        <div className="">
                            <p className="">Select Route</p>
                            <select name="" id="" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        {/* submit button */}
                        <div className="col-span-3">
                            <button className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800">
                                Add Bus
                            </button>
                        </div>





                    </form>
                </div>

            </div>

        </motion.div>
    );
};

export default AddBus;