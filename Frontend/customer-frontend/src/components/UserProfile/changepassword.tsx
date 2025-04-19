import React, { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false); // modal visibility state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const userData = localStorage.getItem("user");

    if (userData) {
      const user = JSON.parse(userData);
      try {
        const response = await fetch(
          `${API_URL}/api/customers/${user.customer._id}/updatepassword`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${user.tokens.token}`,
            },
            body: JSON.stringify({
              password: newPassword,
              confirmPassword: confirmPassword,
            }),
          }
        );

        const data = await response.json();
        console.log(data.message, "data");

        if (!response.ok) {
          throw new Error(data.message || "Failed to update password.");
        }

        setMessage("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        console.log(err);
        console.log("error");
      }
    }
  };

  const toggleModal = () => setIsOpen(!isOpen); // toggle modal visibility

  return (
    <div>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h4 className="text-center text-xl font-semibold mb-4">
              Change Password
            </h4>

            {/* Success or error messages */}
            {message && <p className="text-green-600 text-center">{message}</p>}
            {error && <p className="text-red-600 text-center">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control w-full p-3 border border-gray-300 rounded-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control w-full p-3 border border-gray-300 rounded-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-md font-medium shadow-md hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 focus:outline-none"
              >
                Change Password
              </button>
            </form>

            <button
              onClick={toggleModal}
              className="w-full mt-4 py-2 bg-gray-300 text-gray-700 rounded-md font-medium shadow-sm hover:bg-gray-400 transform hover:scale-105 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
