"use client";

import React from "react";

/* --- Icons (same as yours) --- */
const GitHubIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.835 2.809 1.305 3.492.998.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white py-12 px-4 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-rose-500">
                        Bus Ticket Manager
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        এটি একটি আধুনিক <b>Bus Ticket Management System</b>
                        যেখানে শুধুমাত্র <b>Admin</b> এবং <b>Counter</b>
                        টিকিট, ট্রিপ ও সিট ম্যানেজ করতে পারবেন।

                    </p>

                    <div className="flex gap-4 pt-2">
                        <a href="#" className="text-gray-500 hover:text-rose-500 transition">
                            <GitHubIcon size={26} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Links</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="hover:text-rose-500 cursor-pointer">Dashboard</li>
                        <li className="hover:text-rose-500 cursor-pointer">Counter Panel</li>
                        <li className="hover:text-rose-500 cursor-pointer">Admin Panel</li>
                        <li className="hover:text-rose-500 cursor-pointer">Reports</li>
                    </ul>
                </div>

                {/* System Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">System Access</h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <li>✔ Counter Code দিয়ে লগইন</li>
                        <li>✔ Email Login নিষিদ্ধ</li>
                        <li>✔ Secure Role Based Access</li>
                        <li>✔ Real-time Ticket Control</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Support Counter (24/7)
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        📧 support@busticket.com
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        ☎ +880 1XXX-XXXXXX
                    </p>
                </div>
            </div>

            {/* Bottom */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-10 mt-10 border-t border-gray-200 dark:border-gray-700">
                <p>
                    © {new Date().getFullYear()} Bus Ticket Management System
                </p>
                <p className="mt-1">
                    Designed & Developed with <span className="text-red-500">♥</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
