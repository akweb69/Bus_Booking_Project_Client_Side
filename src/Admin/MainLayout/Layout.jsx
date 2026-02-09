// AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminAsideBar from './AdminAsideBar';
import {
    Search,
    Bell,
    User,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';

const AdminLayout = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    // You can fetch this from auth context later
    const user = {
        name: "Abu",
        role: "Administrator",
        avatar: "https://ui-avatars.com/api/?name=Abu&background=0D8ABC&color=fff&size=128", // placeholder
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-gray-50">
            {/* Sidebar */}
            <AdminAsideBar />

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Navbar */}
                <header className="bg-white border-b border-gray-200 shadow-sm z-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Left - Mobile menu button + Title (optional) */}
                            <div className="flex items-center lg:hidden">
                                {/* If your AdminAsideBar has its own mobile toggle, you can omit this */}
                                <span className="text-lg font-semibold text-gray-800"></span>
                            </div>

                            {/* Center - Search bar */}
                            <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users, orders, products..."
                                        className="
                      block w-full pl-10 pr-4 py-2 
                      border border-gray-300 rounded-lg 
                      text-sm focus:outline-none focus:ring-2 
                      focus:ring-emerald-500 focus:border-emerald-500
                      placeholder-gray-400
                    "
                                    />
                                </div>
                            </div>

                            {/* Right - Actions */}
                            <div className="flex items-center gap-4">
                                {/* Notifications */}
                                <button
                                    className="relative p-2 text-gray-600 hover:text-emerald-600 focus:outline-none"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="
                      flex items-center gap-3 
                      p-1.5 rounded-lg hover:bg-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-emerald-500
                    "
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-9 w-9 rounded-full object-cover border border-gray-200"
                                        />
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                        </div>
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-20 lg:hidden"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <div
                                                className="
                          absolute right-0 mt-2 w-56 
                          bg-white rounded-lg shadow-xl border border-gray-200 
                          py-1 z-30
                        "
                                            >
                                                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.role}</p>
                                                </div>

                                                <Link
                                                    to="/admin/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <User size={18} />
                                                    <span>Profile</span>
                                                </Link>

                                                <Link
                                                    to="/admin/settings"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings size={18} />
                                                    <span>Settings</span>
                                                </Link>

                                                <div className="border-t border-gray-100 my-1"></div>

                                                <button
                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        // handle logout logic here
                                                        setShowUserMenu(false);
                                                    }}
                                                >
                                                    <LogOut size={18} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div
                        className="
              mx-auto w-full max-w-screen-2xl 
              rounded-xl bg-white shadow-sm border border-gray-200 
              min-h-[calc(100vh-8rem)]
            "
                    >
                        <div className="p-5 md:p-6 lg:p-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;