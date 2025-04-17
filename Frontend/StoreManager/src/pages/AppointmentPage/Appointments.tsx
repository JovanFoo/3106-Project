import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Appointment = {
  id: string;
  name: string;
  date: string;
  time: string;
  service: string; // holds serviceId
  serviceName: string; // name for display
  request: string;
  profilePicture?: string;
  status: string;
};

type ServiceOption = {
  _id: string;
  name: string;
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [updatedAppt, setUpdatedAppt] = useState<Appointment | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [status, setStatus] = useState<string>("Pending");
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [datetime, setDatetime] = useState<string>("");
  
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  useEffect(() => {
    fetchAppointments();
    fetchServiceOptions();
  }, []);

  const fetchAppointments = async () => {
    const stylistId = sessionStorage.getItem("userId");
    try {
      const res = await axios.get(
        `${api_address}/api/appointments/stylists/${stylistId}`,
        config
      );
      // console.log("Fetched appointments raw:", res.data);

      const mapped = res.data
        .filter((appt: any) => appt.status !== "Completed")
        .filter((appt: any) => appt.status !== "Cancelled")
        .map((appt: any) => {
          const dateObj = new Date(appt.date);
          const formattedDate = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          return {
            id: appt.id,
            name: appt.customer?.name || "Customer",
            date: formattedDate,
            time: formattedTime,
            service: appt.service?._id || "", // ID for backend
            serviceName: appt.service?.name || "Service", // name for display
            request: appt.request || "NIL",
            profilePicture:
              appt.customer?.profilePicture || "/images/user/owner.jpg",
            status: appt.status || "Pending",
          };
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.date} ${a.time}`).getTime();
          const dateB = new Date(`${b.date} ${b.time}`).getTime();
          return dateA - dateB;
        });
      // console.log("Mapped appointment:", mapped);

      setAppointments(mapped);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchServiceOptions = async () => {
    try {
      const res = await axios.get(`${api_address}/api/services/all`, config);
      setServiceOptions(res.data);
    } catch (err) {
      console.error("Error fetching service options:", err);
    }
  };

  const handleSaveChanges = async () => {
    if (!updatedAppt || !updatedAppt.id) {
      console.error("No appointment selected or missing ID");
      return;
    }

    try {
      await axios.put(
        `${api_address}/api/appointments/${updatedAppt.id}/update`,
        {
          serviceId: updatedAppt.service,
          request: updatedAppt.request,
          status,
          date: new Date(datetime),
        },
        config
      );

      if (status === "Completed") {
        await axios.post(
          `${api_address}/api/transactions/from-appointment/${updatedAppt.id}`,
          {},
          config
        );
      }

      toast.success("Appointment updated successfully");
      
      closeModal();
      await fetchAppointments();
    } catch (err) {
      console.error("Error saving changes:", err);
      closeModal();

      toast.error("Failed to update appointment");

    }
  };

  return (
    <div className="flex">
      <div className="flex-1 p-5">
        <PageMeta title="Appointments" description="Manage your Appointments" />
        <PageBreadcrumb pageTitle="Upcoming Appointments" />
        
        <div className="flex rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          {/* <div className="flex justify-between items-center mb-6"> */}
          {appointments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You do not have any appointments.
            </p>
          )}

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-2 overflow-auto">
            {appointments.map((appointment, index) => (
              <div
                key={appointment.id || index}
                className="col-span-1 p-4 border rounded-lg shadow-sm flex flex-col items-center bg-white dark:bg-gray-800"
              >
                <img
                  src={appointment.profilePicture}
                  alt={appointment.name}
                  className="w-20 h-20 object-cover rounded-full border mb-2"
                />
                <h5 className="font-semibold text-md">{appointment.name}</h5>
                <p className="text-sm text-gray-500">
                  {appointment.date} - {appointment.time}
                </p>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <strong>Status:</strong>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    {appointment.status}
                  </p>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <strong>Service:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.serviceName}
                  </p>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <strong>Remarks:</strong>
                  <p className="whitespace-pre-wrap">{appointment.request}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="mt-3 w-full"
                  onClick={() => {
                    setSelectedAppt(appointment);
                    setUpdatedAppt(appointment);
                    setStatus(appointment.status);

                    // Construct ISO string
                    const originalDate = new Date(
                      `${appointment.date} ${appointment.time}`
                    );
                    const localISO = new Date(
                      originalDate.getTime() -
                        originalDate.getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16); // yyyy-MM-ddTHH:mm
                    setDatetime(localISO);

                    openModal();
                  }}
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>

          <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
            {updatedAppt && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                  Manage Appointment
                </h4>
                <div className="mb-3 space-y-2">
                  <label className="block text-sm font-medium dark:text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    value={updatedAppt.name}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <label className="block text-sm font-medium dark:text-white">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={datetime}
                    disabled
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <label className="block text-sm font-medium dark:text-white">
                    Service
                  </label>
                  <select
                    value={updatedAppt.service}
                    disabled
                    // onChange={(e) =>
                    //   setUpdatedAppt((prev) =>
                    //     prev ? { ...prev, service: e.target.value } : null
                    //   )
                    // }
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a service</option>
                    {serviceOptions.map((svc) => (
                      <option key={svc._id} value={svc._id}>
                        {svc.name}
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm font-medium dark:text-white">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={updatedAppt.request}
                    onChange={(e) =>
                      setUpdatedAppt((prev) =>
                        prev ? { ...prev, request: e.target.value } : null
                      )
                    }
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />

                  <label className="block text-sm font-medium dark:text-white">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={
                      updatedAppt.status === "Completed" ||
                      updatedAppt.status === "Cancelled"
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button onClick={closeModal} size="sm" type="neutral">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveChanges}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </Modal>
          {/* </div> */}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} style={{ zIndex: 999999 }} />
    </div>
  );
}
