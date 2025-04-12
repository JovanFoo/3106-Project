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

interface Expertise {
  _id: string;
  name: string;
  description?: string;
}
interface Stylist {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  expertises?: Expertise[];
  appointments?: string[];
  profilePicture: string;
}

// Define the table data using the interface

export default function BasicTableOne() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState<{ _id: string; location: string }[]>(
    []
  );

  useEffect(() => {
    // get list of all available branches
    const fetchBranches = async () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const customer = JSON.parse(userData);
        const token = customer.tokens.token;
        try {
          const response = await fetch(`${API_URL}/api/branches`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch branches");

          const data = await response.json();
          console.log(data);
          setBranches(data);
        } catch (error) {
          console.error("Error fetching branches:", error);
        }
      }
    };
    fetchBranches();
  }, []);

  const fetchStylists = async (branchId: string) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(
          `${API_URL}/api/branches/${branchId}/stylists`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch stylists");

        const data = await response.json();
        setStylists(data);
        console.log(data, "stylists");
      } catch (error) {
        console.error("Error fetching stylist:", error);
      }
    }
  };

  useEffect(() => {
    if (branch) {
      fetchStylists(branch);
    }
  }, [branch]);

  const tableData: Stylist[] = stylists;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <div className="p-4">
            <label className="mr-2 font-medium text-gray-700 dark:text-white">
              Select Branch:
            </label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.location}
                </option>
              ))}
            </select>
          </div>

          <Table>
            {/* Table Header */}

            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
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
                  Phone Number
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Expertise
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={
                            order.profilePicture ||
                            "/images/logo/defaultprofile.png"
                          }
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.phoneNumber}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {" "}
                    <div className="flex flex-wrap gap-2">
                      {order.expertises?.map((expertiseItem, index) => (
                        <Badge key={index} size="sm" color="primary">
                          {expertiseItem.name} {/* Display expertise name */}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {" "}
                    <Badge
                      size="sm"
                      color={
                        order.name === "Active"
                          ? "success"
                          : order.name === "Pending"
                          ? "success"
                          : "success"
                      }
                    >
                      {"active"}
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
