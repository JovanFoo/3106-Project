import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useUser } from "../../context/UserContext";
import { useModal } from "../../hooks/useModal";
import StylistExpertise from "../TeamUIPages/stylistExpertise";
import PortfolioView from "../TeamUIPages/stylistPortfolio";
import StylistProfilePage from "../TeamUIPages/stylistProfilePage";
import StylistTestimonials from "../TeamUIPages/stylistTestimonials";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  stylists?: string[];
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
  const [, setIsLoading] = useState<boolean>(false);

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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [teamRes, stylistRes] = await Promise.all([
          axios.get(`${api_address}/api/teams`, config),
          axios.get(`${api_address}/api/stylists`, config),
        ]);

        const teamList = teamRes.data || [];
        const stylistList = stylistRes.data || [];

        teamList.map((member: TeamMember) => {
          if (member.stylists) {
            member.role = member.stylists?.length > 0 ? "Manager" : "Stylist";
          } else {
            member.role = "Stylist";
          }
        });
        setTeamMembers(teamList);

        // ❌ filter out stylists who are already in team
        const filteredStylists = stylistList
          .filter(
            (stylist: TeamMember) =>
              !teamList.some(
                (member: TeamMember) =>
                  member._id.toString() === stylist._id.toString()
              )
          )
          .filter(
            (stylist: TeamMember) =>
              stylist._id.toString() !== user._id.toString()
          )
          .filter((x: TeamMember) =>
            x.stylists ? !(x.stylists.length > 0) : true
          ); // filter out stylists with no stylists
        setAvailableStylists(filteredStylists);
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error("Failed to load team or stylists.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user._id, teamMembers.length]);

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
      console.log("📦 Response from adding stylist:", res.data);
      setTeamMembers((prev) => [...prev, res.data]);
      toast.success("Stylist added to team.");
      closeModal();
    } catch (error) {
      closeModal();
      console.error("Error adding stylist:", error);
      toast.error("Failed to add stylist.");
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm flex flex-col items-center"
              >
                <img
                  src={member.profilePicture || "/images/user/owner.jpg"}
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a stylist</option>
              {availableStylists.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-6 mb-2">
              <Button onClick={closeModal} size="sm" type="neutral">
                Cancel
              </Button>
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
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        style={{ zIndex: 999999 }}
      />
    </div>
  );
}
