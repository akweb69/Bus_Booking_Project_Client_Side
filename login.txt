import React, { useEffect, useState } from "react";
import bg1 from "../assets/heroBg/bg1.jpg";
// import bg2 from "../assets/heroBg/bg2.jpg";
// import bg3 from "../assets/heroBg/bg3.jpg";
import bg4 from "../assets/heroBg/bg4.jpg";
import bg5 from "../assets/heroBg/bg5.jpg";
import toast from "react-hot-toast";
import { Eye, EyeOffIcon } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const images = [bg1, bg4, bg5];

const Hero = () => {
    const [current, setCurrent] = useState(0);
    const [counterCode, setCounterCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const base_url = import.meta.env.VITE_BASE_URL
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 7000);
        return () => clearInterval(interval);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.loading('Verifying counter code...');

        if (!counterCode || !password) {
            toast.dismiss();
            toast.error('Please fill in all fields!');
            return;
        }
        // check user exits----->
        const res0 = await axios.get(`${base_url}/user/check/${counterCode}`)
        if (res0.status === 200) {
            // check password------>
            const data = res0.data
            const dbPassword = data?.password
            const status = data?.status
            const role = data?.role

            if (dbPassword === password && status === 'active' && role === 'counter') {
                localStorage.setItem('counterCode', counterCode)
                localStorage.setItem('password', data?.password)

                toast.dismiss()
                toast.success('Successfully logged in')
                navigate('/dashboard')

            }
            else if (dbPassword === password && status === 'active' && role === 'admin') {
                localStorage.setItem('counterCode', counterCode)
                localStorage.setItem('password', data?.password)
                toast.dismiss()
                toast.success('Successfully logged in')
                navigate('/admin')
            }
            // status inactive--->
            else if (status === 'inactive') {
                toast.dismiss()
                toast.error('Please check your counter code - your counter is not active!')
            }
            else {
                toast.dismiss()
                toast.error('Please check your counter code - you are not a counter member!')
            }

        }
    }
    return (
        <div className="w-full min-h-screen relative ">
            {/* background slideshow */}
            <div className="absolute inset-0">
                <img
                    src={images[current]}
                    alt="hero background"
                    className="w-full h-full object-cover transition-all duration-1000"
                />
            </div>

            {/* overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[5px]"></div>

            {/* content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl w-full">

                    {/* LEFT SIDE */}
                    <div className="text-white flex flex-col justify-center">
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Bus Ticket <br />
                            <span className="text-rose-400">Management System</span>
                        </h1>

                        <p className="mt-4 text-gray-200 max-w-md leading-relaxed">
                            This system is only for <b>Counter</b> and <b>Admin</b>.<br />
                            Here you can manage ticket booking, seat management and trip control.
                            <br />
                        </p>

                        <div className="mt-6 flex gap-4">
                            <button className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 transition font-semibold">
                                View Dashboard
                            </button>
                            <button className="px-6 py-3 rounded-xl border border-white/40 hover:bg-white/10 transition">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE LOGIN */}
                    <div className="flex justify-center items-center">
                        <div className="w-full max-w-md p-8 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-xl">
                            <h2 className="text-2xl font-semibold text-white text-center">
                                Counter Login
                            </h2>

                            <p className="text-center text-gray-300 text-sm mt-2">
                                Please login to your counter account
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 space-y-4">
                                <input
                                    onChange={(e) => setCounterCode(e.target.value)}
                                    type="text"
                                    placeholder="Counter Code"
                                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-rose-400"
                                />

                                <div className="relative">
                                    <input
                                        onChange={(e) => setPassword(e.target.value)}
                                        type={`${showPassword ? "text" : "password"}`}
                                        placeholder="Password"
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-rose-400"
                                    />
                                    <span
                                        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-white hover:text-rose-400 transition"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon onClick={() => setShowPassword(false)} />
                                        ) : (
                                            <Eye onClick={() => setShowPassword(true)} />
                                        )}
                                    </span>

                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-lg bg-rose-500 hover:bg-rose-600 transition text-white font-semibold"
                                >
                                    Login
                                </button>
                            </form>

                            <p className="text-center text-gray-300 mt-4 text-sm">
                                This login is only applicable for
                                <span className="text-rose-400 font-semibold">
                                    {" "}Counter & Admin
                                </span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Hero;