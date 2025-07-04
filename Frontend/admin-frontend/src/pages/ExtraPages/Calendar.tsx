import { EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
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
  const [, setEventLevel] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const user = useUser();

  // const calendarsEvents = {
  //   Danger: "danger",
  //   Success: "success",
  //   Primary: "primary",
  //   Warning: "warning",
  // };
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  useEffect(() => {
    console.log();
    // Initialize with some events
    if (user._id === "") return;
    const date = calendarRef.current?.getApi().getDate();
    axios
      .get(
        `${
          import.meta.env.VITE_APP_API_ADDRESS_DEV
        }/api/calendar/my-events?currentYear=${date?.getFullYear()}&currentMonth=${date?.getMonth()}`,
        config
      )
      .then((res) => {
        const resEvents: CalendarEvent[] = res.data;
        const events: CalendarEvent[] = resEvents.map(
          (event: CalendarEvent) => {
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
              description: event.description,
              allDay: event.type === "Leave",
              type: event.type,
              extendedProps: {
                calendar: event.type === "Leave" ? "Danger" : "Success",
              },
            };
          }
        );
        setEvents(events);
        console.log(events);
      })
      .catch((err) => {
        console.log(err);
      });
    // Set the events to the state
  }, [user._id]);
  // useEffect(() => {
  //   setEvents([
  //     {
  //       id: "1",
  //       title: "Event Conf.",
  //       start: new Date().toISOString(),
  //       end: new Date(Date.now() + 60 * 1000 * 1).toISOString(),
  //       extendedProps: { calendar: "Danger" },
  //     },
  //     {
  //       id: "2",
  //       title: "Meeting",
  //       start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  //       extendedProps: { calendar: "Success" },
  //     },
  //     {
  //       id: "3",
  //       title: "Workshop",
  //       start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
  //       end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
  //       extendedProps: { calendar: "Primary" },
  //     },
  //   ]);
  // }, []);
  const handleDateSelect = () => {
    resetModalFields();
    // setEventStartDate(selectInfo.startStr);
    // setEventEndDate(selectInfo.endStr || selectInfo.startStr);
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
      <PageMeta title="Calendar" description="Manage Calendar" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
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
        <div id="calendar-modal" className="hidden">
          {/* <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on
                track
              </p>
            </div>
            <div className="mt-8">
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
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
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Start Date
                </label>
                <div className="relative">
                  {eventStartDateView}
                  <input
                    id="event-start-date"
                    type="datetime-local"
                    value={eventStartDateView}
                    // value={eventStartDate?.toISOString().substring(0, 16) || ""}
                    // value="2020-03-12T12:12"
                    onChange={(e) => {
                      try {
                        const date: Date = new Date(
                          new Date(e.target.value).setHours(
                            new Date(e.target.value).getHours() + 8
                          )
                        );
                        setEventEndDateView(
                          date.toISOString().substring(0, 16)
                        );
                        setEventStartDate(new Date(e.target.value));
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter End Date
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="datetime-local"
                    value={eventEndDate?.toISOString().substring(0, 16)}
                    onChange={(e) => {
                      try {
                        const date: Date = new Date(
                          new Date(e.target.value).setHours(
                            new Date(e.target.value).getHours() - 8
                          )
                        );
                        setEventEndDateView(
                          date.toISOString().substring(0, 16)
                        );
                        setEventEndDate(new Date(e.target.value));
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
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
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal> */}
        </div>
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
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
