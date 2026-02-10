import React from 'react';

const AdminHeader = ({ title, subtitle }) => {
    return (
        <div className='bg-emerald-500 border border-emerald-600 shadow rounded-md p-4'>
            <h1 className="text-3xl font-bold text-gray-100">{title}</h1>
            <p className="text-gray-200 mt-1">{subtitle}</p>

        </div>
    );
};

export default AdminHeader;