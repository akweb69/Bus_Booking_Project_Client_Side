import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useAllRoute = () => {
    const {
        data: allRoutes = [],
        isLoading: routeLoading,
        isError,
        error,
        refetch: routeRefetch,
    } = useQuery({
        queryKey: ["routes"],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/routes`);
            return res.data;
        },
    });

    return {
        allRoutes,
        routeLoading,
        isError,
        error,
        routeRefetch,
    };
};

export default useAllRoute;
