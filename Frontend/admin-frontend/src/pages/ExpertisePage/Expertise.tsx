import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Expertise = {
  _id: string;
  name: string;
  description: string;
  active: boolean;
};

export default function Expertise() {
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise>();
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const {
    isOpen: isOpenNew,
    openModal: openModalNew,
    closeModal: closeModalNew,
  } = useModal();
  const {
    isOpen: isOpenDelete,
    openModal: openModalDelete,
    closeModal: closeModalDelete,
  } = useModal();
  const {
    isOpen: isOpenEdit,
    openModal: openModalEdit,
    closeModal: closeModalEdit,
  } = useModal();
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  const fetchExpertises = async () => {
    try {
      const res = await axios.get(`${api_address}/api/expertises`, config);
      setExpertises(res.data);
    } catch (err) {
      console.error(err);
      setVariant("error");
      setTitle("Error");
      setMessage("Failed to fetch expertises");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchExpertises();
    }
  }, [isLoading]);

  const createExpertise = async (expertise: Expertise) => {
    try {
      closeModalNew();
      setVariant("info");
      setTitle("Creating Expertises");
      setMessage("Creating Expertises");
      setShowAlert(true);
      setIsLoading(true);
      await axios.post(
        `${api_address}/api/expertises`,
        {
          name: expertise.name,
          description: expertise.description,
        },
        config
      );
      setNewName("");
      setExpertises([
        ...expertises,
        {
          name: newName,
          description: newDescription,
          active: true,
          _id: "",
        },
      ]);
      setVariant("success");
      setTitle("Success");
      setMessage("Expertise added successfully");
      setShowAlert(true);
    } catch (err) {
      console.error(err);
      setVariant("error");
      setTitle("Error");
      setMessage("Failed to add expertise");
      setShowAlert(true);
    }
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
    setIsLoading(false);
  };

  const deleteExpertise = async (expertise: Expertise) => {
    try {
      closeModalDelete();
      setIsLoading(true);
      setVariant("info");
      setTitle("Deleting an expertise");
      setMessage("Deleting an expertise");
      setShowAlert(true);
      fetchExpertises();
      await axios.delete(
        `${api_address}/api/expertises/${expertise._id}`,
        config
      );
      setExpertises(expertises.filter((x) => x._id != expertise._id));
      setVariant("success");
      setTitle("Success");
      setMessage("Deleted an expertise");
      setShowAlert(true);
      fetchExpertises();
    } catch (err) {
      setVariant("error");
      setTitle("Error");
      setMessage("Failed to delete expertise");
      setShowAlert(true);
      console.error(err);
    }
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
    setIsLoading(false);
  };

  const updateExpertise = async (expertise: Expertise) => {
    try {
      closeModalEdit();
      setVariant("info");
      setTitle("Updating expertise");
      setMessage("Updating expertise");
      setShowAlert(true);
      setIsLoading(true);
      await axios.put(
        `${api_address}/api/expertises/${expertise._id}`,
        {
          name: expertise.name,
          description: expertise.description,
        },
        config
      );
      setExpertises(
        expertises.map((x) =>
          x._id == expertise._id ? { ...x, ...expertise } : x
        )
      );
      setVariant("success");
      setTitle("Success");
      setMessage("Updated expertise successfully");
      setShowAlert(true);
    } catch (err) {
      console.error(err);
      setVariant("error");
      setTitle("Error");
      setMessage("Failed to update expertise");
      setShowAlert(true);
    }
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
    setIsLoading(false);
  };
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-5">
        <PageMeta title="Expertise" description="Manage Expertises" />
        <PageBreadcrumb pageTitle="Expertise" />

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Manage Expertise Tags
            </h4>
            <Button size="sm" variant="primary" onClick={openModalNew}>
              Add Expertise +
            </Button>
          </div>

          {showAlert && (
            <div className="mb-5">
              <Alert variant={variant} title={title} message={message} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {expertises.map((exp: Expertise) => (
              <div
                key={exp._id}
                className="p-4 border rounded-lg shadow-sm flex flex-col gap-2"
              >
                <p className="font-semibold text-md dark:text-white/90">
                  {exp.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {exp.description}
                  </span>
                </div>
                <div className=" grid-flow-row grid grid-cols-2 gap-1 ">
                  <Button
                    size="sm"
                    variant="primary"
                    type="warning"
                    disabled={exp._id == ""}
                    onClick={() => {
                      setSelectedExpertise(exp);
                      openModalEdit();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    type="danger"
                    disabled={exp._id == ""}
                    onClick={() => {
                      setSelectedExpertise(exp);
                      openModalDelete();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CustomerModal
          isOpen={isOpenNew}
          closeModal={closeModalNew}
          onSave={createExpertise}
        />
        <CustomerModal
          isOpen={isOpenEdit}
          closeModal={closeModalEdit}
          expertise={selectedExpertise}
          onSave={updateExpertise}
        />

        <DeleteModal
          isOpen={isOpenDelete}
          closeModal={closeModalDelete}
          onDelete={deleteExpertise}
          expertise={selectedExpertise}
        />
      </div>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  expertise?: Expertise; // Optional prop to pass a expertise object for editing
  onSave?: (expertise: Expertise) => void; // Function to call when saving the expertise
  onDelete?: (expertise: Expertise) => void; // Function to call when deleting the expertise
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomerModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  expertise,
  onSave = () => {},
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [expertiseData, setExpertiseData] = useState<Expertise>({
    _id: "",
    name: "",
    description: "",
    active: true,
  });
  const handleSave = () => {
    // Call the onSave function with the serviceRateData
    onSave(expertiseData);
  };
  useEffect(() => {
    setExpertiseData({
      name: expertise ? expertise.name : "",
      description: expertise ? expertise.description : "",
      _id: expertise ? expertise._id : "",
      active: true,
    });
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {expertise ? "Edit Expertise" : "Add New Expertise"}
        </h4>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
          Expertise Name
        </label>
        <input
          type="text"
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="e.g. Haircut, Digital Perms"
          value={expertiseData.name}
          onChange={(e) =>
            setExpertiseData({
              ...expertiseData,
              name: e.target.value,
            })
          }
        />
        <br />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
          Expertise Description
        </label>
        <input
          type="text"
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="e.g. Haircut nice and amazing hairhut"
          value={expertiseData.description}
          onChange={(e) =>
            setExpertiseData({
              ...expertiseData,
              description: e.target.value,
            })
          }
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={closeModal} size="sm" type="neutral">
            Cancel
          </Button>
          <Button
            size="sm"
            type={expertise ? "warning" : "info"}
            onClick={() => handleSave()}
          >
            {expertise ? "Update Expertise" : "Create Expertise"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
const DeleteModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  expertise,
  onDelete = () => {},
}) => {
  const handleDelete = () => {
    if (expertise?.name === expertiseName) {
      onDelete(expertise);
    } else {
      setShowAlert(true);
      setAlertTitle("Error");
      setAlertMessage("Service rate name does not match.");
      setAlertType("error");
      return;
    }
  };
  const [expertiseName, setExpertiseName] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Delete Service Rate
        </h4>
        <p className="dark:text-white">
          Are you sure you want to delete this service rate?
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          {`Type the service rate name (${expertise?.name}) to confirm:`}
        </p>

        <input
          type="text"
          value={expertiseName}
          onChange={(e) => {
            setExpertiseName(e.target.value);
          }}
          className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <div className={showAlert ? "mt-4" : "hidden"}>
          <Alert
            variant={alertType}
            title={alertTitle}
            message={alertMessage}
          />
        </div>
        <div className="flex items-center gap-3 mt-6 mb-1 sm:justify-end">
          <Button onClick={closeModal} type="info">
            Cancel
          </Button>
          <Button  type="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
