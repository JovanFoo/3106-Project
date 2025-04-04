import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import StylistExpertise from "./Teams/stylistExpertise";
import PortfolioView from "./Teams/stylistPortfolio";
import StylistProfilePage from "./Teams/stylistProfilePage";
import StylistTestimonials from "./Teams/stylistTestimonials";
import { useModal } from "../hooks/useModal";
import axios from "axios";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
type Stylist = {
  _id: string;
  name: string;
  username: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  role: "Manager" | "Stylist";
  profilePicture?: string;
  branch?: string;
};
type Branch = {
  _id: string;
  name: string;
};

export default function StylistPage() {
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //   const {
  //     isOpen: isOpenNew,
  //     closeModal: closeModalNew,
  //     openModal: openModalNew,
  //   } = useModal();
  //   const {
  //     isOpen: isOpenEdit,
  //     closeModal: closeModalEdit,
  //     openModal: openModalNew,
  //   } = useModal();
  //   const {
  //     isOpen: isOpenDelete,
  //     closeModal: closeModalDelete,
  //     openModal: openModalNew,
  //   } = useModal();

  const [activeTab, setActiveTab] = useState("Profile");
  const [selectedStylist, setSelectedStylist] = useState<Stylist>();

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeViewModal = () => setIsViewModalOpen(false);

  const handleAddStylist = (stylist: Stylist) => {
    // add new stylist to the list
    setStylists((prev) => [...prev, stylist]);
    // const newEntry = {
    //   ...newStylist,
    //   id: crypto.randomUUID(),
    //   image: newStylist.image || "/images/default-avatar.jpg",
    // };
    // setStylists((prev) => [...prev, newEntry]);
    // setNewStylist({ name: "", email: "", role: "", image: "" });
    closeAddModal();
  };
  const handleCardClick = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setActiveTab("Profile"); // reset tab
    setIsViewModalOpen(true);
  };
  useEffect(() => {
    fetchStylistsData();
    fetchBranchesData();
  }, []);
  const fetchStylistsData = async () => {
    await axios.get(`${api_address}/api/stylists`, config).then((response) => {
      console.log(response.data);
      const data = response.data.map((stylist: Stylist) => {
        return {
          ...stylist,
          image: stylist.profilePicture || "/images/default-avatar.jpg",
        };
      });
      setStylists(data);
    });
  };
  const fetchBranchesData = async () => {
    await axios.get(`${api_address}/api/branches`, config).then((response) => {
      console.log(response.data);
      const data = response.data.map((branch) => {
        return {
          _id: branch._id,
          name: branch?.location,
        };
      });
      setBranches(data);
    });
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
                key={stylist._id}
                onClick={() => handleCardClick(stylist)}
                className="p-4 border rounded-lg shadow-sm flex flex-col items-center cursor-pointer hover:bg-gray-50 transition"
              >
                <img
                  src={stylist.profilePicture || "/images/user/owner.jpg"}
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
        <CustomModal
          isOpen={isAddModalOpen}
          closeModal={closeAddModal}
          branches={branches}
          onSave={handleAddStylist}
        />

        {/* modal for viewing stylist content */}
        {selectedStylist && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={closeViewModal}
            className="w-[900px] p-0"
          >
            <div className="flex h-[600px] ">
              {/* Sidebar */}
              <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                {["Profile", "Expertise", "Portfolio", "Testimonials"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full text-left px-4 py-2 rounded-md mb-2 ${
                        activeTab === tab
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
              <div className="flex-1 p-6 ">
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

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  stylists?: Stylist; // Optional prop to pass a service object for editing
  onSave: (transaction: Stylist) => void; // Function to call when saving the service
  branches: Branch[]; // Optional prop to pass a list of branches for the select input
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  stylists,
  branches,
  onSave,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [stylistData, setStylistData] = useState<Stylist>({
    _id: "",
    name: "",
    email: "",
    username: "",
    password: "",
    role: "Stylist",
    profilePicture: "/images/default-avatar.jpg",
  });
  const handleSave = () => {
    onSave(stylistData);
  };
  useEffect(() => {
    setStylistData({
      _id: stylists?._id || "",
      name: stylists?.name || "",
      email: stylists?.email || "",
      username: stylists?.username || "",
      password: stylists?.password || "",
      role: stylists?.role || "Stylist",
      profilePicture: stylists?.profilePicture || "/images/default-avatar.jpg",
    });
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Add New Stylist
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={stylistData.name}
              onChange={(e) =>
                setStylistData({ ...stylistData, name: e.target.value })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={stylistData.username}
              onChange={(e) =>
                setStylistData({ ...stylistData, username: e.target.value })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Unique Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={stylistData.email}
              onChange={(e) =>
                setStylistData({ ...stylistData, email: e.target.value })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={stylistData.password}
              onChange={(e) =>
                setStylistData({ ...stylistData, password: e.target.value })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={stylistData.phoneNumber}
              onChange={(e) =>
                setStylistData({
                  ...stylistData,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Optional phone"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 col-span-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={stylistData.branch}
                onChange={(e) =>
                  setStylistData({ ...stylistData, branch: e.target.value })
                }
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={stylistData.role}
                onChange={(e) =>
                  setStylistData({
                    ...stylistData,
                    role: e.target.value == "Manager" ? "Manager" : "Stylist",
                  })
                }
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Stylist">Stylist</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Cancel
          </button>
          <Button size="sm" variant="primary" onClick={handleSave}>
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
};
