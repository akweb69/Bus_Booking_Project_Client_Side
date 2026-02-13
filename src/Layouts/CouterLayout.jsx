import React from 'react';

const CouterLayout = () => {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    }
    return (
        <div className='w-full min-h-screen bg-red-400'>
            <div
                onClick={handleLogout}
                className="">
                LOGOUT
            </div>
        </div>
    );
};

export default CouterLayout;