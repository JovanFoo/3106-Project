import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useModal } from "../../hooks/useModal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { toast } from "react-toastify";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

// export default function UserMetaCard(user: User) {
export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const user = useUser();

  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [bio, setBio] = useState(user.bio);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setProfilePicture(user.profilePicture);
    setUsername(user.username);
    setName(user.name);
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber);
    setBio(user.bio);
  }, [user]);
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    // Handle save logic here
    e.preventDefault();
    closeModal();
    // user.setIsLoading(true);
    let isSuccess1 = false;
    let isSuccess2 = false;

    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        Authorization: sessionStorage.getItem("token"),
      },
    };
    setIsUpdating(true);
    await axios
      .put(
        api_address + "/api/stylists/" + user._id,
        {
          username: username,
          name: name,
          email: email,
          bio: bio,
          phoneNumber: phoneNumber,
        },
        config
      )
      .then(() => {
        isSuccess1 = true;
      })
      .catch((err) => {
        isSuccess1 = false;
        setBio(user.bio);
        setEmail(user.email);
        setName(user.name);
        setPhoneNumber(user.phoneNumber);
        setUsername(user.username);
        toast.error("Error: " + err.response.data.message);
      });

    await axios
      .put(
        api_address + "/api/stylists/profilePicture",
        { profilePicture: profilePicture },
        config
      )
      .then(() => {
        isSuccess2 = true;
      })
      .catch((err) => {
        isSuccess2 = false;
        setProfilePicture(user.profilePicture);
        toast.error("Error: " + err.response.data.message);
      });

    if (isSuccess1 && isSuccess2) {
      user.fetchUserContext();
      toast.success("Profile updated successfully.");
      /* the following setXXX() is to help with the loading */
      user.setBio(bio);
      user.setEmail(email);
      user.setName(name);
      user.setPhoneNumber(phoneNumber);
      user.setProfilePicture(profilePicture);
      user.setUsername(username);
      console.log(profilePicture);
      user.saveUserContext(
        user._id,
        username,
        name,
        email,
        profilePicture,
        phoneNumber,
        bio,
        user.role,
        user.stylists,
        user.expertises,
        user.galleries,
        user.appointments
      );
    }
    setIsUpdating(false);
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src={user.profilePicture} />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
          <Button disabled={isUpdating} onClick={openModal}>
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
          </Button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => handleSave(e)}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-2">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 justify-center flex flex-col items-center gap-6 xl:flex-row">
                    <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                      <label
                        htmlFor="profilePicture"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          document.getElementById("profilePicture")?.click();
                        }}
                      >
                        <img
                          src={profilePicture || "/images/user/owner.jpg"}
                          alt="user"
                        />
                      </label>
                    </div>
                    <Input
                      className="hidden"
                      id="profilePicture"
                      type="file"
                      name="profilePicture"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;
                        const file = files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfilePicture(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Username</Label>
                    <Input
                      type="text"
                      name="username"
                      value={username}
                      placeholder="Username"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Name</Label>
                    <Input
                      type="text"
                      name="name"
                      value={name}
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      type="text"
                      name="email"
                      value={email}
                      placeholder="Email Address"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={phoneNumber}
                      placeholder="Phone Number"
                      onChange={(e) => {
                        try {
                          if (e.target.value.length > 8) {
                            return;
                          }
                          if (isNaN(parseInt(e.target.value))) {
                            setPhoneNumber("");
                            return;
                          }
                          setPhoneNumber(e.target.value);
                        } catch (err) {}
                      }}
                      pattern="[0-9]{8}"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input
                      type="text"
                      name="bio"
                      value={bio}
                      placeholder="Bio"
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" type="neutral" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm">Save Changes</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
