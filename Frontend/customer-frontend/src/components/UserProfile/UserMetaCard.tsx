import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
const API_URL = import.meta.env.VITE_API_URL;

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isPassowrdModalOpen,
    openModal: openPasswordModal,
    closeModal: closePasswordModal,
  } = useModal();
  const [firstName, setfirstName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilepic, setProfilepic] = useState("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("activated");
    async function fetchUserData() {
      const userData = localStorage.getItem("user");
      // console.log(userData);

      if (userData) {
        const user = JSON.parse(userData);
        console.log(profilepic);

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
          setProfilepic(data.profilePicture);
          setOriginalEmail(data.email);
          setOriginalUsername(data.username);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }

    fetchUserData();
  }, []);

  const handleSave = async () => {
    // Check if email or username is already taken
    const isEmailTaken = await handleEmailCheck(email);
    const isUsernameTaken = await handleUsernameCheck(username);

    if (isEmailTaken && originalEmail !== email) {
      closeModal();
      toast.error("Email is already in use");
      setEmail(originalEmail);
    }

    if (isUsernameTaken && originalUsername !== username) {
      closeModal();
      toast.error("Username is already in use");
      setUsername(originalUsername);
    }

    // Handle saving logic after validation
    console.log("Saving changes...");
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const token = user.tokens.token;
      console.log(profilepic);

      try {
        const response = await fetch(
          `${API_URL}/api/customers/${user.customer._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              name: firstName,
              email,
              username,
              profilePicture: profilepic,
            }),
          }
        );

        if (response.ok) {
          const updatedUser = await response.json();
          console.log("User updated successfully:", updatedUser);
          closeModal(); // Close modal after saving
          navigate(0);
        } else {
          const errorData = await response.json();
          console.error("Error updating user:", errorData.message);
        }
      } catch (error) {
        console.error("Error fetching:", error);
      }
    }
  };

  const handleEmailCheck = async (email: string) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const token = user.tokens.token;
      try {
        const response = await fetch(
          `${API_URL}/api/customers/email/${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (response.ok) {
          const customer = await response.json();
          console.log("Customer found by email:", customer);
          return true; // email is already taken
        } else {
          return false; // email is available
        }
      } catch (error) {
        console.error("Error checking email:", error);
        return true; // error case, assume email is already taken (prevent changes)
      }
    }
    return false; // if no userData in localStorage
  };

  const handleUsernameCheck = async (username: string) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const token = user.tokens.token;
      try {
        const response = await fetch(
          `${API_URL}/api/customers/username/${username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (response.ok) {
          const customer = await response.json();
          console.log("Customer found by username:", customer);
          return true; // username is already taken
        } else {
          return false; // username is available
        }
      } catch (error) {
        console.error("Error checking username:", error);
        return false; // error case, assume username has already been taken (prevent changes)
      }
    }
    return false; // if no userData in localStorage
  };
  const resetPasswordFieldsCloseModal = async () => {
    setNewPassword("");
    setConfirmPassword("");
    closePasswordModal();
  };
  const handlePasswordSubmit = async () => {
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

        setNewPassword("");
        setConfirmPassword("");
        resetPasswordFieldsCloseModal();
        toast.success("Password changed!");
      } catch (err) {
        console.log(err);
        console.log("error");
      }
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={profilepic || "/images/logo/defaultprofile.png"}
                alt="user"
              />
            </div>

            <div className="order-3 xl:order-2">
              <h2 className=" text-xl font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {firstName}
              </h2>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
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
            onClick={openPasswordModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto whitespace-nowrap"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
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
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
          </div>

          {/* Profile Picture Upload */}
          <div className="col-span-2 lg:col-span-1 mt-4">
            <Label>Profile Picture</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                const file = files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfilepic(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
              className="w-full text-sm"
            />
          </div>
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="mt-7">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setfirstName(e.target.value);
                    }}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Username</Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isPassowrdModalOpen}
        onClose={resetPasswordFieldsCloseModal}
        className="max-w-[700px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
          </div>

          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="mt-7">
              <div className="col-span-2 lg:col-span-1">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                />
              </div>

              <div className="col-span-2 lg:col-span-1 mt-6">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
              </div>
            </div>
            {!newPassword ||
              !confirmPassword ||
              (newPassword !== confirmPassword && (
                <p className="text-red-600 text-center mt-6">
                  {"The passwords do not match"}
                </p>
              ))}
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <button
              onClick={handlePasswordSubmit}
              type="button"
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className={`btn btn-success btn-update-event flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white sm:w-auto ${
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              Change Password
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
