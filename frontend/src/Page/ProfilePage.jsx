import React, { useEffect, useState } from "react";
import { verifyToken, updateUser, deleteUser, uploadAvatar } from "../APIs/AuthAPI";
import Navbar from "../Components/Navbar";
import Notification from "../Components/Notification";
import Footer from "../Components/Footer";
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };
  const [formData, setFormData] = useState({
    name: "",
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
        console.log(user);
        

        setFormData({
          name: user.name, // <-- full name
          email: user.email,
          username: user.email.split("@")[0],
          timezone: "Pacific Standard Time",
          phone: user.phone || "",
          city: user?.address?.city || "",
          state: user?.address?.state || "",
          zip: user?.address?.zip || "",
          country: user?.address?.country || "",
        });
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        showNotification('Please select an image file (JPEG, PNG)', 'error');
        return;
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        showNotification('Image size should be less than 1MB', 'error');
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      showNotification('Image selected successfully', 'success');
    }
  };

  // In ProfilePage.jsx, modify the handleSave function
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification('Please log in to update your profile', 'error');
        return;
      }
  
      setLoading(true);
      
      // Upload avatar first if it exists
      if (avatarFile) {
        const formDataObj = new FormData();
        formDataObj.append('profilePic', avatarFile);
        
        try {
          // Upload avatar - pass formData first, then token
          const avatarResponse = await uploadAvatar(formDataObj, token);
          
          if (avatarResponse?.profilePic) {
            setUser(prev => ({
              ...prev,
              profilePic: avatarResponse.profilePic
            }));
            showNotification('Profile picture updated successfully', 'success');
          }
        } catch (err) {
          console.error("Avatar upload failed:", err);
          showNotification('Failed to upload profile picture. ' + (err.response?.data?.message || 'Please try again.'), 'error');
          throw err; // Re-throw to be caught by the outer catch
        }
      }
      
      // Then update user info
      const userData = {
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
      console.log(userData);
      
      await updateUser(token, userData);
      
      showNotification('Profile updated successfully!', 'success');
      setAvatarFile(null);
      
    } catch (err) {
      console.error("Update failed:", err);
      if (!notification.show) { // Don't show duplicate error if already shown
        showNotification(err.response?.data?.message || 'Failed to update profile. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleDeleteAccount = async () => {
    // Using a custom confirm dialog instead of window.confirm
    setNotification({
      show: true,
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      type: 'warning',
      showConfirm: true,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            showNotification("No authentication token found. Please log in again.", 'error');
            return;
          }

          const { user } = await verifyToken(token);
          
          setLoading(true);
          await deleteUser(user._id);
          
          // Show success message before redirecting
          showNotification("Account deleted successfully. Redirecting...", 'success');
          
          // Clear token and redirect to login/home after a short delay
          setTimeout(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }, 1500);
          
        } catch (error) {
          console.error("Error deleting account:", error);
          showNotification(error.response?.data?.message || "Failed to delete account. Please try again.", 'error');
          setLoading(false);
        }
      },
      confirmText: 'Yes, delete my account',
      cancelText: 'Cancel',
      onClose: () => setNotification(prev => ({ ...prev, show: false }))
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  
  if (!user) return <div className="text-white p-6">Loading...</div>;
  return (
    <div className="relative bg-black min-h-screen">
      {/* Notification */}
      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {/* Navbar with higher z-index */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Video Background with lower z-index */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30 z-0 pointer-events-none"
      >
        <source
          src="https://res.cloudinary.com/dk5gtjb3k/video/upload/v1750603314/videoplayback_2_cojfkx.webm"
          type="video/webm"
        />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 h-[calc(100vh-64px)] flex flex-col">
        <div className="w-full h-full overflow-y-auto py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden max-w-4xl mx-auto">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Profile Settings
                    </h1>
                    <p className="text-xs text-gray-500">
                      Manage your personal information
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 py-4">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-2">
                  <div className="relative group">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={avatarPreview || user?.profilePic || "https://i.pravatar.cc/300"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        onChange={handleAvatarChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG (max 1MB)
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4 pb-1 border-b border-gray-100">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        ["Full Name", "name", formData.name],
                        ["Email", "email", formData.email, true],
                        ["Username", "username", formData.username, true],
                        ["Phone", "phone", formData.phone, false, "tel"],
                      ].map(([label, name, value, disabled, type = "text"]) => (
                        <div key={name} className="space-y-2">
                          <label className="block text-xs font-medium text-gray-600">
                            {label}
                          </label>
                          <input
                            type={type}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            disabled={disabled}
                            className={`block w-full px-3 py-1.5 text-sm rounded-lg border ${
                              disabled
                                ? "bg-gray-50 text-gray-500"
                                : "bg-white text-gray-900"
                            } border-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4 pb-1 border-b border-gray-100">
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        ["City", "city", formData.city],
                        ["State/Province", "state", formData.state],
                        ["ZIP/Postal Code", "zip", formData.zip],
                        [
                          "Country",
                          "country",
                          formData.country,
                          false,
                          "select",
                          [
                            { value: "", label: "Select a country" },
                            { value: "US", label: "United States" },
                            { value: "CA", label: "Canada" },
                            { value: "UK", label: "United Kingdom" },
                            { value: "IN", label: "India" },
                          ],
                        ],
                      ].map(
                        ([
                          label,
                          name,
                          value,
                          disabled = false,
                          type = "text",
                          options,
                        ]) => (
                          <div key={name} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {label}
                            </label>
                            {type === "select" ? (
                              <select
                                name={name}
                                value={value}
                                onChange={handleChange}
                                disabled={disabled}
                                className="block w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              >
                                {options.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={type}
                                name={name}
                                value={value}
                                onChange={handleChange}
                                disabled={disabled}
                                className="block w-full px-3 py-1.5 text-sm rounded-lg border bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                {/* Delete Account Section */}
                <div className="mt-4 pt-3 border-t border-red-100 bg-red-50 rounded-lg p-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-medium text-red-800">
                        Delete Account
                      </h3>
                      <p className="mt-1 text-sm text-red-600">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ProfilePage;
