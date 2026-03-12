import useAllRoute from '@/Admin/Hooks/useAllRoute';
import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TicketBookingUi from './TicketBookingUi';

const CouterLayout = () => {
    const { routeLoading, allRoutes } = useAllRoute();
    const [activeRoute, setActiveRoute] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const userid = localStorage.getItem('counterCode');
        if (!userid || !allRoutes?.length) return;

        axios
            .get(`${import.meta.env.VITE_BASE_URL}/user/check/${userid}`)
            .then(res => {
                const data = res.data;

                if (data?.status === 'active' && data?.role === 'counter') {
                    // নতুন structure: route_name দিয়ে match
                    const selectedRoute = allRoutes.find(
                        r => r?.route_name === data?.selectedRoute
                    );

                    if (selectedRoute) {
                        setActiveRoute(data?.selectedRoute);
                        console.log('Active route:', selectedRoute);
                    } else {
                        toast.error('Assigned route not found');
                    }
                } else {
                    toast.error('Access denied');
                    localStorage.clear();
                    window.location.href = '/';
                }

                setAuthChecked(true);
            })
            .catch(() => {
                toast.error('User validation failed');
                setAuthChecked(true);
            });
    }, [allRoutes]);

    if (routeLoading || !authChecked) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <Loader size={33} className="animate-spin text-rose-500" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen">
            {/* boardingPoints prop সরানো হয়েছে — 
                TicketBookingUi এখন bus থেকেই all_boarding_points নেয় */}
            <TicketBookingUi activeRoute={activeRoute} />
        </div>
    );
};

export default CouterLayout;