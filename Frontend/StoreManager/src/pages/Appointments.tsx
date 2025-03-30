import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

const config = {
    headers: {
        Authorization: sessionStorage.getItem("token"),
    }
};

interface Appointment {
    id: string;
    name: string;
    date: string;
    time: string;
    service: string;
    remarks: string;
    image?: string;
}

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const stylistId = sessionStorage.getItem("userId");

    const fetchAppointments = async () => {
        try {
            console.log("Stylist ID:", stylistId);
            const res = await axios.get(`${api_address}/api/appointments/stylists/${stylistId}`, config);
            
            console.log("Raw appointment response:", res.data);

            const mapped = res.data.map((appt: any) => {
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
                    id: appt._id,
                    name: appt.customer?.name || "Customer",
                    date: formattedDate,
                    time: formattedTime,
                    service: appt.service?.name || "Service",
                    remarks: appt.request || "NIL",
                    image: appt.customer?.image || "/images/default-avatar.jpg",
                };
            });
            setAppointments(mapped);
        } catch (err) {
            console.error("Error fetching appointments:", err);
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
                    {appointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 border rounded-lg shadow-sm flex flex-col items-center bg-white dark:bg-gray-800">
                            <img
                                src={appointment.image}
                                alt={appointment.name}
                                className="w-20 h-20 object-cover rounded-full border mb-2"
                            />
                            <h5 className="font-semibold text-md">{appointment.name}</h5>
                            <p className="text-sm text-gray-500">{appointment.date} - {appointment.time}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.service}</p>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                <strong>Remarks:</strong>
                                <p className="whitespace-pre-wrap">{appointment.remarks}</p>
                            </div>
                            <Button size="sm" variant="primary" className="mt-3 w-full">
                                Attending
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
