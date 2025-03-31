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
import TextArea from "../../components/form/input/TextArea";
import { set } from "date-fns";
import Radio from "../../components/form/input/Radio";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
type Service = {
  name: string;
  duration: number;
  description: string;
  promotion: string[];
  serviceRates: string[] | ServiceRate[];
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
  const [selectedServiceRate, setSelectedServiceRate] = useState<ServiceRate[]>(
    []
  );
  const {
    isOpen: isOpen1,
    openModal: openModal1,
    closeModal: closeModal1,
  } = useModal();
  const {
    isOpen: isOpen2,
    openModal: openModal2,
    closeModal: closeModal2,
  } = useModal();
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const fetchServices = async () => {
    await axios
      .get(`${api_address}/api/services?month=3&year=2025&day=3`, config)
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
      });
  };
  const fetchServiceRates = async (serviceId: string) => {
    await axios
      .get(`${api_address}/api/service-rates/${serviceId}`, config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error("Error fetching service rates:", error);
      });
  };
  useEffect(() => {
    fetchServices();
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
              openModal1();
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
                        openModal2();
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
        isOpen={isOpen1}
        closeModal={() => {
          closeModal1();
        }}
        onSave={() => {
          console.log("save service");
          closeModal1();
        }}
      />
      <CustomerModal
        isOpen={isOpen2}
        closeModal={() => {
          closeModal2();
        }}
        onSave={() => {
          console.log("save service");
          closeModal2();
        }}
        service={selectedService}
      />
    </>
  );
}
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  service?: Service; // Optional prop to pass a service object for editing
  serviceRates: ServiceRate[]; // Optional prop to pass service rates
  onSave: () => void; // Function to call when saving the service
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomerModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  service,
  serviceRates,
  onSave,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [serviceData, setServiceData] = useState<Service>({
    name: service ? service.name : "",
    duration: service ? service.duration : 0,
    description: service ? service.description : "",
    Promotion: service ? service.Promotion : [],
    ServiceRate: service ? service.ServiceRate : [],
    ExpertiseRequired: service ? service.ExpertiseRequired : [],
    _id: service ? service._id : "",
  });
  const [serviceRate, setServiceRate] = useState<ServiceRate[]>(
    service ? serviceRates : []
  );
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {service ? "Edit Service" : "Add Service"}
        </h4>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service Name
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
              Service Duration (in minutes)
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
                  setServiceData({
                    ...serviceData,
                    duration: parseInt(e.target.value),
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
              Service Description
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
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status
            </label>
            <select
              value={serviceData.ServiceRate}
              // onChange={(e) =>
              //   setServiceData({
              //     ...serviceData,
              //     ServiceRate: e.target.value,
              //   })
              // }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              {/* {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))} */}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Amount
            </label>
            {/* <input
              type="number"
              value={transactionData.amount}
              onChange={(e) =>
                setTransactionData({
                  ...transactionData,
                  amount: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            /> */}
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
          <Button size="sm" variant="primary" onClick={onSave}>
            {service ? "Update Transaction" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
