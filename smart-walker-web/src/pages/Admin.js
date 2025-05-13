import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, functions } from "../firebase";
import '../styles/Admin.css';
import useCheckUser from "../hooks/Checklogin";
import Navbar from "../components/Navbarlog";
import Sidebar from "../components/Sidebar";
import Moblie from "../hooks/MoblieMenu";
import Swal from "sweetalert2";
import { httpsCallable } from "firebase/functions";

const Admin = () => {
  useCheckUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = Moblie();


  const handleDelete = async (user) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const deleteUserByEmail = httpsCallable(functions, "deleteUserByEmail");
        console.log("Deleting user with email:", user.email);
      
        const response = await deleteUserByEmail({ userEmail: user.email });
      

        if (response.data.message === "Deleted user") {
          console.log('User deleted from Firebase Auth');
      
   
          await deleteDoc(doc(db, "user", user.id));
          setUsers(users.filter((u) => u.id !== user.id)); 
          Swal.fire("Deleted!", "User has been deleted.", "success");
        } else {
          throw new Error('Failed to delete user from Firebase Auth');
        }
      }

    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire("Error", "Failed to delete user.", "error");
    }
  };

  const handleEdit = async (user) => {
    const { value: newRole } = await Swal.fire({
      title: "Edit User Role",
      input: "select",
      inputOptions: {
        admin: "Admin",
        user: "User",
      },
      inputValue: user.role,
      showCancelButton: true,
    });

    if (newRole) {
      try {
        await updateDoc(doc(db, "user", user.id), { role: newRole });
        setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
        Swal.fire("Updated!", "User role has been updated.", "success");
      } catch (error) {
        console.error("Error updating user role:", error);
        Swal.fire("Error", "Failed to update user role.", "error");
      }
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        const userList = [];
        querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users: ", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isMobile ? <Navbar className="fixed top-0 w-full" /> : <Sidebar />}
      <div className={`p-4 w-full sm:pl-32 ${isMobile ? "pt-20" : ""}`}>
        <div className="admin-page">
          <h1 className="text-3xl font-semibold text-center mb-6">User Management</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <div key={user.id} className="bg-white shadow-lg rounded-lg p-6 space-y-4 transform transition duration-300 hover:scale-105">
                <h3 className="text-xl font-semibold text-gray-800">{user.email}</h3>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Login Count:</strong> {user.loginCount || 0} times</p>
                <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</p>
                <p><strong>Total Usage Time:</strong> {Math.floor(user.totalUsageTime)} min</p>

                <div className="flex justify-between space-x-4">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                    onClick={() => handleDelete(user)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
