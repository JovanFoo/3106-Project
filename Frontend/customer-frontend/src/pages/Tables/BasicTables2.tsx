import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function BasicTables2() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Our Team" />
      <div className="space-y-6">
        <ComponentCard title="Our Stylists">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
