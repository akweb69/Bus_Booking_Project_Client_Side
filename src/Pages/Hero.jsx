import React, { useEffect, useState } from "react";
import bg1 from "../assets/heroBg/bg1.jpg";
// import bg2 from "../assets/heroBg/bg2.jpg";
// import bg3 from "../assets/heroBg/bg3.jpg";
import bg4 from "../assets/heroBg/bg4.jpg";
import bg5 from "../assets/heroBg/bg5.jpg";
import toast from "react-hot-toast";
import { Eye, EyeOffIcon } from "lucide-react";

const images = [bg1, bg4, bg5];

const Hero = () => {
    const [current, setCurrent] = useState(0);
    const [counterCode, setCounterCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 7000);
        return () => clearInterval(interval);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(counterCode, password);
        toast.success('Login successful');
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
                            বাস টিকিট <br />
                            <span className="text-rose-400">ম্যানেজমেন্ট সিস্টেম</span>
                        </h1>

                        <p className="mt-4 text-gray-200 max-w-md leading-relaxed">
                            এই সিস্টেমটি শুধুমাত্র <b>Counter</b> এবং <b>Admin</b> এর জন্য।
                            <br />
                            এখানে টিকিট বুকিং, সিট ম্যানেজমেন্ট এবং ট্রিপ কন্ট্রোল করা যাবে।
                            <br />
                        </p>

                        <div className="mt-6 flex gap-4">
                            <button className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 transition font-semibold">
                                ড্যাশবোর্ড দেখুন
                            </button>
                            <button className="px-6 py-3 rounded-xl border border-white/40 hover:bg-white/10 transition">
                                বিস্তারিত জানুন
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE LOGIN */}
                    <div className="flex justify-center items-center">
                        <div className="w-full max-w-md p-8 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-xl">
                            <h2 className="text-2xl font-semibold text-white text-center">
                                কাউন্টার লগইন
                            </h2>

                            <p className="text-center text-gray-300 text-sm mt-2">
                                অনুগ্রহ করে আপনার কাউন্টার একাউন্টে লগইন করুন

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
                                    লগইন করুন
                                </button>
                            </form>

                            <p className="text-center text-gray-300 mt-4 text-sm">
                                এই লগইন শুধুমাত্র
                                <span className="text-rose-400 font-semibold">
                                    {" "}Counter ও Admin
                                </span>{" "}
                                এর জন্য প্রযোজ্য
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Hero;
