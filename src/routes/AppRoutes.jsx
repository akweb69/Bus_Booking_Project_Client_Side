import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Layout from "@/Admin/MainLayout/Layout";
import AdminDash from "@/Admin/MainLayout/AdminDash";
import UserLayout from "@/Admin/User/Layout/UserLayout";
import UserDash from "@/Admin/User/Layout/UserDash";
import SignIn from "@/Pages/SignIn";
import SignUp from "@/Pages/SignUp";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
            </Route>

            {/* admin routes */}
            <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDash />} />

            </Route>
            {/* user Dashboard routes */}
            <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<UserDash />} />

            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
