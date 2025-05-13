import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./Validation/Login_Validation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [startTime, setStartTime] = useState(null); 
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (!validationErrors.email && !validationErrors.password) {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        const q = query(collection(db, "user"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const userRef = doc(db, "user", userDoc.id);

          await updateDoc(userRef, {
            loginCount: (userData.loginCount || 0) + 1,
            lastLogin: new Date().toISOString(),
          });

          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userID", user.uid);
          localStorage.setItem("userRole", userData.role);
          setStartTime(Date.now());
     
          Swal.fire({
            title: "Login Successful!",
            text: "Welcome to Smart Walker System!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            navigate(userData.role === "admin" ? "/admin" : "/welcome");
          });
        } else {
          console.log("No user data found in Firestore for this uid");
        }
      } catch (error) {
        console.error("Error during login:", error.message);
        setErrors({ ...errors, general: "Invalid email or password" });
      }
    }
  };


  useEffect(() => {
    return () => {
      if (startTime) {
        const endTime = Date.now();
        const usageTime = Math.floor((endTime - startTime) / 1000); 
        updateUsageTime(usageTime);
      }
    };
  }, [startTime]);

  const updateUsageTime = async (timeSpent) => {
    const userID = localStorage.getItem("userID");
    if (userID) {
      const q = query(collection(db, "user"), where("uid", "==", userID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "user", userDoc.id);

        const totalUsageTime = (userDoc.data().totalUsageTime || 0) + timeSpent;
        await updateDoc(userRef, { totalUsageTime });
      }
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row min-h-screen">
      {/* Left Section (Form) */}
      <div className="w-full sm:w-1/2 flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="max-w-sm w-full space-y-6">
          <Link to="/home">
            <img src="/images/walker.gif" alt="Loading" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto animate-pulse" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">Smart Walker System</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleInput}
                placeholder="Enter your email ex.(example1234@gmail.com)"
                className="mt-1 p-3 w-full text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleInput}
                placeholder="Enter your password"
                className="mt-1 p-3 w-full text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            {errors.general && <p className="text-red-500 text-xs mt-1">{errors.general}</p>}
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Login
            </button>
            <p className="text-center text-gray-600 mt-4">
              Don't have an account? <Link to="/register" className="text-blue-500">Create an account</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section (Image) */}
      <div
        className="w-full sm:w-1/2 h-48 sm:h-auto bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login_pics.jpg')" }}
      ></div>
    </div>
  );
}
