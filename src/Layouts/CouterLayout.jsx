import useAllRoute from '@/Admin/Hooks/useAllRoute';
import axios from 'axios';
import { Loader, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TicketBookingUi from './TicketBookingUi';

const CouterLayout = () => {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState("");
    const [routes, setRoutes] = useState([]);

    const { routeLoading, allRoutes } = useAllRoute();
    const [allBoardingPoints, setAllBoardingPoints] = useState([]);
    const [showtab, setShowTab] = useState(true);
    const [activeRoute, setActiveRoute] = useState(null);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    useEffect(() => {
        const userid = localStorage.getItem("counterCode");
        if (!userid || !allRoutes?.length) return;

        axios
            .get(`${import.meta.env.VITE_BASE_URL}/user/check/${userid}`)
            .then(res => {
                const data = res.data;

                if (data?.status === "active" && data?.role === "counter") {
                    const selectedRoute = allRoutes.find(
                        r => r?.routeName === data?.selectedRoute

                    );
                    setActiveRoute(data?.selectedRoute);

                    console.log(selectedRoute.boardingPoints);
                    setAllBoardingPoints(selectedRoute.boardingPoints || []);

                    if (selectedRoute) {
                        setRoutes(selectedRoute.boardingPoints || []);
                        console.log("--------------<>", selectedRoute.boardingPoints);
                    }
                }
            })
            .catch(() => {
                toast.error("User validation failed");
            });
    }, [allRoutes]);

    const handleSearch = () => {
        if (!from || !to || !date) {
            return toast.error("Please select all fields");
        }

        if (from === to) {
            return toast.error("From and To cannot be same");
        }


        setShowTab(true);



        toast.success("Search successful");
        console.log({ from, to, date });
    };







    if (routeLoading) {
        return <div className="w-full h-screen flex justify-center items-center">
            <Loader size={33} className="animate-spin text-rose-500" />
        </div>;
    }

    return (
        <div className='w-full min-h-screen '>
            {/* <div className="w-full bg-rose-500 py-2 flex justify-end items-center">
                <div onClick={handleLogout} className="px-4 cursor-pointer">Logout</div>
            </div> */}

            {
                !showtab && <div className="w-11/12 mx-auto mt-4">

                    <div className="w-full flex justify-end items-center">
                        <div className="border border-gray-200 bg-gray-100 px-4 py-2">
                            <p>Call 123456 Or Gmail <br /> 8XkHr@example.com</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center mt-10 ">

                        {/* Left Side */}
                        <div className="w-full p-4 bg-red-500 rounded text-white">
                            <div className="flex gap-2 border-b border-white py-2">
                                <Search size={24} />
                                <p>Buy Tickets</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center mt-6 space-y-2">

                                <div>
                                    <p>From:</p>
                                    <select
                                        className='w-full border bg-white rounded p-2 text-black'
                                        value={from}
                                        onChange={e => setFrom(e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        {routes.map((bp, i) => (
                                            <option key={i} value={bp}>{bp}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <p>To:</p>
                                    <select
                                        className='w-full  text-black border bg-white rounded p-2'
                                        value={to}
                                        onChange={e => setTo(e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        {routes.map((bp, i) => (
                                            <option key={i} value={bp}>{bp}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div>
                                <p>Date:</p>
                                <input
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className='border w-full rounded bg-gray-200 text-gray-900 p-2'
                                    type="date"
                                />
                            </div>

                            <div className="flex items-center mt-4">
                                <button
                                    className='bg-yellow-500 text-gray-900 px-4 py-2 rounded'
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="w-full h-full">
                            <img
                                loading='lazy'
                                className='w-full rounded object-cover md:max-h-[300px] max-h-[400px]'
                                src="https://i.ibb.co/Kch7yVkq/download.jpg"
                                alt="bus"
                            />
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="p-4 md:p-6 rounded bg-gray-100 mt-6 shadow-md text-justify">
                        আকাশে ভাসমান মেঘের নিচে নদীর তীরে একটি শান্ত গ্রাম, যেখানে গাছের ছায়ায় বসে ছাত্র বই পড়ে আর শিক্ষক জ্ঞান ও সত্যের আলো ছড়িয়ে দেন। সূর্য ওঠার সঙ্গে সঙ্গে পাখির গান শোনা যায়, আবার রাত হলে চাঁদ ও তারা অন্ধকার ভেদ করে স্বপ্ন জাগায়। এই জীবন সময়ের স্রোতে ভেসে চলে, পরিবার ও বন্ধুর ভালোবাসা মানুষকে শক্তি ও সাহস দেয়। পরিশ্রম ও ন্যায় মানুষের সাফল্য আনে, স্বাধীনতা ও মানবতা সমাজকে এগিয়ে নেয়। ইতিহাস ও সংস্কৃতি আমাদের ভাষা, কবিতা ও গল্পকে সমৃদ্ধ করে, আর বিজ্ঞান ও প্রযুক্তি উন্নয়ন ও অগ্রগতির নতুন পথ দেখায়। শহর ও গ্রামের কৃষক, শ্রমিক ও ডাক্তার সবাই মিলে সহযোগিতা ও দায়িত্বের মাধ্যমে পরিবেশ ও প্রকৃতিকে রক্ষা করে একটি সুন্দর ভবিষ্যৎ গড়ে তোলে।
                    </div>
                </div>
            }
            {
                showtab && <div className="">



                    <TicketBookingUi boardingPoints={allBoardingPoints} activeRoute={activeRoute} />


                </div>
            }


        </div>
    );
};

export default CouterLayout;
