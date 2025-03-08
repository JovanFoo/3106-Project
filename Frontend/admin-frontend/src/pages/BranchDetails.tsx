import ComponentCard from "../components/common/ComponentCard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import MonthlySalesChart from "../components/ecommerce/MonthlySalesChart";
import Label from "../components/form/Label";
import Select from "../components/form/Select";
import Button from "../components/ui/button/Button";

export default function BranchDetails() {
  // options to select branches
  const branches = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
    { value: "Address1", label: "Address" },
  ];

  // options to select manager from staff
  const staff = [
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
        title="Branch Details - Salon Admin System"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Branch Details" />
      <div className="space-y-6">
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
          {/* parent div to contain all elements. 4px horizontal gap between div components */}
          <div className="flex gap-4">
            <div className="w-1/3">
              <div className="space-y-4">
                {" "}
                {/* Add vertical spacing between elements */}
                {/* Label and Select side by side */}
                <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                  <Label>Branch Manager:</Label>
                  <Select
                    options={staff}
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                  />
                </div>
                {/* ComponentCard below */}
                <ComponentCard title="Staff" action={<Button>Button</Button>}>
                  {undefined}
                  {/* Add staff details here */}
                </ComponentCard>
              </div>
            </div>
            <div className="w-2/3">
              <MonthlySalesChart />
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
