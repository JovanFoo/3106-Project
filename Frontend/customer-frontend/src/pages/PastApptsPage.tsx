// src/pages/PastApptsPage.tsx
import { useEffect, useState } from "react";
import ComponentCard from "../components/common/ComponentCard";
import ApptTable from "./Tables/ApptTable";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

const PastApptsPage = () => {
  const [appts, setAppts] = useState<[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/"); // authentication check
    }
  }, []);

  // fetch all appointment details
  useEffect(() => {
    async function fetchApptDetails() {
      const userData = localStorage.getItem("user");
      if (userData) {
        const customer = JSON.parse(userData);
        const customerId = customer.customer._id;
        const token = customer.tokens.token;
        try {
          const response = await fetch(
            `${API_URL}/api/customers/${customerId}/appointmentsalldetails`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch appointments");

          const data = await response.json();
          // const test = data.map((appointment: any) => {
          //   console.log(appointment)
          // });
          console.log("UseEffect: fetchApptDetails()");
          console.log(data);

          setAppts(data);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
      }
    }
    fetchApptDetails();
  }, []);

  return (
    <>
      <PageMeta
        title="BuzzBook - View Appointments"
        description="View All Appointments"
      />
      <PageBreadcrumb pageTitle="View Appointments" />
      <div>
        <ComponentCard title="Upcoming/Past Appointments">
          <ApptTable appointment={appts} />
        </ComponentCard>
      </div>
    </>
  );
};

export default PastApptsPage;
