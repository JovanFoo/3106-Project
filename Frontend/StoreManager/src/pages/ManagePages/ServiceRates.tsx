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
import { TableBody } from "@mui/material";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type ServiceRate = {
  _id: string;
  name: string;
  rate: number;
  startDate: Date;
  endDate: Date;
};
export default function Services() {
  // UseStates for Services
  const [serviceRates, setServiceRates] = useState<ServiceRate[]>([]);

  const [selectedServiceRate, setSelectedServiceRate] = useState<ServiceRate>();
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
  const fetchServiceRates = async () => {
    console.log("Fetching service rates...");
    await axios
      .get(`${api_address}/api/service-rates`, config)
      .then((response) => {
        setServiceRates(response.data);
        console.log("Service Rates:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching service rates:", error);
      });
  };
  const handleAddServiceRate = async (serviceRate: ServiceRate) => {
    await axios
      .post(`${api_address}/api/service-rates`, serviceRate, config)
      .then((response) => {
        console.log("Service rate saved:", response.data);
        closeModalNew(); // Close the modal after saving
        fetchServiceRates(); // Refresh the list after saving
      })
      .catch((error) => {
        console.error("Error saving service rate:", error);
      });
  };
  const handleEditServiceRate = async (serviceRate: ServiceRate) => {
    await axios
      .put(
        `${api_address}/api/service-rates/${serviceRate._id}`,
        serviceRate,
        config
      )
      .then((response) => {
        console.log("Service rate updated:", response.data);
        closeModalEdit(); // Close the modal after saving
        fetchServiceRates(); // Refresh the list after saving
      })
      .catch((error) => {
        console.error("Error updating service rate:", error);
      });
  };
  const handleDeleteServiceRate = async (serviceRate: ServiceRate) => {
    await axios
      .delete(`${api_address}/api/service-rates/${serviceRate._id}`, config)
      .then((response) => {
        console.log("Service rate deleted:", response.data);
        fetchServiceRates(); // Refresh the list after deleting
      })
      .catch((error) => {
        console.error("Error deleting service rate:", error);
      });
  };
  useEffect(() => {
    fetchServiceRates();
  }, []);
  return (
    <>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Service rates" />
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
                Service rate ID
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Service rate Name
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Service rate Amount
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Service rate Start Date
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Service rate End Date
              </TableCell>
              <TableCell
                isHeader={true}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border p-2"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceRates &&
              serviceRates.map((serviceRate: ServiceRate, index) => (
                <TableRow key={serviceRate._id} className="bg-white border-b">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {serviceRate.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {serviceRate.rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {new Date(serviceRate.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2">
                    {new Date(serviceRate.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border p-2 justify-between  flex">
                    <Button
                      variant="outline"
                      className="bg-yellow-500"
                      onClick={() => {
                        console.log("edit Service");
                        setSelectedServiceRate(serviceRate);
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
                        handleDeleteServiceRate(serviceRate);
                      }}
                    >
                      <TrashBinIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <CustomerModal
        isOpen={isOpenNew}
        closeModal={() => {
          closeModalNew();
        }}
        onSave={handleAddServiceRate}
      />
      <CustomerModal
        isOpen={isOpenEdit}
        closeModal={() => {
          closeModalEdit();
        }}
        onSave={handleEditServiceRate}
        serviceRate={selectedServiceRate}
      />
    </>
  );
}
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  serviceRate?: ServiceRate; // Optional prop to pass a service object for editing
  onSave: (serviceRate: ServiceRate) => void; // Function to call when saving the service
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomerModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  serviceRate,
  onSave,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [serviceRateData, setServiceRateData] = useState<ServiceRate>({
    _id: "",
    name: "",
    rate: 0,
    startDate: new Date(),
    endDate: new Date(),
  });
  const handleSave = () => {
    // Call the onSave function with the serviceRateData
    onSave(serviceRateData);
  };
  useEffect(() => {
    setServiceRateData({
      name: serviceRate ? serviceRate.name : "",
      rate: serviceRate ? serviceRate.rate : 0,
      startDate: serviceRate ? new Date(serviceRate.startDate) : new Date(),
      endDate: serviceRate ? new Date(serviceRate.endDate) : new Date(),
      _id: serviceRate ? serviceRate._id : "",
    });
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {serviceRate ? "Edit Service Rate" : "Add Service Rate"}
        </h4>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service Name
            </label>
            <input
              type="text"
              value={serviceRateData.name}
              onChange={(e) => {
                setServiceRateData({
                  ...serviceRateData,
                  name: e.target.value,
                });
              }}
              className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service rate
            </label>
            <input
              type="text"
              value={serviceRateData.rate}
              onChange={(e) => {
                if (!isNaN(parseFloat(e.target.value))) {
                  setServiceRateData({
                    ...serviceRateData,
                    rate: parseFloat(e.target.value),
                  });
                }
              }}
              className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Start Date
            </label>
            <input
              id="event-start-date"
              type="datetime-local"
              value={serviceRateData.startDate.toISOString().substring(0, 16)}
              // value={eventStartDate?.toISOString().substring(0, 16) || ""}
              // value="2020-03-12T12:12"
              onChange={(e) => {
                try {
                  const date: Date = new Date(
                    new Date(e.target.value).setHours(
                      new Date(e.target.value).getHours() + 8
                    )
                  );
                  setServiceRateData({
                    ...serviceRateData,
                    startDate: date,
                  });
                } catch (error) {
                  console.log(error);
                }
              }}
              className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              End Date
            </label>
            <input
              id="event-start-date"
              type="datetime-local"
              value={serviceRateData.endDate.toISOString().substring(0, 16)}
              // value={eventStartDate?.toISOString().substring(0, 16) || ""}
              // value="2020-03-12T12:12"
              onChange={(e) => {
                try {
                  const date: Date = new Date(
                    new Date(e.target.value).setHours(
                      new Date(e.target.value).getHours() + 8
                    )
                  );
                  setServiceRateData({
                    ...serviceRateData,
                    endDate: date,
                  });
                } catch (error) {
                  console.log(error);
                }
              }}
              className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
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
            {serviceRate ? "Update Transaction" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
