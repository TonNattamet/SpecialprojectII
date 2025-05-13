import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./Validation/Register_Validation";
import { Mail, Lock, User, Phone, Ruler, Scale,Microchip  } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";

export default function Register() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    height: "",
    weight: "",
    deviceID1:"",
    deviceID2:"",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);
  
    if (errors.name === "" && errors.email === "" && errors.password === "" && errors.phone === "" && 
      errors.height === "" && errors.weight === "" && errors.deviceID1 === "" && errors.deviceID2 === "") {
      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
  
        await addDoc(collection(db, "user"), {
          uid: user.uid,
          name: values.name,
          email: values.email,
          // password: values.password,
          phone: values.phone,
          height: values.height,
          weight: values.weight,
          deviceID1: values.deviceID1,
          deviceID2: values.deviceID2,
          role: "user",  // Add the role field here
        });
  
        Swal.fire({
          title: "Register Successful!",
          text: "Welcome to Smart Walker System!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/login");
        });
      } catch (error) {
        Swal.fire({
          title: "your Eamil already use!",
          text: "try again",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
        console.error("Error registering user: ", error.message);
      }
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row min-h-screen">
      {/* Left Section (Form) */}
      <div className="w-full sm:w-1/2 flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="max-w-md w-full">
          <Link to="/home" >
            <img
              src="/images/walker.gif"
              alt="Loading"
              className="mb-4 w-32 h-32 sm:w-40 sm:h-40 mx-auto"
            />
          </Link>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-700">
            Sign up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "name", icon: <User />, placeholder: "Name" },
                { name: "email", icon: <Mail />, placeholder: "example1234@gmail.com" },
                { name: "password", icon: <Lock />, placeholder: "Hadds23", type: "password" },
                { name: "phone", icon: <Phone />, placeholder: "0669854478" },
                { name: "height", icon: <Ruler />, placeholder: "Height (cm)" },
                { name: "weight", icon: <Scale />, placeholder: "Weight (kg)" },
                { name: "deviceID1", icon: <Microchip  />, placeholder: "deviceID1" },
                { name: "deviceID2", icon: <Microchip  />, placeholder: "deviceID2" },
              ].map(({ name, icon, placeholder, type = "text" }) => (
                <div key={name} className="relative">
                  <div className="absolute left-3 top-1/3 transform -translate-y-1 text-gray-400">
                    {icon}
                  </div>
                  <input
                    type={type}
                    name={name}
                    value={values[name]}
                    onChange={handleInput}
                    placeholder={placeholder}
                    className="pl-10 pr-4 py-2 sm:py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                </div>
              ))}
            </div>

            <button className="w-full bg-blue-500 text-white py-2 sm:py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition">
              Sign up
            </button>

            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 font-semibold">
                Sign in
              </Link>
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
