import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Appointment = {
    id: string;
    name: string;
    date: string;
    time: string;
    service: string;
    remarks: string;
    image?: string;
    status: string;
};

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const { isOpen, openModal, closeModal } = useModal();
    const [status, setStatus] = useState<string>("Pending");

    const config = {
        headers: {
            Authorization: sessionStorage.getItem("token"),
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const stylistId = sessionStorage.getItem("userId");
        try {
            const res = await axios.get(`${api_address}/api/appointments/stylists/${stylistId}`, config);
            const mapped = res.data
                .filter((appt: any) => appt.status !== "Completed")
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
                        service: appt.service || "Service",
                        remarks: appt.request || "NIL",
                        image: appt.customer?.profilePicture || "/images/default-avatar.jpg",
                        status: appt.status || "Pending",
                    };
                });
                console.log("Mapped appointment:", mapped);

            setAppointments(mapped);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedAppt) return;
        if (!selectedAppt || !selectedAppt.id) {
            console.error("No appointment selected or missing ID");
            return;
        }
        
        try {
            await axios.put(`${api_address}/api/appointments/${selectedAppt.id}/status`, { status }, config);

            if (status === "Completed") {
                // Create transaction
                await axios.post(`${api_address}/api/transactions/from-appointment/${selectedAppt.id}`, {}, config);
            }
            console.log("Trying to update appt:", selectedAppt?.id);
            console.log("Endpoint:", `${api_address}/api/appointments/${selectedAppt?.id}/status`);
            
            closeModal();
            await fetchAppointments();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Appointments" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Upcoming Appointments</h4>

                {appointments.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You do not have any appointments.
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {appointments.map((appointment, index) => (
                        <div key={appointment.id || index} className="p-4 border rounded-lg shadow-sm flex flex-col items-center bg-white dark:bg-gray-800">
                            <img
                                src={appointment.image}
                                alt={appointment.name}
                                className="w-20 h-20 object-cover rounded-full border mb-2"
                            />
                            <h5 className="font-semibold text-md">{appointment.name}</h5>
                            <p className="text-sm text-gray-500">{appointment.date} - {appointment.time}</p>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                <strong>Status:</strong>
                            <p className="text-sm font-medium text-blue-600 mt-1">{appointment.status}</p>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                <strong>Service:</strong>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.service}</p>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                <strong>Remarks:</strong>
                                <p className="whitespace-pre-wrap">{appointment.remarks}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="primary"
                                className="mt-3 w-full"
                                onClick={() => {
                                    console.log("Clicked appointment:", appointment); // ADD THIS
                                    setSelectedAppt(appointment);
                                    setStatus(appointment.status);
                                    openModal();
                                }}
                            >
                                Manage
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
                {selectedAppt && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Manage Appointment</h4>
                        <div className="mb-3">
                            <p><strong>Name:</strong> {selectedAppt.name}</p>
                            <p><strong>Date:</strong> {selectedAppt.date}</p>
                            <p><strong>Time:</strong> {selectedAppt.time}</p>
                            <p><strong>Service:</strong> {selectedAppt.service}</p>
                            <p><strong>Remarks:</strong> {selectedAppt.remarks}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-sm">Update Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 rounded-md border dark:bg-gray-800 dark:text-white">Close</button>
                            <Button size="sm" variant="primary"
                                onClick={() => {
                                    if (!selectedAppt || !selectedAppt.id) {
                                        console.error("SelectedAppt not set when trying to Save.");
                                        return;
                                    }
                                    handleStatusChange();
                                }}>Save</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
