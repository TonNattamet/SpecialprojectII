import { useEffect, useState } from "react";
import { getAuth, updateEmail, updateProfile } from "firebase/auth";
import { db, storage } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import useCheckUser from "./Checklogin";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import EditProfileModal from "../components/Profile/EditProfileModal";
import ImageUploadModal from "../components/Profile/ImageUploadModal";

const MySwal = withReactContent(Swal);

const useUserData = () => {
  const auth = getAuth();
  const user = useCheckUser();
  const [users, setUsers] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(collection(db, "user"), where("uid", "==", auth.currentUser.uid));
      getDocs(q)
        .then((snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setUsers(data);
            setImageUrl(data.profileImage || "");
          }
        })
        .catch(console.error);
    }
  }, [auth.currentUser]);

  const uploadImage = (file, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      const storageRef = ref(storage, `${auth.currentUser.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setIsUploading(false);
            resolve(url);
          });
        }
      );
    });
  };

  const handleEditImage = () =>
    ImageUploadModal({ uploadImage, auth, setImageUrl });

  const handleEditProfile = () =>
    EditProfileModal({ user, auth, imageUrl, uploadImage });

  return {
    user: users,
    imageUrl,
    isUploading,
    handleEditProfile,
    handleEditImage,
  };
};

export default useUserData;
