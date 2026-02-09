import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useAllCountar = () => {
    const {
        data: allCountar = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`);
            return res.data;
        },
    });

    return {
        allCountar,
        isLoading,
        isError,
        error,
        refetch,
    };
};

export default useAllCountar;
