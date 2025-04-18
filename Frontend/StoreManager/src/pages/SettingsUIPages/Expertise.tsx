import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useUser } from "../../context/UserContext";
import { useModal } from "../../hooks/useModal";
import SettingsSidebar from "../SettingsPage/SettingsSidebar";
type Expertise = {
  _id: string;
  name: string;
  description: string;
};
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

export default function Expertise() {
  const [expertiseOptions, setExpertiseOptions] = useState<Array<Expertise>>(
    []
  );
  const [selectedExpertise, setSelectedExpertise] = useState<Array<Expertise>>(
    []
  );
  const user = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  
  const [isUpdating, setIsUpdating] = useState(false);

  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const toggleSelection = (expertise: Expertise) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((item) => item !== expertise)
        : [...prev, expertise]
    );
  };
  const onSaveChanges = async () => {
    closeModal();
    setIsUpdating(true);
    const updateExpertise = async () => {
      const selectedExpertiseIds = selectedExpertise.map((expertise) => {
        return expertise._id;
      });
      await axios
        .put(
          `${api_address}/api/stylists/expertises`,
          { expertises: selectedExpertiseIds },
          config
        )
        .then((res: AxiosResponse) => {
          user.fetchUserContext();
          toast.success("Expertise updated successfully");
          setIsUpdating(false);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          setIsUpdating(false);
        });
    };
    updateExpertise();

  };

  useEffect(() => {
    const fetchExpertise = async () => {
      await axios
        .get(`${api_address}/api/expertises`, config)
        .then((res: AxiosResponse) => {
          setExpertiseOptions(res.data);
          let userExpertises: string[] = user.expertises;
          let selectedExpertises: Expertise[] = [];
          let data: any[] = res.data;
          for (let i = 0; i < userExpertises.length; i++) {
            data.find((item: Expertise) => {
              if (item._id === userExpertises[i]) {
                selectedExpertises.push(item);
              }
            });
          }
          setSelectedExpertise(selectedExpertises);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchExpertise();
  }, [user]);

  return (
    <div className="flex">
      <SettingsSidebar />
      <div className="flex-1 p-5">
        <PageBreadcrumb pageTitle="Expertise" />
        <div className="rounded-2xl  min-h-[80vh] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Expertise
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Select your areas of expertise below.
          </p>
          <div className="flex flex-wrap gap-3">
            {selectedExpertise.map((expertise) => (
              <span
                key={selectedExpertise.indexOf(expertise)}
                className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-md"
              >
                {expertise.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-6 lg:justify-end">
            <Button size="sm" onClick={openModal} disabled={isUpdating}>
              Edit
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <div className="flex flex-col px-2 overflow-y-auto">
          <h4 className="text-lg font-semibold mb-4 dark:text-white">
            Edit Expertise
          </h4>
          <div className="flex flex-wrap gap-3">
            {expertiseOptions &&
              expertiseOptions.map((expertise: Expertise) => (
                <button
                  key={expertiseOptions.indexOf(expertise)}
                  onClick={() => toggleSelection(expertise)}
                  className={`px-4 py-2 rounded-full text-sm font-medium shadow-md transition ${
                    selectedExpertise.includes(expertise)
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 dark:bg-gray-700 dark:text-white border border-gray-300"
                  }`}
                >
                  {expertise.name}
                </button>
              ))}
          </div>
          <div className="flex items-center gap-3 mt-6 mb-2 sm:justify-end">
            <Button onClick={closeModal} size="sm" type='neutral'>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={onSaveChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      <ToastContainer position="bottom-right" autoClose={3000} style={{ zIndex: 999999 }} />
    </div>
  );
}
