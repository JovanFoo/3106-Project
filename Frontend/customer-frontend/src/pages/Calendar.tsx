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

interface CalendarEvent extends EventInput {
  extendedProps: {
    stylist: string;
    request: string;
    service: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [stylist, setStylist] = useState("");
  const [apptStartDate, setApptStartDate] = useState("");
  const [request, setRequest] = useState("");
  const [service, setService] = useState("");
  const [appt, setAppts] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // const calendarsEvents = {
  //   Danger: "danger",
  //   Success: "success",
  //   Primary: "primary",
  //   Warning: "warning",
  // };
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const customerId = customer.customer._id;
      const token = customer.token;
      try {
        const response = await fetch(
          `http://localhost:3000/api/customers/${customerId}/appointments`,
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
        console.log(`response: ${response}`);
        console.log(`data: ${data}`);

        const formattedAppointments = data.map((appointment: any) => ({
          id: appointment._id.toString(),
          start: new Date(appointment.date).toISOString().split("T")[0] || "",
          extendedProps: {
            stylist: appointment.stylist,
            request: appointment.request,
            service: appointment.service,
          },
        }));

        setAppts(formattedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setApptStartDate(selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    // get the appointment details and set the fields
    const appt = clickInfo.event;
    setSelectedEvent(appt as unknown as CalendarEvent);
    setStylist(appt.extendedProps.stylist);
    setRequest(appt.extendedProps.request);
    setService(appt.extendedProps.service);
    // convert to SGT
    const date = appt.start ? new Date(appt.start) : new Date();
    if (date) {
      date.setHours(date.getHours() + 8)
    }
    setApptStartDate(date.toISOString().split("T")[0]);
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      // Update existing event
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
                },
              }
            : event
        )
      );
    } else {
      // Add new appointment
      const newAppointment: CalendarEvent = {
        id: Date.now().toString(),
        start: apptStartDate,
        allDay: true, // change to set the timing
        extendedProps: { stylist: stylist, request: request, service: service },
      };
      setAppts((prevEvents) => [...prevEvents, newAppointment]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setStylist("");
    setRequest("");
    setService("");
    setApptStartDate("");
    // setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
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
          onClose={closeModal}
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
                  Enter Start Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="date"
                    value={apptStartDate}
                    onChange={(e) => setApptStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              {/* <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span className="w-2 h-2 bg-white rounded-full dark:bg-transparent"></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              <div className="mt-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Stylist
                  </label>
                  <input
                    id="stylist"
                    type="text"
                    value={stylist}
                    onChange={(e) => setStylist(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Service
                </label>
                <input
                  id="location"
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
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
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Appointment" : "Book Appointment"}
              </button>
            </div>
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

const renderEventContent = (eventInfo: any) => {
  return (
    <div
      className={`event-fc-color flex fc-event-main fc-bg-primary p-1 rounded`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">
        {eventInfo.event.extendedProps.service}
      </div>
    </div>
  );
};

export default Calendar;
