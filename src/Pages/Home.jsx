import { motion } from "framer-motion";
import Hero from "./Hero";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [checkUser, setCheckUser] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        const counterCode = localStorage.getItem('counterCode')
        const password = localStorage.getItem('password')
        if (counterCode && password) {
            axios.get(`${import.meta.env.VITE_BASE_URL}/user/check/${counterCode}`).then(res => {
                if (res.status === 200) {
                    const pass = res.data.password
                    if (pass === password && res.data.status === 'active' && res.data.role === 'counter') {
                        setCheckUser(true)
                        navigate('/dashboard')
                    }
                    else if (pass === password && res.data.status === 'active' && res.data.role === 'admin') {
                        setCheckUser(true)
                        navigate('/admin')
                    }
                    else {
                        localStorage.removeItem('counterCode')
                        localStorage.removeItem('password')
                    }

                }

            })
        }
    }, [])
    return (
        <div className="">
            {
                !checkUser && <Hero />
            }
        </div>
    );
};

export default Home;
