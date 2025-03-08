import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Button from "../../components/ui/button/Button";
import { PencilIcon } from "../../icons";

const ManageBranch: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Mange Branch - Salon Admin System"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Manage Branch" />
      <div className="space-y-6">
        <ComponentCard
          title="Branches"
          action={
            <Button
              size="sm"
              variant="primary"
              startIcon={<PencilIcon className="size-5" />}
            >
              Add New Branch
            </Button>
          }
        >
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
};

export default ManageBranch;
