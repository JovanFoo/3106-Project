import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import BasicTableOne from "../components/tables/BasicTables/BasicTableOne";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/ui/button/Button";
const API_URL = import.meta.env.VITE_API_URL;

interface CalendarEvent extends EventInput {
  extendedProps: {
    // stores the stylistId and serviceId
    stylist: string;
    request: string;
    service: string;
    branch: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [stylist, setStylist] = useState("");
  // only take the _id and name of the stylist object
  const [stylists, setStylists] = useState<{ _id: string; name: string }[]>([]);
  const [apptStartDate, setApptStartDate] = useState("");
  const [request, setRequest] = useState("");
  const [service, setService] = useState("");
  // only take the _id, name and serviceRate of the service object
  const [services, setServices] = useState<
    { _id: string; name: string; serviceRate: Number }[]
  >([]);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState<{ _id: string; location: string }[]>(
    []
  );
  const [appt, setAppts] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  // const calendarsEvents = {
  //   Danger: "danger",
  //   Success: "success",
  //   Primary: "primary",
  //   Warning: "warning",
  // };
  useEffect(() => {
    fetchAppointments();
    // fetchStylists();
    fetchBranches();
    fetchServices(new Date()); //to allow initial rendering of appointment service types on calendar
    // MIGHT BREAK THE SERVICE RATE CALCULATION //
  }, []);

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

  // get a list of all services and their prices for dropdown
  const fetchServices = async (date: Date) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDay();
        // Edit Back to endpoint URL
        const response = await fetch(
          `http://localhost:3000/api/services?year=${year}&month=${month}&day=${day}`,
          // `${API_URL}/api/services?year=${year}&month=${month}&day=${day}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch services");

        const data = await response.json();
        console.log(data);
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    }
  };

