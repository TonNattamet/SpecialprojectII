import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    height: "",
    weight: ""
  });
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setUserData({
        username: localStorage.getItem("username") || "User",
        email: localStorage.getItem("email") || "",
        phone: localStorage.getItem("phone") || "",
        height: localStorage.getItem("height") || "",
        weight: localStorage.getItem("weight") || ""
      });
    }
  }, [navigate]);
  return userData;
};
export default useAuth;
