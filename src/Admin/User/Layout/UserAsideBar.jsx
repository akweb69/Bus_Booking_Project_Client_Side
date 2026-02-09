import React, { useState } from 'react';
import {
    LayoutDashboard, User, CreditCard, History, Heart, Settings, LogOut,
    ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

const UserAsideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', href: '/dashboard' },
        { icon: User, label: 'প্রোফাইল', href: '/dashboard/profile' },
        { icon: CreditCard, label: 'পেমেন্টস', href: '/dashboard/payments' },
        { icon: History, label: 'অর্ডার হিস্ট্রি', href: '/dashboard/orders' },
        { icon: Heart, label: 'উইশলিস্ট', href: '/dashboard/wishlist' },
        { icon: Settings, label: 'সেটিংস', href: '/dashboard/settings' },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-md rounded-md text-gray-700"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Menu size={24} />
            </button>

            <aside
                className={`
          fixed inset-y-0 left-0 z-40 transform transition-all duration-300
          lg:static lg:transform-none
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          bg-white border-r border-gray-200 flex flex-col h-screen shadow-sm
        `}
            >
                {/* Logo / Brand */}
                <div className="p-5 border-b flex items-center justify-between">
                    {!isCollapsed && <span className="text-xl font-bold text-gray-800">আমার একাউন্ট</span>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:block p-1.5 hover:bg-gray-100 rounded"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 py-6">
                    <ul className="space-y-1.5">
                        {menuItems.map((item, i) => (
                            <li key={i}>
                                <a
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700
                    hover:bg-gray-100 transition-colors
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                                >
                                    <item.icon size={22} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t">
                    <a
                        href="/logout"
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-red-600
              hover:bg-red-50 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
                    >
                        <LogOut size={22} />
                        {!isCollapsed && <span>লগআউট</span>}
                    </a>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default UserAsideBar;
