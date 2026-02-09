import React from 'react';
import AdminHeader from '../Component/AdminHeader';
import AddNewCounter from '../Component/AddNewCounter';

const Manage_Counter_Id = () => {
    const [activeTab, setActiveTab] = React.useState(0);
    return (
        <div className='w-full p-4 md:p-6'>
            <div className="w-full ">
                {/* header */}
                <AdminHeader title="কাউন্টার ম্যানেজ করুন" subtitle="এখানে নতুন কাউন্টার বানাতে এবং কাউন্টার ম্যানেজ করতে পারবেন  " />

                {/* main content section */}
                {/* tab section */}
                <div className="mt-4 bg-white md:grid grid-cols-2 w-full md:w-1/2 gap-4 space-y-4 md:space-y-0">
                    <div onClick={() => setActiveTab(0)} className={`w-full  shadow text-center py-3  cursor-pointer rounded-sm ${activeTab === 0 ? "bg-emerald-500 text-white" : "bg-white border text-gray-900"}`}>সকল কাউন্টার</div>
                    <div onClick={() => setActiveTab(1)} className={`w-full shadow  text-center py-3 cursor-pointer  rounded-sm ${activeTab === 1 ? "bg-emerald-500 text-white" : "bg-white border text-gray-900"}`}>নতুন কাউন্টার বানান</div>
                </div>

                {/* content section */}
                <div className="">
                    {
                        activeTab === 1 && <AddNewCounter />
                    }
                </div>
            </div>
        </div>
    );
};

export default Manage_Counter_Id;