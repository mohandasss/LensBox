import React, { useEffect, useState } from "react";
import { verifyToken, updateUser, deleteUser } from "../APIs/AuthAPI"; // Your provided verifyToken function
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

        const nameSplit = user.name.split(" ");
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <div className="bg-gray-950 min-h-screen text-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-semibold mb-8 text-white">
          Personal Information
        </h2>

        <div className="flex items-center gap-6 mb-8">
          <img
            src={avatarPreview || "https://i.pravatar.cc/100"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
          />
          <label className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded cursor-pointer">
            Change Avatar
            <input
              type="file"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-400">JPG, PNG, max 1MB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            ["Full Name", "name", formData.name],

            ["Email", "email", formData.email, true],
            ["Username", "username", formData.username, true],
            ["Phone", "phone", formData.phone],
            ["Timezone", "timezone", formData.timezone],
            ["City", "city", formData.city],
            ["State", "state", formData.state],
            ["ZIP", "zip", formData.zip],
            ["Country", "country", formData.country],
          ].map(([label, name, value, disabled]) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">{label}</label>
              <input
                className={`bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-white font-medium shadow"
          >
            Save
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-white font-medium shadow"
          >
            Sign Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