  // get list of all stylists for SPECIFIC BRANCH for dropdown
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
        console.log(data);
        setStylists(data);
      } catch (error) {
        console.error("Error fetching stylist:", error);
      }
    }
  };

  const fetchAppointments = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const customerId = customer.customer._id;
      const token = customer.tokens.token;
      try {
        const response = await fetch(
          `${API_URL}/api/customers/${customerId}/appointments`,
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

        const formattedAppointments = data
          .filter(
            (appointment: any) => appointment.status.toString() === "Pending"
          ) // only show active appointments
          .map((appointment: any) => ({
            id: appointment._id.toString(),
            start: new Date(appointment.date).toISOString().split("T")[0] || "",
            extendedProps: {
              // stores the stylistId and serviceId
              stylist: appointment.stylist,
              request: appointment.request,
              service: appointment.service,
              branch: appointment.branch,
            },
          }));

        setAppts(formattedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    }
  };
  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;

    const userData = localStorage.getItem("user");
    if (!userData) {
      console.error("No user data found");
      return;
    }

    const customer = JSON.parse(userData);
    const token = customer.tokens.token;

    try {
      const response = await fetch(
        `${API_URL}/api/appointments/${selectedEvent.id}/cancelled`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ status: "Cancelled" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setAppts((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );
      closeDeleteModal();
      closeModal();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    // get the service (thus rate) for the current date
    fetchServices(new Date(selectInfo.startStr));
    setApptStartDate(selectInfo.startStr);
    openModal();
  };
  // clicking the appointment tab on calendar
  const handleEventClick = async (clickInfo: EventClickArg) => {
    // get the appointment details and set the fields
    const appt = clickInfo.event;
    // convert to SGT
    const date = appt.start ? new Date(appt.start) : new Date();
    if (date) {
      date.setHours(date.getHours() + 8);
    }
    // Set the branch first
    setBranch(appt.extendedProps.branch);

    await fetchServices(date);
    await fetchStylists(appt.extendedProps.branch);

    const serviceObj = services.find(
      (s) => s._id === appt.extendedProps.service
    );

    setSelectedEvent(appt as unknown as CalendarEvent);
    setStylist(appt.extendedProps.stylist);
    setRequest(appt.extendedProps.request);
    setService(serviceObj?._id || "");
    setApptStartDate(date.toISOString().split("T")[0]);
    openModal();
  };
  // handle branch selection change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    setBranch(branchId);

    // Reset dependent fields
    setStylist("");
    setService("");

    // Fetch services and stylists for the selected branch
    if (branchId && apptStartDate) {
      fetchStylists(branchId);
    }
  };

  const handleAddOrUpdateEvent = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.error("No user data found");
      return;
    }
    const customer = JSON.parse(userData);
    const token = customer.tokens.token;

    // find the selected service to get its rate
    const selectedService = services.find((s) => s._id === service);
    const serviceRate = selectedService?.serviceRate || 0;

    if (selectedEvent) {
      // TODO: Update existing event
      const serviceRate = services.filter((e) => e._id === service);
      console.log(serviceRate);
      setAppts((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                start: apptStartDate,
                extendedProps: {
                  stylist: stylist,
                  service: service,
                  request: request,
                  branch: branch,
                },
              }
            : event
        )
      );
    } else {
      // Add new appointment
      const newAppointmentData = {
        date: apptStartDate,
        request: request,
        totalAmount: serviceRate,
        serviceId: service,
        stylistId: stylist,
        branchId: branch,
      };

      try {
        const response = await fetch(`${API_URL}/api/appointments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(newAppointmentData),
        });

        if (!response.ok) {
          throw new Error("Failed to create appointment");
        }
        const createdAppointment = await response.json();
        // Convert response data into FullCalendar format
        const newAppointment: CalendarEvent = {
          id: createdAppointment._id.toString(),
          start: createdAppointment.date,
          allDay: true,
          extendedProps: {
            branch: createdAppointment.branch,
            stylist: createdAppointment.stylist,
            service: createdAppointment.service,
            request: createdAppointment.request,
          },
        };
        // update calendar's state to reflect new appointment
        setAppts((prevEvents) => [...prevEvents, newAppointment]);
      } catch (error) {
        console.error("Error creating appointment:", error);
      }
    }
    closeModal();
    resetModalFields();
  };

  const closeModalResetFields = () => {
    resetModalFields();
    closeModal();
  };

  const resetModalFields = () => {
    setStylist("");
    setRequest("");
    setService("");
    setApptStartDate("");
    // setEventLevel("");
    setSelectedEvent(null);
    setBranch("");
  };

  // renders appointment bars on calendar
  const renderEventContent = (eventInfo: any) => {
    // // map serviceId(in extendedProps) to service name in services list (got from backend)
    const getServiceName = (serviceId: string) => {
      const serviceObj = services.find((s) => s._id === serviceId);
      return serviceObj ? serviceObj.name : "Unknown Service";
    };
    return (
      <div
        className={`event-fc-color flex fc-event-main fc-bg-primary p-1 rounded`}
      >
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">
          {getServiceName(eventInfo.event.extendedProps.service)}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Customer | Appointments"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Appointments" />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            timeZone="local"
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={appt}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Book an Appointment",
                click: openModal,
              },
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModalResetFields}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Appointment" : "Add Appointment"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Book an Appointment Now!
              </p>
            </div>
            <div className="mt-8">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="date"
                    value={apptStartDate}
                    onChange={(e) => {
                      setApptStartDate(e.target.value);
                      fetchServices(new Date(e.target.value));
                    }}
                    className={`dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Select Branch
                </label>
                <select
                  id="branch"
                  value={branch}
                  onChange={handleBranchChange}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Stylist
                </label>
                <select
                  id="stylist"
                  value={stylist}
                  onChange={(e) => setStylist(e.target.value)}
                  className={`dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
                    !branch ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!branch}
                  required
                >
                  <option value="">Select a stylist</option>
                  {stylists.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Service
                </label>
                <select
                  id="service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={`dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
                    !branch ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!branch}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (${s.serviceRate.toString()})
                      {/* display service name, save service value as name also */}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Request
                </label>
                <input
                  id="request"
                  type="text"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  className={`dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
                    !branch ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!branch}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              {/* show cancel appointment button only if editing */}
              {selectedEvent ? (
                <button
                  onClick={openDeleteModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Cancel Appointment
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                disabled={!apptStartDate || !stylist || !service}
                className={`btn btn-success btn-update-event flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white sm:w-auto ${
                  !apptStartDate || !stylist || !service
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                {selectedEvent ? "Update Appointment" : "Book Appointment"}
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          className="max-w-md p-6 lg:p-8"
        >
          <h5 className="mb-4 font-semibold text-gray-800 text-xl">
            Confirm Cancellation
          </h5>
          <p className="text-gray-600">
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </p>

          <div className="flex items-center gap-3 mt-6 sm:justify-end">
            <button
              onClick={closeDeleteModal}
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAppointment}
              type="button"
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
            >
              Confirm Cancellation
            </button>
          </div>
        </Modal>
      </div>
      <div className="p-4">
        <ComponentCard title="Current appointments">
          <Button children="Completed Appointments" />
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
};

export default Calendar;
