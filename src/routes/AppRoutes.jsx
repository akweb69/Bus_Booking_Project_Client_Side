import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import NewAdminLayout from "@/Admin/MainLayout/NewAdminLayout";
import CouterLayout from "@/Layouts/CouterLayout";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                {/* <Route path="/signin" element={<SignIn />} /> */}
                {/* <Route path="/signup" element={<SignUp />} /> */}
            </Route>

            {/* admin routes */}
            {/* <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDash />} />
                <Route path="/admin/counter_managment" element={<Manage_Counter_Id />} />

            </Route> */}
            <Route path="/admin" element={<NewAdminLayout />} />

            {/* user Dashboard routes */}

            <Route path="/dashboard" element={<CouterLayout />} />



            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
