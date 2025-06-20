import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageMeta title="BuzzBook - Our Team" description="BuzzBook - Our Team" />
      <PageBreadcrumb pageTitle="Our Team" />
      <div className="space-y-6">
        <ComponentCard title="Our Stylists">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
