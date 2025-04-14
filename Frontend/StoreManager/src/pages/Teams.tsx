import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Alert from "../components/ui/alert/Alert";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useUser } from "../context/UserContext";
import { useModal } from "../hooks/useModal";
import StylistExpertise from "./Teams/stylistExpertise";
import PortfolioView from "./Teams/stylistPortfolio";
import StylistProfilePage from "./Teams/stylistProfilePage";
import StylistTestimonials from "./Teams/stylistTestimonials";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  rating?: number;
};

export default function Teams() {
  const user = useUser();
  if (user.role != "Manager") {
    return <Navigate to="/" />;
  }
  const { isOpen, openModal, closeModal } = useModal();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableStylists, setAvailableStylists] = useState<TeamMember[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [selectedStylist, setSelectedStylist] = useState<TeamMember | null>(
    null
  );
  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();
  const [activeTab, setActiveTab] = useState("Profile");

  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  useEffect(() => {
    console.log("📦 useEffect running");
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [teamRes, stylistRes] = await Promise.all([
          axios.get(`${api_address}/api/teams`, config),
          axios.get(`${api_address}/api/stylists`, config),
        ]);

        const teamList = teamRes.data || [];
        const stylistList = stylistRes.data || [];

        console.log("📦 Raw stylist list from backend:", stylistRes.data);

        setTeamMembers(teamList);

        // ❌ filter out stylists who are already in team
        const filteredStylists = stylistList.filter(
          (stylist: TeamMember) =>
            !teamList.some(
              (member: TeamMember) =>
                member._id.toString() === stylist._id.toString()
            )
        );

        setAvailableStylists(filteredStylists);

        console.log("availableStylists:", filteredStylists);
      } catch (error) {
        console.error("Error fetching data", error);
        setShowAlert(true);
        setVariant("error");
        setTitle("Error");
        setMessage("Failed to load team or stylists.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddStylist = async () => {
    try {
      const selectedStylist = availableStylists.find(
        (s) => s._id === selectedStylistId
      );
      if (!selectedStylist) return;

      const res = await axios.post(
        `${api_address}/api/teams`,
        { stylistId: selectedStylistId },
        config
      );
      setTeamMembers((prev) => [...prev, res.data]);
      setShowAlert(true);
      setVariant("success");
      setTitle("Success");
      setMessage("Stylist added to team.");
      closeModal();
    } catch (error) {
      console.error("Error adding stylist:", error);
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("Failed to add stylist.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-5">
        <PageMeta title="Team" description="Manage your team members" />
        <PageBreadcrumb pageTitle="Team" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              My Team
            </h3>
            <Button size="sm" variant="primary" onClick={openModal}>
              Add Team Member +
            </Button>
          </div>

          {showAlert && (
            <div className="mb-5">
              <Alert variant={variant} title={title} message={message} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="p-4 border rounded-lg shadow-sm flex flex-col items-center"
              >
                <img
                  src={member.profilePicture || "/images/default-avatar.jpg"}
                  alt={member.name}
                  className="w-24 h-24 object-cover rounded-full border"
                />
                <h5 className="font-semibold text-md mt-2 dark:text-white/90">
                  {member.name}
                </h5>
                <p className="text-sm text-gray-500">{member.role}</p>
                {member.rating && (
                  <p className="text-yellow-500">⭐ {member.rating}</p>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  className="mt-3 w-full"
                  onClick={() => {
                    setSelectedStylist(member);
                    setActiveTab("Profile");
                    openViewModal();
                  }}
                >
                  View More
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-6"
        >
          <div className="flex flex-col px-2 overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Add Existing Stylist
            </h4>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Select Stylist
            </label>
            <select
              value={selectedStylistId}
              onChange={(e) => setSelectedStylistId(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select a stylist</option>
              {availableStylists.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
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
              <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl pt-10">
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
