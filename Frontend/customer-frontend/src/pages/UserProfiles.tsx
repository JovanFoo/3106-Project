import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useModal } from "../hooks/useModal";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import ComponentCard from "../components/common/ComponentCard";
import { useUser } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserProfiles() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isPasswordModalOpen,
    openModal: openPasswordModal,
    closeModal: closePasswordModal,
  } = useModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const [previewName, setPreviewName] = useState("");
  const [previewEmail, setPreviewEmail] = useState("");
  const [previewUsername, setPreviewUsername] = useState("");
  const [previewPic, setPreviewPic] = useState("");

  const [, setOriginalEmail] = useState("");
  const [, setOriginalUsername] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { refreshUser } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/"); // authentication check
    }
  }, []);

  useEffect(() => {
    console.log("activated");
    async function fetchUserData() {
      const userData = localStorage.getItem("user");
      // console.log(userData);

      if (userData) {
        const user = JSON.parse(userData);
        // console.log(profilePic);

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
          setName(data.name);
          setEmail(data.email);
          setProfilePic(data.profilePicture);
          setPreviewPic(data.profilePicture);
          setLoyaltyPoints(data.loyaltyPoints);
          setOriginalEmail(data.email); // could be redundant
          setOriginalUsername(data.username); // could be redundant
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPreviewName(name || "");
      setPreviewEmail(email || "");
      setPreviewUsername(username || "");
      setPreviewPic(profilePic || "");
      setEmailError("");
      setUsernameError("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    // check if email or username is already taken
    const isEmailTaken = await handleEmailCheck(previewEmail);
    const isUsernameTaken = await handleUsernameCheck(previewUsername);

    setEmailError("");
    setUsernameError("");

    if (isEmailTaken) {
      setEmailError("Email is already in use.");
      return;
    }

    if (isUsernameTaken) {
      setUsernameError("Username is already in use.");
      return;
    }

    console.log("Saving changes...");
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const token = user.tokens.token;
      // console.log(profilePic);

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
              name: previewName,
              email: previewEmail,
              username: previewUsername,
              profilePicture: previewPic,
            }),
          }
        );

        if (response.ok) {
          const updatedUser = await response.json();
          console.log("User updated successfully:", updatedUser);

          setName(updatedUser.name);
          setEmail(updatedUser.email);
          setUsername(updatedUser.username);
          setProfilePic(updatedUser.profilePicture);

          toast.success("Profile Updated!");
          closeModal(); // close modal after saving
          await refreshUser(); // update context with fresh data
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
      const currentUserId = user.customer._id;
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

          // returns true if email is already taken
          // returns false if email is already taken but by the current user
          return customer._id !== currentUserId;
        } else {
          return false; // email is available
        }
      } catch (error) {
        console.error("Error checking email:", error);
        return false; // error case, assume email is already taken (prevent changes)
      }
    }
    return false; // if no userData in localStorage
  };

  const handleUsernameCheck = async (username: string) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const token = user.tokens.token;
      const currentUserId = user.customer._id;
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

          // returns true if username is already taken
          // returns false if username is already taken but by the current user
          console.log(customer._id !== currentUserId);
          return customer._id !== currentUserId;
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
    setPasswordError("");
    closePasswordModal();
  };
  const handlePasswordSubmit = async () => {
    if (newPassword.length < 6 || confirmPassword.length < 6) {
      setPasswordError("Password must meet minimum requirements stated.");
      return;
    }

    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(""); // clear error state

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
      <PageMeta title="BuzzBook - Profile" description="BuzzBook - Profile" />
      <PageBreadcrumb pageTitle="Your Profile" />

      {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-base font-medium text-gray-800 dark:text-white/90 lg:mb-6">
          Profile
        </h3>
      </div> */}

      <ComponentCard title="Profile Details">
        <div className="space-y-6">
          <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                  <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                    <img
                      src={profilePic || "/images/logo/defaultprofile.png"}
                      alt="user"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="order-3 xl:order-2">
                    <h2 className=" text-xl font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                      {name}
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
            <Modal
              isOpen={isOpen}
              onClose={closeModal}
              className="max-w-[700px] m-4"
            >
              <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14 mb-8">
                  <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Edit Personal Information
                  </h4>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <Label>Profile Picture Preview</Label>
                  <img
                    src={previewPic || "/images/logo/defaultprofile.png"}
                    alt="user"
                    className="h-[150px] w-[150px] object-cover rounded-full border"
                  />

                  <label className="cursor-pointer rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;
                        const file = files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPreviewPic(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="custom-scrollbar h-[300px] overflow-y-auto px-2 pb-3">
                  <div className="mt-7">
                    <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                      Personal Information
                    </h5>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Name</Label>
                        <Input
                          type="text"
                          value={previewName}
                          onChange={(e) => {
                            setPreviewName(e.target.value);
                          }}
                        />
                      </div>

                      <div className="col-span-2 lg:col-span-1">
                        <Label>Email Address</Label>
                        <Input
                          type="text"
                          value={previewEmail}
                          onChange={(e) => {
                            setPreviewEmail(e.target.value);
                          }}
                        />
                      </div>

                      <div className="col-span-2 lg:col-span-1">
                        <Label>Username</Label>
                        <Input
                          type="text"
                          value={previewUsername}
                          onChange={(e) => {
                            setPreviewUsername(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-center pt-6">
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">
                          {emailError}
                        </p>
                      )}
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">
                          {usernameError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-4 lg:justify-end">
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
              isOpen={isPasswordModalOpen}
              onClose={resetPasswordFieldsCloseModal}
              className="max-w-[600px] m-4"
            >
              <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                  <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Change Password
                  </h4>
                </div>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-2 pb-3">
                  <div className="mt-7">
                    <div className="col-span-2 lg:col-span-1 relative">
                      <Label>New Password</Label>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-800"
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    <div className="col-span-2 lg:col-span-1 mt-6 relative">
                      <Label>Confirm Password</Label>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError("");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-800"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Note: Password has to be at least 6 characters long!
                    </p>

                    {passwordError && (
                      <p className="text-red-600 text-center mt-4">
                        {passwordError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <button
                    onClick={handlePasswordSubmit}
                    type="button"
                    className={`btn btn-success btn-update-event flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white sm:w-auto bg-brand-500 hover:bg-brand-600`}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </Modal>
          </>

          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-base leading-normal text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {name}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-base leading-normal text-gray-500 dark:text-gray-400">
                      Username
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {username}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-base leading-normal text-gray-500 dark:text-gray-400">
                      Email address
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {email}
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
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Loyalty Points:
                </h4>
                <p className="text-gray-700 dark:text-white">
                  You currently have{" "}
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">
                    {loyaltyPoints.toFixed(2)}{" "}
                    {loyaltyPoints === 1 ? "Point" : "Points"}
                  </strong>
                  ! Book appointments using our site and earn more for
                  discounts!
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
