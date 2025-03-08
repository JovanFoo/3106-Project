import ComponentCard from "../components/common/ComponentCard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Select from "../components/form/Select";

export default function Discounts() {
  // options to select branches
  const branches = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
    { value: "Address1", label: "Address" },
  ];
  // update the view when changing branches
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  return (
    <div>
      <PageMeta
        title="Discounts and Promotions - Salon Admin System"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Discounts and Promotions" />
      <div>
        <ComponentCard
          title="Select Branch:"
          action={
            <Select
              options={branches} // branch options
              onChange={handleSelectChange} // update view to reflect branch info
              defaultValue=""
              className="dark:bg-dark-900"
            />
          }
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <ComponentCard title="Current Discounts">
                current discounts for branch here
              </ComponentCard>
            </div>
            <div className="space-y-6">
              <ComponentCard title="Current Promotions">
                current promotions for branch here
              </ComponentCard>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
