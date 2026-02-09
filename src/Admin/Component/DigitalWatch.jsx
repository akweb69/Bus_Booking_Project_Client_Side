'use client'; // If using Next.js App Router

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DigitalWatch = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Bengali numerals converter
    const toBanglaNumber = (num) => {
        const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return num.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d)]);
    };

    // Bangla names
    const banglaWeekdays = [
        'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
        'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
    ];
    const banglaMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');

    const weekday = banglaWeekdays[time.getDay()];
    const day = time.getDate();
    const month = banglaMonths[time.getMonth()];
    const year = time.getFullYear();

    const banglaDate = `${toBanglaNumber(day)} ${month} ${toBanglaNumber(year)}`;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-black to-zinc-950 flex items-center justify-center p-8 overflow-hidden">
            {/* Subtle animated background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] animate-[grid_20s_linear_infinite]" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full  bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-10 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden"
            >
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                {/* Time Display */}
                <div className="text-center">
                    <motion.div
                        key={`${hours}${minutes}${seconds}`}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-center gap-3 text-[6.5rem] font-mono font-bold tracking-[0.15em] text-white"
                    >
                        <span className="drop-shadow-[0_0_30px_rgb(34,211,238)]">{hours}</span>
                        <span className="text-cyan-400 animate-pulse text-6xl">:</span>
                        <span className="drop-shadow-[0_0_30px_rgb(34,211,238)]">{minutes}</span>
                        <span className="text-cyan-400 animate-pulse text-6xl">:</span>
                        <motion.span
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-cyan-300 text-5xl drop-shadow-[0_0_25px_rgb(34,211,238)]"
                        >
                            {seconds}
                        </motion.span>
                    </motion.div>

                    {/* Optional 12-hour indicator */}
                    <div className="text-cyan-400/70 text-xl font-medium tracking-widest mt-1">
                        {time.getHours() >= 12 ? 'PM' : 'AM'}
                    </div>
                </div>

                {/* Date Section */}
                <div className="mt-10 text-center space-y-3">
                    {/* English Date */}
                    <div className="text-zinc-400 text-lg font-medium">
                        {time.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>

                    {/* Bangla Date - Highlighted */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-semibold text-emerald-400 tracking-wide"
                    >
                        {weekday}, {banglaDate}
                    </motion.div>
                </div>

                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm" />
            </motion.div>
        </div>
    );
};

export default DigitalWatch;