import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import StylistExpertise from "./Teams/stylistExpertise";
import PortfolioView from "./Teams/stylistPortfolio";
import StylistProfilePage from "./Teams/stylistProfilePage";
import StylistTestimonials from "./Teams/stylistTestimonials";


type Stylist = {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
};

export default function StylistPage() {
    const [stylists, setStylists] = useState<Stylist[]>([
        {
            id: "1",
            name: "Jane Doe",
            email: "jane@example.com",
            role: "Senior Stylist",
            image: "/images/default-avatar.jpg",
        },
        {
            id: "2",
            name: "John Smith",
            email: "john@example.com",
            role: "Junior Stylist",
            image: "/images/default-avatar.jpg",
        },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Profile");
    const [newStylist, setNewStylist] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        branch: "",
        role: "",
    });

    const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);
    const closeViewModal = () => setIsViewModalOpen(false);

    const handleAddStylist = () => {
        const newEntry = {
            ...newStylist,
            id: crypto.randomUUID(),
            image: newStylist.image || "/images/default-avatar.jpg",
        };
        setStylists((prev) => [...prev, newEntry]);
        setNewStylist({ name: "", email: "", role: "", image: "" });
        closeAddModal();
    };
    const handleCardClick = (stylist: Stylist) => {
        setSelectedStylist(stylist);
        setActiveTab("Profile"); // reset tab
        setIsViewModalOpen(true);
    };

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Stylist Management" />

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            All Stylists
                        </h3>
                        <Button size="sm" variant="primary" onClick={openAddModal}>
                            Add Stylist +
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {stylists.map((stylist) => (
                            <div
                                key={stylist.id}
                                onClick={() => handleCardClick(stylist)}
                                className="p-4 border rounded-lg shadow-sm flex flex-col items-center cursor-pointer hover:bg-gray-50 transition"
                            >
                                <img
                                    src={stylist.image}
                                    alt={stylist.name}
                                    className="w-24 h-24 object-cover rounded-full border"
                                />
                                <h5 className="font-semibold text-md mt-2 dark:text-white/90">
                                    {stylist.name}
                                </h5>
                                <p className="text-sm text-gray-500">{stylist.role}</p>
                                <p className="text-xs text-gray-400">{stylist.email}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal isOpen={isAddModalOpen} onClose={closeAddModal} className="max-w-[700px] p-6">
                    <div className="flex flex-col px-2 overflow-y-auto">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Add New Stylist
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newStylist.name}
                                    onChange={(e) => setNewStylist({ ...newStylist, name: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Full Name"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newStylist.username}
                                    onChange={(e) => setNewStylist({ ...newStylist, username: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Unique Username"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newStylist.email}
                                    onChange={(e) => setNewStylist({ ...newStylist, email: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Email"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newStylist.password}
                                    onChange={(e) => setNewStylist({ ...newStylist, password: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Password"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={newStylist.phoneNumber}
                                    onChange={(e) =>
                                        setNewStylist({ ...newStylist, phoneNumber: e.target.value })
                                    }
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Optional phone"
                                />
                            </div>

                            {/* BRANCH + ROLE side-by-side */}
                            <div className="grid grid-cols-2 gap-4 col-span-2">
                                {/* Branch */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                        Branch <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={newStylist.branch}
                                        onChange={(e) => setNewStylist({ ...newStylist, branch: e.target.value })}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="">Select Branch</option>
                                        <option value="orchard">Orchard</option>
                                        <option value="bugis">Bugis</option>
                                        <option value="tampines">Tampines</option>
                                    </select>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={newStylist.role}
                                        onChange={(e) => setNewStylist({ ...newStylist, role: e.target.value })}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Stylist">Stylist</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeAddModal}
                                className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                            <Button size="sm" variant="primary" onClick={handleAddStylist}>
                                Add
                            </Button>
                        </div>
                    </div>
                </Modal>


                {/* modal for viewing stylist content */}
                {selectedStylist && (
                    <Modal
                        isOpen={isViewModalOpen}
                        onClose={closeViewModal}
                        className="max-w-[900px] p-0"
                    >
                        <div className="flex h-[600px]">
                            {/* Sidebar */}
                            <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                                {["Profile", "Expertise", "Portfolio", "Testimonials"].map(
                                    (tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`w-full text-left px-4 py-2 rounded-md mb-2 ${activeTab === tab
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {activeTab === "Profile" && (
                                    <StylistProfilePage stylist={selectedStylist} />
                                )}
                                {activeTab === "Expertise" && (
                                    <StylistExpertise stylist={selectedStylist} />
                                )}
                                {activeTab === "Testimonials" && (
                                    <StylistTestimonials stylist={selectedStylist} />
                                )}
                                {activeTab === "Portfolio" && (
                                    <PortfolioView stylist={selectedStylist} />
                                )}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
}
