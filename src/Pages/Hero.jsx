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
        <div className="flex justify-center items-center h-screen flex-col bg-gray-300">

            {/* Top Header */}


            {/* Login Box */}
            <div className="bg-linear-to-b w-[500px] from-orange-400 to-orange-600 text-white text-sm font-semibold px-4 py-2">
                Welcome to Paribahan Panel
            </div>
            <div className="">
                <div className="w-[500px] bg-gray-200 border-2 border-gray-600 p-8">


                    <h2 className="text-xl font-semibold text-gray-700 mb-6">
                        Log in to Admin Panel
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                User name:
                            </label>
                            <input
                                type="text"
                                onChange={(e) => setCounterCode(e.target.value)}
                                className="w-[250px] border border-gray-500 px-2 py-1 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Password:
                            </label>
                            <input
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-[250px] border border-gray-500 px-2 py-1 bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-4 px-4 py-1 border border-gray-600 bg-gray-300"
                        >
                            Login
                        </button>

                    </form>

                    {/* Footer */}
                    <div className="mt-10 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
                        Copyright © Tobi Akaki Limited
                    </div>

                </div>
            </div>
        </div>


    );
};

export default Hero;