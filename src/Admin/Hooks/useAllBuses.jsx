import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useAllBuses = () => {
    const {
        data: allBuses = [],
        isLoading: busLoading,
        isError,
        error,
        refetch: routeRefetch,
    } = useQuery({
        queryKey: ["routes"],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/bus`);
            return res.data;
        },
    });

    return {
        allBuses,
        busLoading,
        isError,
        error,
        routeRefetch,
    };
};

export default useAllBuses;
