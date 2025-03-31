import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axios from "axios";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { NativeSelect } from "@mui/material";
import Alert from "../../components/ui/alert/Alert";
import { set } from "date-fns";
// import MultiSelect from "../../components/form/MultiSelect";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
type Service = {
  name: string;
  duration: number;
  description: string;
  serviceRates: ServiceRate[];
  expertiseRequired: string[];
  _id: string;
};
type ServiceRate = {
  _id: string;
  name: String;
  rate: Number;
  startDate: Date;
  endDate: Date;
};
export default function Services() {
  // UseStates for Services
  const [services, setServices] = useState<Service[]>([]);
  const [allServiceRates, setAllServiceRates] = useState<ServiceRate[]>([]);

  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const {
    isOpen: isOpenNew,
    openModal: openModalNew,
    closeModal: closeModalNew,
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
  const fetchServices = async () => {
    await axios
      .get(`${api_address}/api/services/all`, config)
      .then((response) => {
        setServices(response.data);
        console.log("Services:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
      });
  };
  const fetchServiceRates = async () => {
    await axios
      .get(`${api_address}/api/service-rates`, config)
      .then((response) => {
        setAllServiceRates(response.data);
        console.log("Service Rates:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching service rates:", error);
      });
  };
  const handleSave = async (service: Service) => {
    axios
      .put(
        `${api_address}/api/services/${service._id}`,
        {
          name: service.name,
          duration: service.duration,
          description: service.description,
          serviceRates: service.serviceRates,
          expertiseRequired: service.expertiseRequired,
        },
        config
      )
      .then((response) => {
        console.log("Service updated successfully:", response.data);
        fetchServices(); // Refresh the services list after saving
      })
      .catch((error) => {
        console.error("Error updating service:", error);
      });
    closeModalEdit();
  };
  const handleAdd = async (service: Service) => {
    // Perform edit operation hereawait axios
    axios
      .post(
        `${api_address}/api/services/`,
        {
          name: service.name,
          duration: service.duration,
          description: service.description,
          serviceRates: service.serviceRates,
          expertiseRequired: service.expertiseRequired,
        },
        config
      )
      .then((response) => {
        console.log("Service saved successfully:", response.data);
        fetchServices(); // Refresh the services list after saving
      })
      .catch((error) => {
        console.error("Error saving service:", error);
      });
    closeModalNew();
  };
  useEffect(() => {
    fetchServices();
    fetchServiceRates();
  }, []);
  return (
    <>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Services" />
      <div className="space-y-6">
        <div>
          <Button
            onClick={() => {
              console.log("add");
              openModalNew();
            }}
          >
            + Add new service
          </Button>
        </div>
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50 border-b-2 border-gray-200">
            <TableRow className="bg-gray-50">
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Service ID
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Service Name
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Duration
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Description
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Actions
              </TableCell>
            </TableRow>
            {services &&
              services.map((service, index) => (
                <TableRow key={service._id} className="bg-white border-b">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {service.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {service.duration}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {service.description.length > 50
                      ? service.description.substring(0, 80) + " ..."
                      : service.description}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2 justify-between  flex">
                    <Button
                      variant="outline"
                      className="bg-yellow-500"
                      onClick={() => {
                        console.log("edit Service");
                        setSelectedService(service);
                        openModalEdit();
                      }}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-500"
                      onClick={() => {
                        console.log("disable Service");
                      }}
                    >
                      <TrashBinIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableHeader>
        </Table>
      </div>
      <CustomerModal
        isOpen={isOpenNew}
        closeModal={() => {
          closeModalNew();
        }}
        totalListOfServiceRates={allServiceRates}
        onSave={handleAdd}
      />
      <CustomerModal
        isOpen={isOpenEdit}
        closeModal={() => {
          closeModalEdit();
        }}
        totalListOfServiceRates={allServiceRates}
        onSave={handleSave}
        service={selectedService}
      />
    </>
  );
}
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  service?: Service; // Optional prop to pass a service object for editing
  totalListOfServiceRates: ServiceRate[]; // List of all service rates
  onSave: (service: Service) => void; // Function to call when saving the service
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomerModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  service,
  totalListOfServiceRates,
  onSave,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [serviceData, setServiceData] = useState<Service>({
    name: "",
    duration: 0,
    description: "",
    serviceRates: [],
    expertiseRequired: [],
    _id: "",
  });
  const handleSave = () => {
    if (
      !serviceData.name ||
      !serviceData.duration ||
      !serviceData.description
    ) {
      setShowAlert(true);
      setTitle("Error");
      setMessage("Please fill in all the required fields.");
      setVariant("error");
      setTimeout(() => {
        setShowAlert(false);
        setTitle("");
        setMessage("");
        setVariant("info");
      }, 4000);
      return;
    }
    // Perform save operation here
    onSave(serviceData);
  };
  const [showAlert, setShowAlert] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [variant, setVariant] = useState<"info" | "error" | "success">("info");
  const [filteredText, setFilteredText] = useState<string>("");
  useEffect(() => {
    setServiceData({
      name: service ? service.name : "",
      duration: service ? service.duration : 0,
      description: service ? service.description : "",
      serviceRates: service ? service.serviceRates : [],
      expertiseRequired: service ? service.expertiseRequired : [],
      _id: service ? service._id : "",
    });
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {service ? "Edit Service" : "Add Service"}
        </h4>
        <div className={showAlert ? " mt-2" : "hidden"}>
          <Alert variant={variant} title={title} message={message} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service Name*
            </label>
            <input
              type="text"
              value={serviceData.name}
              onChange={(e) => {
                setServiceData({
                  ...serviceData,
                  name: e.target.value,
                });
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service Duration (in minutes)*
            </label>
            <input
              type="number"
              step={15}
              min={0}
              value={serviceData.duration}
              onChange={(e) => {
                if (
                  !isNaN(parseInt(e.target.value)) &&
                  e.target.value !== "" &&
                  parseInt(e.target.value) >= 0
                ) {
                  const x = parseInt(e.target.value);
                  setServiceData({
                    ...serviceData,
                    duration: x,
                  });
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service Description*
            </label>
            <textarea
              value={serviceData.description}
              onChange={(e) => {
                setServiceData({
                  ...serviceData,
                  description: e.target.value,
                });
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={5}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service Rates
            </label>
            <input
              type="text"
              className="w-full mb-3 border rounded-md h-8 dark:bg-gray-700 dark:border-gray-600 font-extralight"
              onKeyUp={(e) => {
                setFilteredText((e.target as HTMLInputElement).value);
              }}
            />
            <div className="w-full min-h-40 max-h-40 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 overflow-auto">
              {totalListOfServiceRates.length === 0 && (
                <div className="text-gray-500">No Service Rates available</div>
              )}
              {totalListOfServiceRates.length > 0 &&
                totalListOfServiceRates
                  .sort((x, y) => x.name.localeCompare(y.name.toString()))
                  .filter((x) =>
                    x.name.toLowerCase().includes(filteredText.toLowerCase())
                  )
                  .map((x: ServiceRate) => {
                    return (
                      <div
                        key={x._id}
                        className="flex items-center gap-2"
                        id={`#serviceRate-${x._id}`}
                      >
                        <input
                          type="checkbox"
                          checked={serviceData.serviceRates.some(
                            (sr) => sr._id === x._id
                          )}
                          onChange={(e) => {
                            const updatedServiceRates = e.target.checked
                              ? [...serviceData.serviceRates, x]
                              : serviceData.serviceRates.filter(
                                  (sr) => sr._id !== x._id
                                );
                            setServiceData({
                              ...serviceData,
                              serviceRates: updatedServiceRates,
                            });
                          }}
                        />
                        <span>{x.name}</span>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Close
          </button>
          <Button size="sm" variant="primary" onClick={handleSave}>
            {service ? "Update Transaction" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
