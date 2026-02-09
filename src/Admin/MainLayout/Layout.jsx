// AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import AdminAsideBar from './AdminAsideBar';


const AdminLayout = () => {

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-gray-50">
            {/* Sidebar */}
            <AdminAsideBar />

            {/* Main content wrapper */}
            <div className="flex-1  h-screen overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;