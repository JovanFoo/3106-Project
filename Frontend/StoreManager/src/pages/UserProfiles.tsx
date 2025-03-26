import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import SettingsSidebar from "./SettingsSidebar";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import Alert from "../components/ui/alert/Alert";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

const config = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    "Authorization":sessionStorage.getItem("token"),
  },
};
export type User = {
  username: string;
  name: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
  bio: string;
  role: string;
  isLoading: boolean;
  showAlert: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setProfilePicture: React.Dispatch<React.SetStateAction<string>>;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setVariant: React.Dispatch<
    React.SetStateAction<"success" | "error" | "warning" | "info">
  >;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};
export default function UserProfiles() {
  const [username, setUsername] = useState("Username");
  const [name, setName] = useState("Name");
  const [email, setEmail] = useState("example@email.com");
  const [profilePicture, setProfilePicture] = useState(
    "/images/user/owner.jpg"
  );
  const [bio, setBio] = useState("Bio has not been set yet.");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("Stylist");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<"success" | "error" | "warning" | "info">("error");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    // Fetch user data here
    const selfId =
      sessionStorage.getItem("userId") || "67dd2e03c46b39e1f555a317";
    if (isLoading) return;
    const fetchData = async () => {
      await axios
        .get(api_address + "/api/stylists/" + selfId, config)
        .then((res: AxiosResponse) => {
          if (res.status !== 200) {
            console.log("Failed to fetch user data.");
            return;
          }
          setUsername(res.data.username);
          setName(res.data.name);
          setEmail(res.data.email);
          setProfilePicture(res.data.profilePicture || "/images/user/owner.jpg");
          setBio(res.data.bio || "Bio has not been set yet.");
          setPhoneNumber(
            res.data.phoneNumber || "Phone number has not been set yet."
          );
          if (res.data.stylists && res.data.stylists.length > 0) {
            setRole("Manager");
          } else {
            setRole("Stylist");
          }
          
          setShowAlert(false);
        })
        .catch((err) => {
          setShowAlert(true);
          setVariant("error");
          setTitle("Error");
          setMessage("Failed to fetch user data.");
        });
    };
    fetchData();
  }, [isLoading]);

  return (
    <div className="flex min-h-screen">
      {/* Settings-specific Sidebar */}
      <SettingsSidebar />

      <div className="flex-1 p-5">
        <PageMeta
          title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
          description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
        />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile
          </h3>
          <div className={showAlert ? ' mb-5' : 'mb-5 hidden'}>
            <Alert variant={variant} title={title} message={message} />
          </div>
          <div className="space-y-6">
            <UserMetaCard
              username={username}
              name={name}
              email={email}
              profilePicture={profilePicture}
              phoneNumber={phoneNumber}
              bio={bio}
              role={role}
              setUsername={setUsername}
              setName={setName}
              setEmail={setEmail}
              setProfilePicture={setProfilePicture}
              setPhoneNumber={setPhoneNumber}
              setBio={setBio}
              setRole={setRole}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              showAlert={showAlert}
              setShowAlert={setShowAlert}
              variant={variant}
              setVariant={setVariant}
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
            />
            <UserInfoCard
              username={username}
              name={name}
              email={email}
              profilePicture={profilePicture}
              phoneNumber={phoneNumber}
              bio={bio}
              role={role}
              setUsername={setUsername}
              setName={setName}
              setEmail={setEmail}
              setProfilePicture={setProfilePicture}
              setPhoneNumber={setPhoneNumber}
              setBio={setBio}
              setRole={setRole}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              showAlert={showAlert}
              setShowAlert={setShowAlert}
              variant={variant}
              setVariant={setVariant}
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
            />
            {/* <UserAddressCard /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
