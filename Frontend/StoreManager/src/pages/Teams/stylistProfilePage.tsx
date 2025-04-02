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
                const res = await axios.get(`${api_address}/api/stylists/${stylist._id}`, {
                    headers: {
                        Authorization: token,
                    },
                });
                setFullStylist(res.data);
            } catch (err) {
                console.error("Failed to fetch stylist profile", err);
            }
        };

        if (stylist._id) fetchStylist();
    }, [stylist._id]);

    if (!fullStylist) return <p className="text-gray-500">Loading profile...</p>;

    return (
        <div className="flex min-h-screen mr-4">
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Profile Page" />
                <div className="space-y-4 mr-4">
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
                            <label>Name</label>
                            <input className="w-full border p-2 rounded" value={fullStylist.name} disabled />
                        </div>
                        <div>
                            <label>Username</label>
                            <input className="w-full border p-2 rounded" value={fullStylist.username || "-"} disabled />
                        </div>
                        <div>
                            <label>Email</label>
                            <input className="w-full border p-2 rounded" value={fullStylist.email} disabled />
                        </div>
                        <div>
                            <label>Phone</label>
                            <input className="w-full border p-2 rounded" value={fullStylist.phoneNumber || "-"} disabled />
                        </div>
                        <div>
                            <label>Role</label>
                            <input className="w-full border p-2 rounded" value={fullStylist.role} disabled />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border p-2 rounded-md">
                        <span className="text-sm font-medium">Enabled</span>
                        <div className="bg-blue-600 text-white px-4 py-1 rounded-md">Yes</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
