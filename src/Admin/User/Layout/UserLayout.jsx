import { Outlet } from 'react-router-dom';
import UserAsideBar from './UserAsideBar';

const UserLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <UserAsideBar />
            <div className="flex-1 h-screen overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default UserLayout;