import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import { useUser } from "../../context/UserContext";
import { useModal } from "../../hooks/useModal";

interface CalendarEvent extends EventInput {
  id: string;
  start: Date;
  end: Date;
  title: string;
  description: string;
  type: string;
  status: "Pending" | "Completed" | "Confirmed" | "Cancelled";
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState<Date>();
  const [eventEndDate, setEventEndDate] = useState<Date>();
  const [eventLevel, setEventLevel] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const user = useUser();
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const load = async () => {
    const date = calendarRef.current?.getApi().getDate();
    await axios
      .get(
        `${
          import.meta.env.VITE_APP_API_ADDRESS_DEV
        }/api/calendar/my-events?currentYear=${date?.getFullYear()}&currentMonth=${date?.getMonth()}`,
        config
      )
      .then((res) => {
        const resEvents: CalendarEvent[] = res.data;
        const events: CalendarEvent[] = resEvents
          .filter((x: CalendarEvent) => {
            return x.status === "Pending";
          })
          .map((event: CalendarEvent) => {
            return {
              id: event._id,
              title: event.title,
              start: new Date(
                new Date(event.start).setHours(
                  new Date(event.start).getHours() - 8
                )
              ),
              end: new Date(
                new Date(event.end).setHours(new Date(event.end).getHours() - 8)
              ),
              status: event.status,
              description: event.description,
              allDay: event.type === "Leave",
              type: event.type,
              extendedProps: {
                calendar: event.type === "Leave" ? "Danger" : "Success",
              },
            };
          });
        setEvents(events);
        console.log(events);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handlePageChangeLoad = async () => {
    const date = calendarRef.current?.getApi().getDate();
    if (
      date?.getFullYear() != currentYear ||
      date?.getMonth() != currentMonth
    ) {
      setCurrentYear(date?.getFullYear() ?? 0);
      setCurrentMonth(date?.getMonth() ?? 0);
      load();
    }
  };

  useEffect(() => {
    // Initialize with some events
    if (user._id === "") return;
    handlePageChangeLoad();
  }, [user._id, calendarRef.current?.getApi().getDate()]);

  useEffect(() => {
    load();
  }, []);
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    console.log(event);
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start || undefined);
    setEventDescription(event.extendedProps.description || undefined);
    setEventEndDate(event.end || undefined);
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate(undefined);
    setEventEndDate(undefined);
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="flex min-h-screen">
        <div className="flex-1 p-5">
          <PageMeta
            title="Calendar Dashboard"
            description="Calendar Dashboard page"
          />
          <PageBreadcrumb pageTitle="Calendar" />
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="custom-calendar ">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                eventMaxStack={5}
                eventInteractive={true}
                events={events}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                customButtons={{
                  addEventButton: {
                    text: "Add Event +",
                    click: openModal,
                  },
                }}
              />
            </div>
            <div id="calendar-modal" className="hidden"></div>

            <Modal
              isOpen={isOpen && selectedEvent !== null}
              onClose={closeModal}
              className="max-w-[700px] p-6 lg:p-10"
            >
              <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {selectedEvent?.title || eventTitle || "Event Title"}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  {selectedEvent?.description ||
                    eventDescription ||
                    "No description"}
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Start Date:
                    </span>
                    <span className="text-sm text-gray-800 dark:text-white/90">
                      {moment(eventStartDate).format("MMMM Do YYYY, h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      End Date:
                    </span>
                    <span className="text-sm text-gray-800 dark:text-white/90">
                      {moment(eventEndDate).format("MMMM Do YYYY, h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time text-black">{eventInfo.timeText}</div>
      <div className="fc-event-title text-black">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
