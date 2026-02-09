import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Package,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';

import './AdminAsideBar.css';

const AdminAsideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activePath, setActivePath] = useState(window.location.pathname);

    // Update active path when navigation happens (for plain <a> links)
    useEffect(() => {
        const handleLocationChange = () => {
            setActivePath(window.location.pathname);
        };

        window.addEventListener('popstate', handleLocationChange);
        // Also check once on mount
        handleLocationChange();

        return () => {
            window.removeEventListener('popstate', handleLocationChange);
        };
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', href: '/admin' },
        { icon: Users, label: 'কাউন্টার ম্যানেজ', href: '/admin/counter_managment' },
        { icon: ShoppingBag, label: 'অ্যাডমিন ম্যানেজ', href: '/admin/admin_managment' },
        { icon: Package, label: 'রুট ম্যানেজ', href: '/admin/route_managment' },
        { icon: Settings, label: 'বাস ম্যানেজ', href: '/admin/bus_managment' },
        { icon: Settings, label: 'বুকিং ম্যানেজ', href: '/admin/booking_managment' },
    ];

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
                onClick={toggleMobile}
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-40
          transform transition-all duration-300 ease-in-out
          lg:static lg:transform-none
          
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          
          bg-gray-900 text-gray-100
          flex flex-col h-screen
        `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold">অ্যাডমিন পানেল</h1>
                    )}

                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:block p-1.5 rounded hover:bg-gray-800"
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => {
                            const isActive = activePath === item.href;

                            return (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-colors
                      ${isActive
                                                ? 'bg-gray-700 text-white font-medium'
                                                : 'hover:bg-gray-800 text-gray-300'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                                    >
                                        <item.icon size={22} />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-800">
                    <a
                        href="/logout"
                        className={`
              flex items-center gap-3 px-3 py-3 rounded-lg
              hover:bg-red-900/30 text-red-400 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
                    >
                        <LogOut size={22} />
                        {!isCollapsed && <span>Logout</span>}
                    </a>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default AdminAsideBar;