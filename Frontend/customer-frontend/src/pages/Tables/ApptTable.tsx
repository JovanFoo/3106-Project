import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import AppointmentTableOne from "../../components/tables/BasicTables/AppointmentTableOne";

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
  review: Review | null;
}

interface Props {
  appointment: Appointment[];
}

export default function ApptTable({ appointment }: Props) {
  return (
    <>
      {/* <PageMeta title="BuzzBook - Past Appointments" description="BuzzBook" /> */}
      {/* <PageBreadcrumb pageTitle="Appointments" /> */}
      <div className="space-y-6">
        <AppointmentTableOne appointment={appointment} />
      </div>
    </>
  );
}
