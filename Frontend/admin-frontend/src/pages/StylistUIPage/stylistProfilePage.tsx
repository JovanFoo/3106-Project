import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import ToggleSwitch from "../../components/ui/button/ToggleSwitch";
import { toast, ToastContainer } from "react-toastify";

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
  stylists: string[]; // Assuming this is an array of stylist IDs
  isActive: boolean;
};

type Props = {
  stylist: { _id: string }; // only requires _id from Teams.tsx
};

export default function StylistProfilePage({ stylist }: Props) {
  const [fullStylist, setFullStylist] = useState<Stylist | null>(null);
  const [assignedBranch, setAssignedBranch] = useState<string | null>(null);

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
      setFullStylist(res.data);
    } catch (err) {
      console.error("Failed to fetch stylist profile", err);
    }
  };

  const fetchAssignedBranch = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${api_address}/api/branches`, {
        headers: {
          Authorization: token,
        },
      });

      const allBranches = res.data;

      const assigned = allBranches.find((branch: any) =>
        branch.stylists?.some((s: any) => s._id === stylist._id)
      );

      setAssignedBranch(assigned?.location || "Not assigned");
    } catch (error) {
      console.error("Failed to fetch assigned branch", error);
      setAssignedBranch("Unknown");
    }
  };

  useEffect(() => {
    if (stylist._id) {
      fetchStylist();
      fetchAssignedBranch();
    }
  }, [stylist._id]);

  const handleToggle = () => {
    const token = sessionStorage.getItem("token");
    axios
      .put(
        `${api_address}/api/stylists/toggleActive/${stylist._id}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        setFullStylist((prev) => ({
          ...prev!,
          isActive: !prev!.isActive,
        }));
        toast.success(
          `Stylist ${res.data.isActive ? "enabled" : "disabled"} successfully.`
        );
      })
      .catch((err) => {
        console.error("Failed to update stylist status", err);
        toast.error("Failed to update stylist status.");
      });
  };
  if (!fullStylist) return <p className="text-gray-500">Loading profile...</p>;
  const handleResetPassword = async () => {
    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    };
    await axios
      .post(
        api_address + "/api/auth/stylists/forget-password",
        {
          email: fullStylist?.email,
        },
        config
      )
      .then((res: AxiosResponse) => {
        // console.log(res.data);
        if (res.status !== 200) {
          toast.error(res.data.message);
          return;
        }
        toast.success("Password reset email sent successfully.");
      })
      .catch((err) => {
        // console.log(err);
      });
  };

  return (
    <div className="flex  mr-4">
      <div className="flex-1 p-5 mr-4">
        <PageBreadcrumb pageTitle="Profile Page" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex flex-col items-center">
            <img
              src={fullStylist.profilePicture || "/images/user/owner.jpg"}
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
                value={fullStylist.stylists.length > 0 ? "Manager" : "Stylist"}
                disabled
              />
            </div>
            <div>
              <label className="dark:text-white">Assigned Branch</label>
              <input
                className="w-full border p-2 rounded dark:text-white/90 dark:bg-slate-800"
                value={assignedBranch || "Loading..."}
                disabled
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between ">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium dark:text-white">
                Enabled
              </span>
              <ToggleSwitch
                checked={fullStylist.isActive}
                onChange={handleToggle}
                className="h-6 w-12"
              />
            </div>
            <div>
              <Button onClick={handleResetPassword}>Reset Password</Button>
            </div>
          </div>
          <ToastContainer autoClose={3000} position="bottom-right" />
        </div>
      </div>
    </div>
  );
}
