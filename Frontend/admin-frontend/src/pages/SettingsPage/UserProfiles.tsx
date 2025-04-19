import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import SettingsSidebar from "./SettingsSidebar";
import { ToastContainer } from "react-toastify";

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
  return (
    <div className="flex ">
      {/* Settings-specific Sidebar */}
      <SettingsSidebar />

      <div className="flex-1 p-5">
        <PageMeta title="User Profile" description="Manage your User Profile" />

        <PageBreadcrumb pageTitle="Profile" />
        <div className="rounded-2xl  min-h-[80vh] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile
          </h3>

          <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
            <ToastContainer autoClose={3000} position="bottom-right" />
            {/* <UserAddressCard /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
