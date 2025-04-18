// import { useModal } from "../../hooks/useModal";
// import { Modal } from "../ui/modal";
// import Button from "../ui/button/Button";
// import Input from "../form/input/InputField";
// import Label from "../form/Label";
import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function UserInfoCard() {
  // const { isOpen, openModal, closeModal } = useModal();
  const [firstName, setfirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    console.log("activated");
    async function fetchUserData() {
      const userData = localStorage.getItem("user");

      if (userData) {
        const user = JSON.parse(userData);
        console.log(user);

        try {
          const response = await fetch(
            `${API_URL}/api/customers/${user.customer._id}`,
            {
              method: "GET",
              headers: {
                Authorization: `${user.tokens.token}`,
              },
            }
          );
          const data = await response.json();
          if (!response.ok) {
            console.log(data);
          }

          console.log(data);
          setUsername(data.username);
          setfirstName(data.name);
          setEmail(data.email);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }
    fetchUserData();
  }, []);

  // const handleSave = async () => {
  //   // Handle save logic here
  //   console.log("Saving changes...");
  //   const userData = localStorage.getItem("user");
  //   if (userData) {
  //     const user = JSON.parse(userData);
  //     try {
  //       const response = await fetch(
  //         `${API_URL}/api/customers/${user.customer._id}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `${user.tokens.token}`, // Send token for authorization
  //           },
  //           body: JSON.stringify({
  //             name: firstName,
  //             email,
  //             username,
  //           }),
  //         }
  //       );

  //       if (response.ok) {
  //         const updatedUser = await response.json();
  //         console.log("User updated successfully:", updatedUser);
  //         closeModal(); // Close modal after saving
  //       } else {
  //         const errorData = await response.json();
  //         console.error("Error updating user:", errorData.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching:", error);
  //     }
  //   }
  // };
  // const [newPassword, setNewPassword] = useState<string>("");
  // const [confirmPassword, setConfirmPassword] = useState<string>("");
  // const [message, setMessage] = useState<string>("");
  // const [error, setError] = useState<string>("");
  // const [isOpen2, setIsOpen2] = useState<boolean>(false); // Modal visibility state

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setMessage("");
  //   setError("");

  //   if (newPassword !== confirmPassword) {
  //     setError("New passwords do not match.");
  //     return;
  //   }

  //   const userData = localStorage.getItem("user");

  //   if (userData) {
  //     const user = JSON.parse(userData);
  //     try {
  //       const response = await fetch(
  //         `${API_URL}/api/customers/${user.customer._id}/updatepassword`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `${user.tokens.token}`,
  //           },
  //           body: JSON.stringify({
  //             password: newPassword,
  //             confirmPassword: confirmPassword,
  //           }),
  //         }
  //       );

  //       const data = await response.json();
  //       console.log(data.message, "data");

  //       if (!response.ok) {
  //         throw new Error(data.message || "Failed to update password.");
  //       }

  //       setMessage("Password updated successfully!");
  //       setNewPassword("");
  //       setConfirmPassword("");
  //     } catch (err) {
  //       console.log(err);
  //       console.log("error");
  //     }
  //   }
  // };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {firstName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Username
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {username}
              </p>
            </div>
          </div>
        </div>
        {/* <div className="flex flex-col items-start space-y-2 w-full max-w-xs">
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>

          <button
            onClick={toggleModal}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Change Password
          </button>
        </div> */}
      </div>
      {/*  */}
    </div>
  );
}
