// import React, { useState, useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import "./EditProfileModal.css";

// const EditProfileModal = ({ isOpen, onClose }) => {
//   const { user, setUser } = useContext(AuthContext);
//   const [fullName, setFullName] = useState(user.full_name);
//   const [email, setEmail] = useState(user.email);
//   const [phoneNumber, setPhoneNumber] = useState(user.phone_number); // Add state for phone number

//   const handleSave = async () => {
//     try {
//       console.log("Saving profile with data:", { full_name: fullName, email, phone_number: phoneNumber });
//       const response = await fetch(`/update-profile`, { // Ensure this matches your server's endpoint
//         method: "PUT", // Use PUT method
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ full_name: fullName, email, phone_number: phoneNumber }), // Include phone number
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update profile");
//       }

//       const updatedUser = await response.json();
//       console.log("Profile updated successfully:", updatedUser);
//       setUser(updatedUser);
//       onClose();
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2>Edit Profile</h2>
//         <label>
//           Full Name:
//           <input
//             type="text"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//           />
//         </label>
//         <label>
//           Email:
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </label>
//         <label>
//           Phone Number:
//           <input
//             type="text" // Use "text" type for phone number
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)} // Update state for phone number
//           />
//         </label>
//         <button onClick={handleSave}>Save</button>
//         <button onClick={onClose}>Cancel</button>
//       </div>
//     </div>
//   );
// };

// export default EditProfileModal;
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./EditProfileModal.css";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);

  // Add a loading state in case the user data is not yet available
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setPhoneNumber(user.phone_number);
      setLoading(false); // Mark loading as false when user data is available
    }
  }, [user]);

  const handleSave = async () => {
    try {
      console.log("Saving profile with data:", { full_name: fullName, email, phone_number: phoneNumber });
      const response = await fetch(`/update-profile`, { // Ensure this matches your server's endpoint
        method: "PUT", // Use PUT method
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, phone_number: phoneNumber }), // Include phone number
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);
      setUser(updatedUser);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!isOpen || loading || !user) return null; // Handle case when user is not available or loading

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <label>
          Full Name:
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Phone Number:
          <input
            type="text" // Use "text" type for phone number
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)} // Update state for phone number
          />
        </label>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProfileModal;
