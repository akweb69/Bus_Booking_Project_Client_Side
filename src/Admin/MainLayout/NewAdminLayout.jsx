import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddNewCounter from '../Component/AddNewCounter';
import AllCounters from '../Component/AllUsers';
import AddBus from '../Component/AddBus';
import ManageBus from '../Component/ManageBus';

const NewAdminLayout = () => {
    const [loading, setLoading] = useState(true);
    const [activeContent, setActiveContent] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            const counterCode = localStorage.getItem('counterCode');
            const password = localStorage.getItem('password');

            if (!counterCode || !password) {
                toast.error('লগইন করুন!');
                navigate('/');
                return;
            }

            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/user/check/${counterCode}`
                );

                const user = res.data;

                if (
                    res.status === 200 &&
                    user.password === password &&
                    user.status === 'active' &&
                    user.role === 'admin'
                ) {
                    // ✅ Valid admin → stay here
                    setLoading(false);
                } else {
                    throw new Error('Invalid admin');
                }
            } catch (error) {
                localStorage.removeItem('counterCode');
                localStorage.removeItem('password');
                toast.error('লগইন করুন!');
                navigate('/');
            }
        };

        checkAdmin();
    }, [navigate]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm dark:bg-gray-950/80">
                <div className="relative">
                    {/* You can keep your <Loader /> or use this popular tailwind spinner */}
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-500" />
                </div>

                <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                    Loading Admin Panel...
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please wait a moment
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 min-h-screen text-sm ">
            <div className="px-4  border-b border-gray-200 bg-white">
                {/* nav bar */}
                <div className="w-full grid grid-cols-12 ">
                    {/* counter and admin management */}
                    <div className="border-r p-2 border-gray-500 space-y-1 ">
                        <Button onClick={() => setActiveContent(0)} className="w-full cursor-pointer">Add User</Button>
                        <Button onClick={() => setActiveContent(1)} className="w-full cursor-pointer">Manage users </Button>
                    </div>
                    <div className="border-r p-2 border-gray-500 space-y-1 ">
                        <Button onClick={() => setActiveContent(3)} className="w-full cursor-pointer bg-emerald-800">Add Bus</Button>
                        <Button onClick={() => setActiveContent(4)} className="w-full cursor-pointer bg-emerald-800">Manage Bus </Button>
                    </div>

                </div>
            </div>
            {/* main content */}
            <div className="mt-4">
                {
                    activeContent === 0 && <AddNewCounter />
                }
                {
                    activeContent === 1 && <AllCounters />
                }
                {
                    activeContent === 3 && <AddBus />
                }
                {
                    activeContent === 4 && <ManageBus />
                }

            </div>
        </div>
    );
};

export default NewAdminLayout;
