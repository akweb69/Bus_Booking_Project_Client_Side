import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoimg from "../../assets/logo/image-removebg-preview (4).png";
import {
    Menu,
    X,
    Home,
    Info,
    Sparkles
} from "lucide-react";

/* Navigation Items (বাংলা) */
const navItems = [
    { name: "Home", path: "/", icon: Home },
    // { name: "আমাদের সম্পর্কে", path: "/about", icon: Info },
    // { name: "ফিচারসমূহ", path: "/Dashboard", icon: Sparkles },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // স্ক্রল হলে Navbar রঙ পরিবর্তন
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`
                sticky top-0 z-50 w-full transition-all duration-300
                ${isScrolled
                    ? "bg-white text-gray-800 shadow-md"
                    : "bg-transparent text-white backdrop-blur-[2px]"}
            `}
        >
            {/* Main Navbar */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <img className="h-14 object-cover" src={logoimg} alt="logo" />
                    </Link>

                    {/* Desktop NavLinks */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="group relative px-4 py-2 text-sm font-medium"
                            >
                                <span
                                    className={`
                                        relative z-10 flex items-center gap-1.5 transition
                                        ${isScrolled ? "text-gray-700" : "text-white"}
                                    `}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </span>

                                <motion.span
                                    className="absolute inset-0 rounded-md bg-primary/10 scale-95 opacity-0 group-hover:opacity-100"
                                    transition={{ duration: 0.2 }}
                                />
                            </NavLink>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white shadow-lg"
                    >
                        <div className="px-4 py-5 flex flex-col gap-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
