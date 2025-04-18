import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import StylistExpertise from "../StylistUIPage/stylistExpertise";
import PortfolioView from "../StylistUIPage/stylistPortfolio";
import StylistProfilePage from "../StylistUIPage/stylistProfilePage";
import StylistTestimonials from "../StylistUIPage/stylistTestimonials";
import { toast, ToastContainer } from "react-toastify";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
type Stylist = {
  _id: string;
  name: string;
  username: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  role: string | "Manager" | "Stylist";
  profilePicture?: string;
  branch?: string;
  stylists?: Stylist[];
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
  const [pageLimit, setPageLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [hasNextpage, setHasNextpage] = useState(false);

  const {
    isOpen: isOpenNew,
    closeModal: closeModalNew,
    openModal: openModalNew,
  } = useModal();
  const {
    isOpen: isOpenView,
    closeModal: closeModalView,
    openModal: openModalView,
  } = useModal();

  const [selectedStylist, setSelectedStylist] = useState<Stylist>();

  const handleAddStylist = async (stylist: Stylist) => {
    await axios
      .post(`${api_address}/api/stylists`, stylist, config)
      .then((response) => {
        console.log(response.data);
        setStylists((prev) => [...prev, response.data]);
        fetchStylistsData();
        // if (stylist.role === "Manager") {
        // }
      });
    closeModalNew();
  };

  const handleCardClick = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    openModalView();
  };
  useEffect(() => {
    fetchStylistsData();
    fetchBranchesData();
  }, []);
  const fetchStylistsData = async () => {
    await axios
      .get(
        `${api_address}/api/stylists/pagination?page=${page}&limit=${pageLimit}`,
        config
      )
      .then((response) => {
        // console.log(response.data.stylists);
        setHasNextpage(response.data.hasNextPage);
        const stylistData: Stylist[] = response.data.stylists;
        const data = stylistData.map((stylist) => {
          return {
            _id: stylist._id,
            name: stylist.name,
            username: stylist.username,
            email: stylist.email,
            profilePicture: stylist.profilePicture || "/images/user/owner.jpg",
            role: stylist.stylists?.length
              ? stylist.stylists?.length > 0
                ? "Manager"
                : "Stylist"
              : "Stylist",
          };
        });
        const newList: Stylist[] = [...stylists, ...data].reduce(
          (acc: Stylist[], current) => {
            if (!acc.find((item) => item._id === current._id)) {
              return acc.concat(current);
            } else {
              return acc;
            }
          },
          []
        );
        setStylists(newList);
      });
  };
  const fetchBranchesData = async () => {
    await axios.get(`${api_address}/api/branches`, config).then((response) => {
      console.log(response.data);
      const data = response.data.map((branch: any) => {
        return {
          _id: branch?._id,
          name: branch?.location,
        };
      });
      setBranches(data);
    });
  };
  const handleScroll = () => {
    if (hasNextpage) {
      setPage((prev) => prev + 1);
      fetchStylistsData();
    }
  };
  useEffect(() => {
    if (page > 1) {
      fetchStylistsData();
    }
  }, [page]);
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-5">
        <PageMeta title="Stylist Management" description="Manage Stylists" />
        <PageBreadcrumb pageTitle="Stylist Management" />

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Stylists
            </h3>
            <Button size="sm" variant="primary" onClick={openModalNew}>
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
            {stylists.length === 0 && (
              <div className="col-span-4 text-center text-gray-500">
                No stylists found.
              </div>
            )}
            {hasNextpage && (
              <div
                className="col-span-4 text-center text-blue-500 underline cursor-pointer"
                onClick={handleScroll}
              >
                Load more stylists
              </div>
            )}
          </div>
        </div>
        <CustomModal
          isOpen={isOpenNew}
          closeModal={closeModalNew}
          branches={branches}
          onSave={handleAddStylist}
        />
        <ViewModal
          isOpen={isOpenView}
          closeModal={closeModalView}
          stylist={selectedStylist}
        />
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        className={"z-999999"}
      />
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  stylist?: Stylist; // Optional prop to pass a service object for editing
  onSave?: (transaction: Stylist) => void; // Function to call when saving the service
  branches?: Branch[]; // Optional prop to pass a list of branches for the select input
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  stylist,
  branches = [],
  onSave = () => {},
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
    if (!validateData()) return;
    onSave(stylistData);
  };
  const validateData = () => {
    if (!stylistData.name) {
      toast.error("Please enter a name.");
      return false;
    }
    if (!stylistData.username) {
      toast.error("Please enter a username.");
      return false;
    }
    if (!stylistData.email || !/\S+@\S+\.\S+/.test(stylistData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!stylistData.password) {
      toast.error("Please enter a password.");
      return false;
    }
    if (!stylistData.branch) {
      toast.error("Please select a branch.");
      return false;
    }
    if (!stylistData.role) {
      toast.error("Please select a role.");
      return false;
    }
    if (
      stylistData.phoneNumber
        ? isNaN(Number(stylistData.phoneNumber)) &&
          stylistData.phoneNumber.length < 8
        : false
    ) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    return true;
  };
  useEffect(() => {
    setStylistData({
      _id: stylist?._id || "",
      name: stylist?.name || "",
      email: stylist?.email || "",
      username: stylist?.username || "",
      password: stylist?.password || "",
      role: stylist?.role || "Stylist",
      branch: stylist?.branch || branches[0]?._id || "",
      phoneNumber: stylist?.phoneNumber || "",
      profilePicture: stylist?.profilePicture || "/images/user/owner.jpg",
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
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
              onChange={(e) => {
                if (
                  !isNaN(Number(e.target.value)) &&
                  e.target.value.length <= 8
                ) {
                  setStylistData({
                    ...stylistData,
                    phoneNumber: e.target.value,
                  });
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
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
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
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
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
              >
                <option value="Stylist">Stylist</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 mb-2">
          <Button onClick={closeModal} size="sm" type="neutral">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
};
const ViewModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  stylist = {
    _id: "",
    name: "",
    username: "",
    role: "Stylist",
  },
}) => {
  const [activeTab, setActiveTab] = useState("Profile");
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[900px] p-0">
      <div className="flex h-[650px] ">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl pt-10">
          {["Profile", "Expertise", "Portfolio", "Testimonials"].map((tab) => (
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
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 ">
          {activeTab === "Profile" && <StylistProfilePage stylist={stylist} />}
          {activeTab === "Expertise" && <StylistExpertise stylist={stylist} />}
          {activeTab === "Testimonials" && (
            <StylistTestimonials stylist={stylist} />
          )}
          {activeTab === "Portfolio" && <PortfolioView stylist={stylist} />}
        </div>
      </div>
    </Modal>
  );
};
