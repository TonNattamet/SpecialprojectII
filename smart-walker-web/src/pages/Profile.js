import React, { useEffect, useState } from "react";
import { FaCog, FaPencilAlt, FaSpinner } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbarlog";

import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import useCheckUser from "../hooks/Checklogin";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import Moblie from "../hooks/MoblieMenu";
import Header from "../components/Header";


const MySwal = withReactContent(Swal);



const Profile = () => {
  const user = useCheckUser();
  const auth = getAuth();


  const [users, setUsers] = useState(null);
  const isMobile = Moblie();

  const [selectedImage, setSelectedImage] = useState(null); // ใช้เพื่อเก็บรูปภาพที่เลือก
  const [imageUrl, setImageUrl] = useState(""); // ใช้เพื่อเก็บ URL ของรูปภาพ
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const usersRef = collection(db, "user"); // ดึงข้อมูลจาก collection
      const q = query(usersRef, where("uid", "==", auth.currentUser.uid)); // ค้นหา uid

      getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUsers(userData); // เซ็ตค่า user
          setImageUrl(userData.profileImage || "");
        } else {
          console.log("No user found with this UID!");
        }
      }).catch(error => console.error("Error fetching user:", error));
    }
  }, [auth.currentUser]);

  const [, setUploadProgress] = useState(0);
  const uploadImage = async (file, onProgress = () => { }) => {
    setIsUploading(true);
    const storageRef = ref(storage, `${auth.currentUser.uid}/${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          onProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setIsUploading(false); // หยุดการโหลดเมื่อเสร็จสิ้น
            resolve(downloadUrl);
          });
        }
      );
    });
  };

  const handleSaveProfile = async () => {
    if (!users) return;
    const newName = document.getElementById("swal-name").value;
    const newEmail = document.getElementById("swal-email").value;
    const newPhone = document.getElementById("swal-phone").value;
    const newHeight = document.getElementById("swal-height").value;
    const newWeight = document.getElementById("swal-weight").value;
    try {
      let profileImageUrl = imageUrl;
      if (selectedImage) {
        profileImageUrl = await uploadImage(selectedImage, (progress) => {
          const progressBar = document.getElementById("upload-progress-bar");
          const progressText = document.getElementById("upload-progress");
          if (progressBar) progressBar.style.width = `${progress}%`;
          if (progressText) progressText.textContent = `${progress.toFixed(0)}%`;
        });
      }
      const usersRef = collection(db, "user");
      const q = query(usersRef, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocRef = doc(db, "user", querySnapshot.docs[0].id); 
        await updateDoc(userDocRef, {
          name: newName,
          email: newEmail,
          phone: newPhone,
          height: newHeight,
          weight: newWeight,
          profileImage: profileImageUrl,
        });
        await updateProfile(auth.currentUser, { displayName: newName });
        await updateEmail(auth.currentUser, newEmail);
        MySwal.fire({
          icon: "success",
          title: "Updated Successfully!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };
  const handleEditImage = async () => {
    const { value: file } = await MySwal.fire({
      title: "Select your profile image",
      input: "file",
      inputAttributes: {
        accept: "image/*",
        "aria-label": "Upload your profile picture",
      },
      showCancelButton: true,
      confirmButtonText: "Upload",

      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded'
      },
      preConfirm: (selectedFile) => {
        if (!selectedFile) {
          Swal.showValidationMessage("You must select an image");
        }
      },
    });

    if (file) {
      setSelectedImage(file);

      // แสดง progress popup
      MySwal.fire({
        title: "Uploading...",
        html: `
          <div class="text-sm text-gray-600 mb-2">Progress: <span id="upload-percent">0%</span></div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div id="upload-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });

      try {
        const downloadUrl = await uploadImage(file, (progress) => {
          const percentSpan = Swal.getHtmlContainer().querySelector("#upload-percent");
          const bar = Swal.getHtmlContainer().querySelector("#upload-bar");
          if (percentSpan && bar) {
            percentSpan.textContent = `${progress.toFixed(0)}%`;
            bar.style.width = `${progress}%`;
          }
        });

        const usersRef = collection(db, "user");
        const q = query(usersRef, where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDocRef = doc(db, "user", querySnapshot.docs[0].id);
          await updateDoc(userDocRef, {
            profileImage: downloadUrl
          });

          setImageUrl(downloadUrl);
          setUploadProgress(0);

          MySwal.fire({
            icon: "success",
            title: "Image updated!",
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        MySwal.fire("Error", "Failed to upload image.", "error");
      }
    }
  };




  const handleEditProfile = () => {
    MySwal.fire({
      title: "Edit Profile",
      width: window.innerWidth < 768 ? "90%" : "70%",
      html: `
        <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; max-width: 450px; margin: auto; font-family: sans-serif;">
          <label style="font-weight: bold; font-size: ${window.innerWidth < 768 ? "12px" : "14px"}; margin-bottom: 4px;">Full Name</label>
          <input id="swal-name" class="swal2-input" placeholder="Full Name" value="${user.name || ""}" 
            style="width: 100%; border-radius: 8px; padding: 8px; font-size: ${window.innerWidth < 768 ? "12px" : "14px"};">
          
          <label style="font-weight: bold; font-size: ${window.innerWidth < 768 ? "12px" : "14px"}; margin-bottom: 4px;">Email</label>
          <input id="swal-email" class="swal2-input" type="email" placeholder="Email" value="${user.email}" 
            style="width: 100%; border-radius: 8px; padding: 8px; font-size: ${window.innerWidth < 768 ? "12px" : "14px"};">
          
          <label style="font-weight: bold; font-size: ${window.innerWidth < 768 ? "12px" : "14px"}; margin-bottom: 4px;">Phone</label>
          <input id="swal-phone" class="swal2-input" placeholder="Phone" value="${user.phone || ""}" 
            style="width: 100%; border-radius: 8px; padding: 8px; font-size: ${window.innerWidth < 768 ? "12px" : "14px"};">
          
          <div style="display: flex; gap: 12px;">
            <div style="flex: 1;">
              <label style="font-weight: bold; font-size: ${window.innerWidth < 768 ? "12px" : "14px"}; margin-bottom: 4px;">Height</label>
              <input id="swal-height" class="swal2-input" placeholder="Height" value="${user.height || ""}" 
                style="width: 100%; border-radius: 8px; padding: 8px; font-size: ${window.innerWidth < 768 ? "12px" : "14px"};">
            </div>
            <div style="flex: 1;">
              <label style="font-weight: bold; font-size: ${window.innerWidth < 768 ? "12px" : "14px"}; margin-bottom: 4px;">Weight</label>
              <input id="swal-weight" class="swal2-input" placeholder="Weight" value="${user.weight || ""}" 
                style="width: 100%; border-radius: 8px; padding: 8px; font-size: ${window.innerWidth < 768 ? "12px" : "14px"};">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded'
      },
      preConfirm: () => {

        const name = document.getElementById('swal-name').value;
        const email = document.getElementById('swal-email').value;
        const phone = document.getElementById('swal-phone').value;
        const height = document.getElementById('swal-height').value;
        const weight = document.getElementById('swal-weight').value;

        const isChanged = (
          name !== user.name ||
          email !== user.email ||
          phone !== user.phone ||
          height !== user.height ||
          weight !== user.weight
        );
        if (!isChanged) {

          MySwal.fire({
            icon: "info",
            title: "No Changes Detected",
            text: "You haven't made any changes to your profile.",
            confirmButtonText: "Okay"
          });
          return false; 
        }

        handleSaveProfile(name, email, phone, height, weight);
      }
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <FaSpinner className="text-gray-500 text-6xl animate-spin" />
        <p>กำลังโหลดข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col  min-h-screen bg-gray-50 ">
      <div className={`min-h-screen ${isUploading ? 'filter blur-sm' : ''}`}>
        {isMobile ? <Navbar className="fixed top-0 w-full" /> : <Sidebar />}

        <div className={`p-4  w-full sm:pl-32 ${isMobile ? "pt-20" : ""}`}>
          <Header />

          <div className="flex-1 p-4 md:p-6">
            <div className="bg-white shadow-md p-4 md:p-6 rounded-lg w-full">
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between`}>
                <h2 className="text-lg md:text-xl font-semibold flex items-center">
                  <FaCog className="mr-2" /> Settings
                </h2>

                <button
                  className="text-gray-800 flex items-center mt-3 md:mt-0"
                  onClick={handleEditProfile}
                >
                  Edit User Profile <FaPencilAlt className="ml-2" />
                </button>
              </div>
              {!isMobile && <h2 className=" md:text-xl font-semibold flex items-center text-gray-500 text-[30px] font-[400]">
                <span className="mr-7 hidden md:block" />
                Account Settings
              </h2>}
              <div className="mt-6 flex flex-col lg:flex-row items-center lg:items-start gap-6">
                {/* ข้อมูลผู้ใช้ */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow w-full lg:w-1/2">
                  <p className="text-lg font-semibold">Full Name</p>
                  <p className="text-gray-700">{user.name || "N/A"}</p>
                  <p className="text-lg font-semibold mt-4">Email</p>
                  <p className="text-gray-700">{user.email}</p>
                  <p className="text-lg font-semibold mt-4">Phone</p>
                  <p className="text-gray-700">{user.phone || "N/A"}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-lg font-semibold mt-4">Height</p>
                      <p className="text-gray-700">{user.height || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold mt-4">Weight</p>
                      <p className="text-gray-700">{user.weight || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* รูปโปรไฟล์ */}
                <div className="flex flex-col items-center gap-4 mx-auto relative">
                  <div className="absolute -top-4 -right-4 bg-gray-300 rounded-full shadow p-2 cursor-pointer hover:bg-gray-400 transition">
                    <button
                      onClick={handleEditImage}
                      className="text-black-600 text-sm flex items-center justify-center"
                    >
                      <FaPencilAlt />
                    </button>
                  </div>

                  {!imageUrl ? (
                    <div className="flex items-center justify-center w-[250px] h-[260px] bg-gray-100 rounded-lg">
                      <p className="text-lg font-semibold text-gray-700">No Image</p>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="w-[250px] h-[260px] object-cover rounded-lg shadow"
                    />
                  )}

                  <p className="text-gray-700 font-semibold text-lg">{user.name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  );


};

export default Profile;
