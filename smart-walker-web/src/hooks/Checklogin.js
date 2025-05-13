import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByUid } from "../firebase";

export default function useCheckUser() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const userEmail = localStorage.getItem("userEmail");
        const userID = localStorage.getItem("userID");
        if (!userEmail || !userID) {
            navigate("/home");
        }
        else {


            getUserByUid(userID).then((user) => {
                if (user) {
                    setUserData(user);            
                    if (user.role === "admin" && window.location.pathname !== "/admin") {
                        navigate("/admin"); 
                    } else if (user.role === "user" && window.location.pathname === "/admin") {
                        navigate("/dashboard"); 
                    }
                    localStorage.setItem("userRole", user.role);
                } else {
                    setUserData({ email: userEmail, uid: userID });
                }
            });
        }
    }, [navigate]);
    return userData;
}
