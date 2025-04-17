import { TableBody } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon } from "../../icons";
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning">("info");

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
  const {
    isOpen: isOpenDelete,
    openModal: openModalDelete,
    closeModal: closeModalDelete,
  } = useModal();
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };
  // For pagination
  const [pageSizeOptions] = useState([5, 10, 20, 50]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[1]); // Default to 10
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalService, setTotalService] = useState(0);

  const fetchServices = async () => {
    await axios
      .get(
        `${api_address}/api/services/paginated/true?page=${pageNumber}&limit=${pageSize}`,
        config
      )
      .then((response) => {
        console.log("Services:", response.data);
        setTotalPages(response.data.totalPages);
        setTotalService(response.data.total);
        setHasNextPage(response.data.hasNextPage);
        setServices(response.data.services);
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
        setAlertTitle("Success");
        setAlertMessage("Service updated successfully.");
        setAlertType("success");
      })
      .catch((error) => {
        console.error("Error updating service:", error);
        setAlertTitle("Error");
        setAlertMessage("Failed to update service.");
        setAlertType("error");
      });
    closeModalEdit();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
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
        setAlertTitle("Success");
        setAlertMessage("Service created successfully.");
        setAlertType("success");
      })
      .catch((error) => {
        console.error("Error saving service:", error);
        setAlertTitle("Error");
        setAlertMessage("Failed to create service.");
        setAlertType("error");
      });
    closeModalNew();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };
  const handleDelete = async (service: Service) => {
    // Perform delete operation here
    axios
      .delete(`${api_address}/api/services/${service._id}`, config)
      .then((response) => {
        console.log("Service deleted successfully:", response.data);
        fetchServices(); // Refresh the services list after deleting
        setAlertTitle("Success");
        setAlertMessage("Service deleted successfully.");
        setAlertType("success");
      })
      .catch((error) => {
        console.error("Error deleting service:", error);
        setAlertTitle("Error");
        setAlertMessage("Failed to delete service.");
        setAlertType("error");
      });
    closeModalDelete();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };
  useEffect(() => {
    fetchServices();
    fetchServiceRates();
  }, []);
  useEffect(() => {
    fetchServices();
  }, [pageNumber, pageSize]);
  const handleNext = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };
  const handlePrev = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1); // Reset to first page on page size change
  };
  return (
    <>
      <div className="flex min-h-screen">
        <div className="flex-1 p-5">
          <PageBreadcrumb pageTitle="Services" />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Manage Services
          </h4>
              <Button
                variant="primary"
                type="info"
                onClick={() => {
                  openModalNew();
                }}
              >
                + Add new service
              </Button>
            </div>

            {showAlert && (
              <div className="mb-4">
                <Alert
                  variant={alertType}
                  title={alertTitle}
                  message={alertMessage}
                />
              </div>
            )}

            <Table className="min-w-full">
              <TableHeader className="bg-gray-50 border-b-2 border-gray-200">
                <TableRow isHeader={true}>
                  <TableCell isHeader={true}>#</TableCell>
                  <TableCell isHeader={true}>Service Name</TableCell>
                  <TableCell isHeader={true}>Duration</TableCell>
                  <TableCell isHeader={true}>Description</TableCell>
                  <TableCell isHeader={true}>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services &&
                  services.map((service, index) => (
                    <TableRow key={service._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.duration}</TableCell>
                      <TableCell>
                        {service.description.length > 50
                          ? service.description.substring(0, 80) + " ..."
                          : service.description}
                      </TableCell>
                      {/* <TableCell className="justify-around flex gap-2"> */}
                      <div className="flex gap-2 justify-center mt-2 mb-2">
                        <Button
                          variant="primary"
                          type="warning"
                          onClick={() => {
                            setSelectedService(service);
                            openModalEdit();
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="primary"
                          type="danger"
                          onClick={() => {
                            setSelectedService(service);
                            openModalDelete();
                          }}
                        >
                          <TrashBinIcon />
                        </Button>
                      </div>
                      {/* </TableCell> */}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2 items-center">
                <span className="text-gray-700 dark:text-gray-400 mt-4">
                  Page {pageNumber} of {totalPages}
                </span>
                <span className="text-gray-700 dark:text-gray-400 mt-4 ml-2">
                  Showing {services.length} of {totalService} transactions
                </span>
                <span className="text-gray-700 dark:text-gray-400 mt-4 ">
                  Page Size:
                </span>
                {pageSizeOptions.map((size) => (
                  <span
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`text-gray-700 dark:text-gray-400 mt-4 cursor-pointer hover:text-blue-500 ${pageSize === size
                        ? "font-bold text-black dark:text-white"
                        : ""
                      }`}
                  >
                    {size}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-4 ml-2 items-center">
                <Button
                  onClick={handlePrev}
                  variant="primary"
                  type="info"
                  disabled={pageNumber === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  type="info"
                  disabled={pageNumber === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
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

          <DeleteModal
            isOpen={isOpenDelete}
            closeModal={() => {
              closeModalDelete();
            }}
            onDelete={handleDelete}
            service={selectedService}
          />
        </div>
      </div>
    </>
  );
}
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  service?: Service; // Optional prop to pass a service object for editing
  totalListOfServiceRates?: ServiceRate[]; // List of all service rates
  onSave?: (service: Service) => void; // Function to call when saving the service
  onDelete?: (serviceRate: Service) => void; // Function to call when deleting a service rate
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomerModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  service,
  totalListOfServiceRates = [],
  onSave = () => { },
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 ">
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
              className="w-full mb-3 border rounded-md h-8 dark:bg-gray-700 dark:border-gray-600 font-extralight dark:text-gray-200"
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
                        className="flex items-center gap-2 dark:text-gray-200"
                        id={`#serviceRate-${x._id}`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 "
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

        <div className="flex items-center gap-3 mt-6 mb-2 sm:justify-end">
          <Button
            onClick={closeModal}
            type="neutral"
            size="sm"
          >
            Cancel
          </Button>
          <Button size="sm" type="info" onClick={handleSave}>
            {service ? "Update Transaction" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DeleteModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  service,
  onDelete = () => { },
}) => {
  const handleDelete = () => {
    if (service?.name === serviceName) {
      onDelete(service);
    } else {
      setShowAlert(true);
      setAlertTitle("Error");
      setAlertMessage("Service name does not match.");
      setAlertType("error");
      return;
    }
  };
  const [serviceName, setServiceName] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Delete Service{" "}
        </h4>
        <p className="dark:text-white">
          Are you sure you want to delete this service?
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          Type the service name (
          <b className="text-black dark:text-white">{service?.name}</b>) to
          confirm:
        </p>

        <input
          type="text"
          value={serviceName}
          onChange={(e) => {
            setServiceName(e.target.value);
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
        <div className="flex items-center gap-3 mt-6 mb-2 sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            type='neutral'
            onClick={closeModal}
            className="bg-gray-500"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="outline"
            type='danger'
            className="bg-red-500"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
