import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const logout = async () => {
        localStorage.removeItem('counterCode');
        localStorage.removeItem('password');
        navigate('/')
    }

    const value = { loading, setLoading, logout };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
