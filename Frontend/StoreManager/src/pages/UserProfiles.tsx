import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import SettingsSidebar from "./SettingsSidebar";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
const config = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    Authorization:
      sessionStorage.getItem("token") ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2RkMmUwM2M0NmIzOWUxZjU1NWEzMTcgU3R5bGlzdCIsImlhdCI6MTc0MjkwODkxNCwiZXhwIjoxNzQyOTE2MTE0fQ.wQwgODNayiyerXAe3AA-Avbu-0BztQF6DmwBfgR_wfo",
  },
};
export default function UserProfiles() {

  useEffect(() => {
    // Fetch user data here
    const selfId =
      sessionStorage.getItem("userId") || "67dd2e03c46b39e1f555a317";
    axios
      .get(api_address + "/api/stylists/" + selfId, config)
      .then((res: AxiosResponse) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
          <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
            <UserAddressCard />
          </div>
        </div>
      </div>
    </div>
  );
}
