import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserAsideBar from './UserAsideBar';
import { Search, Bell, ChevronDown, User as UserIcon } from 'lucide-react';

const UserLayout = () => {
    const [showMenu, setShowMenu] = useState(false);

    const user = {
        name: "Abu",
        avatar: "https://ui-avatars.com/api/?name=Abu&background=10b981&color=fff",
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <UserAsideBar />

            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <header className="bg-white border-b shadow-sm z-10 sticky top-0">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className=""></div>
                            {/* Search (hidden on very small screens) */}
                            <div className="flex-1 max-w-md hidden md:block">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders, wishlist..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center gap-4 md:gap-6">
                                <button className="relative text-gray-600 hover:text-emerald-600">
                                    <Bell size={20} />
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="flex items-center gap-3 hover:bg-gray-100 p-1.5 rounded-lg"
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-9 w-9 rounded-full object-cover border"
                                        />
                                        <span className="hidden md:block font-medium text-gray-800">{user.name}</span>
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </button>

                                    {showMenu && (
                                        <>
                                            <div className="fixed inset-0 z-20 md:hidden" onClick={() => setShowMenu(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-1 z-30">
                                                <a href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                                                    <UserIcon size={18} /> Profile
                                                </a>
                                                <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                                                    <Settings size={18} /> Settings
                                                </a>
                                                <div className="border-t my-1"></div>
                                                <button className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50">
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-screen-2xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;