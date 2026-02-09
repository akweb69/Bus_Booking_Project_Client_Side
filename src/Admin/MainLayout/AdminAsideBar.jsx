import React, { useState } from 'react';
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
} from 'lucide-react'; // ← or use any icon library you prefer

import './AdminAsideBar.css'; // we'll create this next

const AdminAsideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
        { icon: Package, label: 'Products', href: '/admin/products' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ];

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile hamburger button */}
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
                {/* Header / Logo area */}
                <div className="p-4 border-b border-gray-800 flex items-center justify">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold ">Admin Panel</h1>
                    )}

                    {/* Collapse button - desktop only */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:block p-1.5 rounded hover:bg-gray-800"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg
                    hover:bg-gray-800 transition-colors
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

                {/* Footer / Logout */}
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

            {/* Mobile overlay backdrop */}
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