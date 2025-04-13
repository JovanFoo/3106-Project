import React, { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Alert from "../components/ui/alert/Alert";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import SettingsSidebar from "./SettingsSidebar";

export type AlertType = {
  showAlert: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setVariant: React.Dispatch<
    React.SetStateAction<"success" | "error" | "warning" | "info">
  >;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};
export default function UserProfiles() {
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("error");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-h-screen">
      {/* Settings-specific Sidebar */}
      <SettingsSidebar />

      <div className="flex-1 p-5">
      <PageMeta
          title="User Profile"
          description="Manage your Profile"
        />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile
          </h3>
          <div className={showAlert ? " mb-5" : "mb-5 hidden"}>
            <Alert variant={variant} title={title} message={message} />
          </div>
          <div className="space-y-6">
            <UserMetaCard
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
