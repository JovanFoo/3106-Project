import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import Button from "../../ui/button/Button";
import ReviewFormModal from "../../ui/modal/ReviewFormModal";

const API_URL = import.meta.env.VITE_API_URL;

interface Branch {
  _id: string;
  phoneNumber: string;
  location: string;
}

interface Service {
  _id: string;
  name: string;
  duration: number;
}

interface Stylist {
  id: string;
  name: string;
  experience: number;
}

interface Review {
  _id: string;
  title: string;
  text: string;
  stars: number;
  createdAt: Date;
  modifiedAt: Date;
  stylist: {
    name: string;
  };
  customer: {
    username: string;
  };
}

interface Appointment {
  _id: string;
  name: string;
  date?: Date;
  status: string;
  request: string;
  totalAmount: number;
  branch?: Branch;
  service?: Service;
  stylist?: Stylist;
  review: Review | null; // updated to allow null
}

interface Props {
  appointment: Appointment[];
}

export default function AppointmentTableOne({ appointment }: Props) {
  // set initial dropdown value to Pending
  const [statusFilter, setStatusFilter] = useState("Completed");
  const [appointments, setAppointments] = useState<Appointment[]>(appointment);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    title: "",
    text: "",
    stars: 5,
  });

  const selectedReview = selectedAppointment?.review;

  // useEffect(() => {
  //   console.log(
  //     "filteredData",
  //     filteredData,
  //     typeof filteredData,
  //     Array.isArray(filteredData)
  //   );
  // }, []);

  useEffect(() => {
    setAppointments(appointment); // keep in sync with parent/props when it changes
  }, [appointment]);

  useEffect(() => {
    if (selectedAppointment?.review) {
      console.log("Review updated, text:", selectedAppointment.review.text);
    }
  }, [selectedAppointment]);

  const handleCreateReview = async (data: {
    title: string;
    text: string;
    stars: number;
  }) => {
    if (!selectedAppointment) return;

    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;

      try {
        const response = await fetch(
          `${API_URL}/api/reviews/${selectedAppointment._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) throw new Error("Failed to create review");

        const createdReview = await response.json();

        // update the appointment with the new review
        updateAppointmentReview(selectedAppointment._id, createdReview);
      } catch (err) {
        console.error("Create Review Error:", err);
      }
    }
  };

  const handleEditReview = async (
    id: string,
    data: { title: string; text: string; stars: number }
  ) => {
    if (!selectedAppointment) return;

    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;

      try {
        const response = await fetch(`${API_URL}/api/reviews/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Failed to update review");

        const updatedReview = await response.json();

        // update the review inside the selected appointment
        updateAppointmentReview(selectedAppointment._id, updatedReview);
      } catch (err) {
        console.error("Edit Review Error:", err);
      }
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!selectedAppointment) return;

    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(`${API_URL}/api/reviews/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) throw new Error("Failed to delete review");

        // Remove the review from the appointment
        updateAppointmentReview(selectedAppointment._id, null);
      } catch (err) {
        console.error("Delete Review Error:", err);
      }
    }
  };

  const updateAppointmentReview = (id: string, review: Review | null) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appt) =>
        appt._id === id ? { ...appt, review } : appt
      )
    );
  };

  const filteredData = statusFilter
    ? appointments.filter((appt) => appt.status === statusFilter)
    : appointments;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <div className="p-4">
            <label className="mr-2 font-medium text-gray-700 dark:text-white">
              Select Status:
            </label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">-- All Appointments --</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Service(s)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Stylist
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Branch
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredData.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.date
                          ? new Date(order.date).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.service?.name}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.stylist?.name || "—"}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.branch?.location || "—"}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                    {order.totalAmount.toLocaleString("en-SG", {
                      style: "currency",
                      currency: "SGD",
                    })}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm">
                    <Badge
                      size="sm"
                      variant="solid"
                      color={
                        order.status === "Completed"
                          ? "success"
                          : order.status === "Pending"
                          ? "warning"
                          : order.status === "Confirmed"
                          ? "primary"
                          : order.status === "Cancelled"
                          ? "error"
                          : "light"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  {order.status === "Completed" ? (
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(order);
                          setReviewForm({
                            title: order.review?.title || "",
                            text: order.review?.text || "",
                            stars: order.review?.stars || 5,
                          });
                          setIsModalOpen(true);
                        }}
                      >
                        {order.review ? "Edit Review" : "Add Review"}
                      </Button>
                    </TableCell>
                  ) : (
                    <></>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isModalOpen && (
            <ReviewFormModal
              review={selectedReview} // optional, can be undefined for "Add"
              onClose={() => setIsModalOpen(false)}
              onSubmit={(data) => {
                if (selectedAppointment?.review) {
                  handleEditReview(selectedAppointment.review._id, data);
                } else {
                  handleCreateReview(data);
                }
                setIsModalOpen(false);
              }}
              onDelete={() => {
                if (selectedAppointment?.review) {
                  handleDeleteReview(selectedAppointment.review._id);
                } else {
                  console.log("Error deleting review!");
                }
                setIsModalOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
