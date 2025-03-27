import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";

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
        const fetchAppointments = async () => {
            try {
                const response = await fetch("/api/appointments"); // Replace with actual API
                const data = await response.json();
                setAppointments(data);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        };
        
        fetchAppointments();
    }, []);

    // hardcoded to visualise
    useEffect(() => {
        setAppointments([
            {
                id: "1",
                name: "George Fields",
                date: "26 October 2024",
                time: "12:00PM",
                service: "Haircut",
                remarks: "NIL\nasd\nasd\nasd",
                image: "https://randomuser.me/api/portraits/men/1.jpg"
            },
            {
                id: "2",
                name: "Jane Doe",
                date: "27 October 2024",
                time: "2:00PM",
                service: "Hair Coloring",
                remarks: "No allergies",
                image: "https://randomuser.me/api/portraits/women/2.jpg"
            }
        ]);
    }, []);
    

    return (
        <div>
            <PageBreadcrumb pageTitle="Appointments" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Upcoming Appointments</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {appointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 border rounded-lg shadow-sm flex flex-col items-center bg-white dark:bg-gray-800">
                            <img
                                src={appointment.image || "/images/default-avatar.jpg"}
                                alt={appointment.name}
                                className="w-20 h-20 object-cover rounded-full border mb-2"
                            />
                            <h5 className="font-semibold text-md">{appointment.name}</h5>
                            <p className="text-sm text-gray-500">{appointment.date} - {appointment.time}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.service}</p>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <strong>Remarks:</strong>
                                <p className="whitespace-pre-wrap text-center">{appointment.remarks || "NIL"}</p>
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
