import React from 'react';

const AdminDash = () => {
    const date = new Date();
    const today = date.toISOString().split("T")[0];
    return (
        <div className=' w-full'>
            Date:  {today}
        </div>
    );
};

export default AdminDash;