import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Stylist = {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  bio?: string;
  username?: string;
  role: string;
};

type Props = {
  stylist: { _id: string }; // only requires _id from Teams.tsx
};

export default function StylistProfilePage({ stylist }: Props) {
  const [fullStylist, setFullStylist] = useState<Stylist | null>(null);

  useEffect(() => {
    const fetchStylist = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${api_address}/api/stylists/${stylist._id}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const data: Stylist = res.data;
        data.role = "Stylist"; // Ensure the role is set to "Stylist"
        data.profilePicture = data.profilePicture || "/images/user/owner.jpg"; // Default image if none provided
        setFullStylist(data);
      } catch (err) {
        console.error("Failed to fetch stylist profile", err);
      }
    };

    if (stylist._id) fetchStylist();
  }, [stylist._id]);

  if (!fullStylist) return <p className="text-gray-500">Loading profile...</p>;

  return (
    <div className="flex  mr-4">
      <div className="flex-1 p-5 mr-4">
        <PageBreadcrumb pageTitle="Profile Page" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex flex-col items-center">
            <img
              src={fullStylist.profilePicture || "/images/default-avatar.jpg"}
              alt={fullStylist.name}
              className="w-32 h-32 object-cover rounded-full border mb-2"
            />
            <p className="text-sm italic text-gray-500">
              {fullStylist.bio || `"This stylist hasn't written a bio yet."`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dark:text-white">Name</label>
              <input
                className="w-full border p-2 rounded dark:text-white/90 dark:bg-slate-800"
                value={fullStylist.name}
                disabled
              />
            </div>
            <div>
              <label className="dark:text-white">Username</label>
              <input
                className="w-full border p-2 rounded dark:text-white/90 dark:bg-slate-800"
                value={fullStylist.username || "-"}
                disabled
              />
            </div>
            <div>
              <label className="dark:text-white">Email</label>
              <input
                className="w-full border p-2 rounded dark:text-white/90 dark:bg-slate-800"
                value={fullStylist.email}
                disabled
              />
            </div>
            <div>
              <label className="dark:text-white">Phone</label>
              <input
                className="w-full border p-2 rounded dark:text-white/90 dark:bg-slate-800"
                value={fullStylist.phoneNumber || "-"}
                disabled
              />
            </div>
            <div>
              <label className="dark:text-white">Role</label>
              <input
                className="w-full border p-2 rounded dark:text-white/90 dark:bg-slate-800"
                value={fullStylist.role}
                disabled
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border p-2 rounded-md">
            <span className="text-sm font-medium dark:text-white">Enabled</span>
            <div className="bg-blue-600 text-white px-4 py-1 rounded-md">
              Yes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
