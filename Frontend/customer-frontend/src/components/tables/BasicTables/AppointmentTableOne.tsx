import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";

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
}

interface Props {
  appointment: Appointment[];
}

export default function AppointmentTableOne({ appointment }: Props) {
  const [statusFilter, setStatusFilter] = useState("");

  // useEffect(() => {
  //   console.log(
  //     "filteredData",
  //     filteredData,
  //     typeof filteredData,
  //     Array.isArray(filteredData)
  //   );
  // }, []);

  const filteredData = statusFilter
    ? appointment.filter((appt) => appt.status === statusFilter)
    : appointment;

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

                  <TableCell className="px-4 py-3 text-theme-sm">
                    {" "}
                    <TableCell className="px-4 py-3 text-theme-sm">
                      {order.totalAmount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
