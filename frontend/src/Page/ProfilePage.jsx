import React, { useEffect, useState } from "react";
import { verifyToken, updateUser, deleteUser } from "../APIs/AuthAPI"; // Your provided verifyToken function
import Navbar from "../Components/Navbar";
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "", // <-- single field
    email: "",
    username: "",
    timezone: "Pacific Standard Time",
    phone: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const { user } = await verifyToken(token);

        setUser(user);

       
        setFormData({
          name: user.name, // <-- full name
          email: user.email,
          username: user.email.split("@")[0],
          timezone: "Pacific Standard Time",
          phone: user.phone || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || "",
          country: user.address?.country || "",
        });
       
        
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    
    

    fetchUser();
    
    
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name.startsWith("address.")) {
    const addressField = name.split(".")[1];
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [addressField]: value,
      },
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};
;
console.log(formData);
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const updatedData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
      };

      const response = await updateUser(token, updatedData);
      console.log("Profile updated successfully:", response);
      // Optionally show success message
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally show error message
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const { user } = await verifyToken(token);
      console.log(user._id);

      const response =await deleteUser(user._id);


      console.log("Account deleted:", response.data.message);

      // Optional: clear token and redirect to login/home
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <div className="text-white p-6">Loading...</div>;
  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
  {/* Video Background */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
  >
    <source src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750603314/videoplayback_2_cojfkx.webm" type="video/webm" />
    Your browser does not support the video tag.
  </video>

  {/* Content Overlay */}
  <div className="relative z-10">
    <Navbar />

    <div className="min-h-screen text-white py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold mb-8 text-black text-center">
          Personal Information
        </h2>

        {/* Avatar and Upload */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={user?.profilePic || "https://i.pravatar.cc/100"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow"
          />
          <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded cursor-pointer transition">
            Change Avatar
            <input
              type="file"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500">JPG, PNG, max 1MB</p>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            ["Full Name", "name", formData.name],
            ["Email", "email", formData.email, true],
            ["Username", "username", formData.username, true],
            ["Phone", "phone", formData.phone],
            ["Timezone", "timezone", formData.timezone],
            ["City", "address.city", formData.city],
            ["State", "address.state", formData?.state],
            ["ZIP", "address.zip", formData?.zip],
            ["Country", "address.country", formData?.country],
          ].map(([label, name, value, disabled]) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">{label}</label>
              <input
                className={`bg-gray-100 text-black rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  disabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={label}
                disabled={disabled}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-end">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-white font-medium shadow"
          >
            Save
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg text-white font-medium shadow"
          >
            Sign Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition font-medium shadow"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

     
  );
};

export default ProfilePage;
