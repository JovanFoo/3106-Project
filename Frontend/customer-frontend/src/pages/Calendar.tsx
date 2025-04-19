import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";

interface CalendarEvent extends EventInput {
  extendedProps: {
    // stores the stylistId and serviceId
    stylist: string;
    request: string;
    service: string;
    branch: string;
    pointsUsed: number;
  };
}
interface TimeSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
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
  const [services, setServices] = useState<
    { _id: string; name: string; serviceRate: number; duration: number }[]
  >([]);
  const [allServices, setAllServices] = useState<
    { _id: string; name: string; serviceRate: number; duration: number }[]
  >([]);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState<{ _id: string; location: string }[]>(
    []
  );
  const [appt, setAppts] = useState<CalendarEvent[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [, setapptsalldetails] = useState<[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(0);
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(0);
  const [loyaltypointsORGINAL, setloyaltypointsORIGINAL] = useState(0);
  const [editpointsused, seteditpointsused] = useState(0); // for editing appts

  const selectedService = services.find((s) => s._id === service);
  const servicePrice = selectedService?.serviceRate ?? 0;
  const pointValue = 0.1; // 10 cents per point
  const finalPrice = Math.max(servicePrice - useLoyaltyPoints * pointValue, 0);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/"); // authentication check
    }
  }, []);

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
    initialServiceFetch(); // fetch EVERY SINGLE service, regardless of date
    // fetchServices(new Date()); //to allow initial rendering of appointment service types on calendar

    async function getUserDetails() {
      const userData = localStorage.getItem("user");
      if (userData) {
        const customer = JSON.parse(userData);
        const customerId = customer.customer._id;
        const token = customer.tokens.token;
        try {
          const response = await fetch(
            `${API_URL}/api/customers/${customerId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json", // added this
                Authorization: token,
              },
            }
          );
          const data = await response.json();
          // console.log(data);
          setUserLoyaltyPoints(data.loyaltyPoints);
          if (!response.ok) {
            console.log(data);
          }
        } catch (error) {
          console.error("Error fetching branches:", error);
        }
      }
    }
    getUserDetails();
  }, []);

  // to re-get the list of available times if any of the values change
  useEffect(() => {
    if (apptStartDate && branch && service && stylist) {
      fetchAvailableTimes();
    } else {
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [apptStartDate, branch, service, stylist]);

  // fetch appt all details
  useEffect(() => {
    async function fetchApptDetails() {
      const userData = localStorage.getItem("user");
      if (userData) {
        const customer = JSON.parse(userData);
        const customerId = customer.customer._id;
        const token = customer.tokens.token;
        try {
          const response = await fetch(
            `${API_URL}/api/customers/${customerId}/appointmentsalldetails`,
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
          // console.log(data, "appt all detils");

          setapptsalldetails(data);
        } catch (error) {
          console.error("Error  fetching appointments:", error);
        }
      }
    }
    fetchApptDetails();
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
        // console.log(data);
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }
  };
  const initialServiceFetch = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(`${API_URL}/api/services`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch services");
        const data = await response.json();
        // console.log(data, "initial");
        setAllServices(data);
      } catch {}
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
        const day = date.getDate();
        const response = await fetch(
          `${API_URL}/api/services?year=${year}&month=${month}&day=${day}`,
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
        // console.log(data, "on date");
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    }
  };
  // get list of all stylists for SPECIFIC BRANCH for dropdown
  const fetchStylists = async (branchId: string) => {
    const userData = localStorage.getItem("user");

    console.log(userData);
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
        console.log(data, "data");
        console.log(data, " all stylists");
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
        //   console.log("Appointment:");
        //   console.log(appointment);
        // });

        const formattedAppointments = data
          .filter(
            (appointment: any) => appointment.status.toString() === "Pending"
          ) // only show active appointments
          .map((appointment: any) => ({
            id: appointment._id.toString(),
            start: new Date(appointment.date).toISOString() || "",
            extendedProps: {
              // stores the stylistId and serviceId
              stylist: appointment.stylist,
              request: appointment.request,
              service: appointment.service,
              branch: appointment.branch,
              pointsUsed: appointment.pointsUsed,
            },
          }));

        // console.log(formattedAppointments, "appts");

        setAppts(formattedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    }
  };
  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;
    const pointsRecovered = selectedEvent.extendedProps.pointsUsed;

    console.log(pointsRecovered);
    setUserLoyaltyPoints((pts) => pts + pointsRecovered);

    const userData = localStorage.getItem("user");
    if (!userData) {
      console.error("No user data found");
      return;
    }

    const customer = JSON.parse(userData);
    const token = customer.tokens.token;
    const id = customer.customer._id;

    // update the user loyalty points
    const response2 = await fetch(`${API_URL}/api/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        loyaltyPoints: userLoyaltyPoints + pointsRecovered,
      }),
    });

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

      if (!response.ok || !response2.ok) {
        throw new Error("Failed to delete appointment");
      }

      setAppts((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );
      closeDeleteModal();
      closeModal();
      toast.success("Appointment cancelled successfully!");
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

    setBranch(appt.extendedProps.branch);

    await fetchServices(date);
    await fetchStylists(appt.extendedProps.branch);

    const serviceObj = allServices.find(
      (s) => s._id === appt.extendedProps.service
    );

    // create a time slot object for the existing appointment
    // helper function to format time range
    const formatTimeRange = (start: Date | null, end: Date | null) => {
      if (!start || !end) return "";

      const startTime = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endTime = end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${startTime.toUpperCase()} - ${endTime.toUpperCase()}`;
    };
    const serviceTime = Number(serviceObj?.duration);
    console.log(appt.start);
    if (appt.start && serviceTime) {
      const endTime = new Date(appt.start.getTime() + serviceTime * 60000); // convert minutes to milliseconds
      const existingTimeSlot: TimeSlot = {
        startTime: appt.start.toISOString(),
        endTime: endTime.toISOString(),
        displayTime: formatTimeRange(appt.start, endTime),
      };
      setSelectedTimeSlot(existingTimeSlot);
    }
    setSelectedEvent(appt as unknown as CalendarEvent);
    setStylist(appt.extendedProps.stylist);
    setRequest(appt.extendedProps.request);
    setService(serviceObj?._id || "");
    setApptStartDate(date.toISOString().split("T")[0]);
    setUseLoyaltyPoints(appt.extendedProps.pointsUsed);
    seteditpointsused(appt.extendedProps.pointsUsed);
    setloyaltypointsORIGINAL(appt.extendedProps.pointsUsed);
    openModal();
  };
  // handle branch selection change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    setBranch(branchId);

    setStylist("");
    setService("");

    // fetch services and stylists for the selected branch
    if (branchId && apptStartDate) {
      fetchStylists(branchId);
    }
  };
  // get available times of stylist based on service
  const fetchAvailableTimes = async () => {
    if (!apptStartDate || !branch || !service || !stylist) return;

    setIsLoadingTimes(true);
    setAvailableTimeSlots([]);
    // setSelectedTimeSlot(null); to allow setting of existing timeslot when editing

    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;

      const dateSplits = apptStartDate.split("-");
      const year = Number(dateSplits[0]);
      const month = Number(dateSplits[1]);
      const day = Number(dateSplits[2]);
      try {
        console.log("fetching stylists");
        const response = await fetch(
          `${API_URL}/api/stylists/${stylist}/availability?branchId=${branch}&serviceId=${service}&year=${year}&month=${month}&day=${day}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch available times");

        const data = await response.json();
        setAvailableTimeSlots(() => {
          // get all stylist available slots NOW
          const slots = data.timeSlots || [];
          // add the selected appt's selectedTimeSlot into the list
          return selectedTimeSlot &&
            !slots.some(
              (s: { startTime: string }) =>
                s.startTime === selectedTimeSlot.startTime
            )
            ? [selectedTimeSlot, ...slots]
            : slots;
        });
      } catch (error) {
        console.error("Error fetching available times:", error);
      } finally {
        setIsLoadingTimes(false);
      }
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
    const id = customer.customer._id;
    console.log(id);

    // find the selected service to get its rate
    const selectedService = services.find((s) => s._id === service);
    const serviceRate = selectedService?.serviceRate || 0;

    // get the selected date time
    const dateTime = selectedTimeSlot?.startTime;

    if (!dateTime) {
      toast.error("Invalid Time Slot: handleAddOrUpdateEvent");
      closeModal();
      resetModalFields();
      return;
    }

    // check if selected dateTime is in the past
    if (new Date(dateTime) < new Date()) {
      toast.error(
        "You cannot book an appointment in the past. Please try again."
      );
      closeModal();
      resetModalFields();
      return;
    }

    if (selectedEvent) {
      // Edit appointment
      // const serviceRate = services.filter((e) => e._id === service);
      const apptId = selectedEvent.id;
      const updatedAppointment = {
        date: dateTime,
        request: request,
        totalAmount: serviceRate,
        serviceId: service,
        stylistId: stylist,
        branchId: branch,
        pointsUsed: useLoyaltyPoints,
      };

      // update the user loyalty points
      const response2 = await fetch(`${API_URL}/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          loyaltyPoints:
            userLoyaltyPoints - (useLoyaltyPoints - loyaltypointsORGINAL),
        }),
      });

      setUserLoyaltyPoints(
        (pts) => pts - (useLoyaltyPoints - loyaltypointsORGINAL)
      ); // in case no refresh

      if (!response2.ok) {
        throw new Error("Failed to update appointment");
      }
      // console.log(serviceRate);
      // console.log(updatedAppointment);
      // API call to update appt
      try {
        const response = await fetch(`${API_URL}/api/appointments/${apptId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(updatedAppointment),
        });

        if (!response.ok) {
          throw new Error("Failed to create appointment");
        }
      } catch (err) {
        window.confirm("Error updating appointment!");
        console.log("Error updating appointment: ", err);
      }
      // set the new updated appointment to be displayed
      setAppts((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                start: dateTime,
                extendedProps: {
                  stylist: stylist,
                  service: service,
                  request: request,
                  branch: branch,
                  pointsUsed: useLoyaltyPoints,
                },
              }
            : event
        )
      );
      toast.success("Your Appointment was successfully updated!");
    } else {
      console.log("add new appt", finalPrice);
      // Add new appointment
      const newAppointmentData = {
        date: dateTime,
        request: request,
        totalAmount: finalPrice,
        serviceId: service,
        stylistId: stylist,
        branchId: branch,
        pointsUsed: useLoyaltyPoints,
      };

      console.log(newAppointmentData, "newappt");

      try {
        const response = await fetch(`${API_URL}/api/appointments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(newAppointmentData),
        });

        const newpointsnum = userLoyaltyPoints - useLoyaltyPoints; // update user with updated points

        const response2 = await fetch(`${API_URL}/api/customers/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            loyaltyPoints: newpointsnum,
          }),
        });

        if (!response.ok || !response2.ok) {
          throw new Error("Failed to create appointment");
        }
        const createdAppointment = await response.json();
        console.log(createdAppointment, "created appt");
        // convert response data into FullCalendar format
        const newAppointment: CalendarEvent = {
          id: createdAppointment._id.toString(),
          start: createdAppointment.date,
          extendedProps: {
            branch: createdAppointment.branch,
            stylist: createdAppointment.stylist,
            service: createdAppointment.service,
            request: createdAppointment.request,
            pointsUsed: createdAppointment.pointsUsed,
          },
        };
        // update calendar's state to reflect new appointment
        setAppts((prevEvents) => [...prevEvents, newAppointment]);
        setUserLoyaltyPoints(newpointsnum); // set in case page no refresh.
        setUseLoyaltyPoints(0); // reset the slider to 0
        toast.success("Appointment created successfully!");
      } catch (error) {
        window.confirm("Error creating appointment!");
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
    setSelectedEvent(null);
    setBranch("");
    setSelectedTimeSlot(null);
    setUseLoyaltyPoints(0);
    seteditpointsused(0);
  };

  // renders appointment bars on calendar
  const renderEventContent = (eventInfo: any) => {
    // // map serviceId(in extendedProps) to service name in services list (got from backend)
    const getServiceName = (serviceId: string) => {
      const serviceObj = allServices.find((s) => s._id === serviceId);
      return serviceObj ? serviceObj.name : "Unknown Service";
    };
    return (
      <div
        className={`event-fc-color flex fc-event-main fc-bg-primary p-1 rounded items-center truncate`}
      >
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">
          {eventInfo.timeText.toUpperCase() + "M"}
        </div>
        <div className="fc-event-title">
          {getServiceName(eventInfo.event.extendedProps.service)}
        </div>
      </div>
    );
  };

  // console.log(Array.isArray(apptsalldetails)); // should be true
  // console.log(apptsalldetails);

  // const today = new Date().toISOString().split("T")[0]; // to restrict dynamically to only today or dates in the future

  // const maxDateObj = new Date();
  // maxDateObj.setDate(maxDateObj.getDate() + 90);
  // const maxDate = maxDateObj.toISOString().split("T")[0]; // to restrict dynamically to dates within 90 days

  // const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedDate = e.target.value;

  //   if (selectedDate < today || selectedDate > maxDate) {
  //     alert(
  //       `Please select a date between ${new Date().toLocaleDateString()} and ${maxDateObj.toLocaleDateString()}.`
  //     );
  //     return;
  //   }

  //   setApptStartDate(selectedDate);
  //   fetchServices(new Date(selectedDate));

  //   // previous inside the Input for the date, it was:
  //   // setApptStartDate(e.target.value);
  //   // fetchServices(new Date(e.target.value));
  // };

  return (
    <>
      <PageMeta
        title="BuzzBook - Book Appointments"
        description="BuzzBook - Book Appointments"
      />
      <PageBreadcrumb pageTitle="Book Appointments" />
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
              right: "", //"dayGridMonth,timeGridWeek,timeGridDay",
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
                {selectedEvent ? "Edit Appointment" : "Book Appointment"}
              </h5>
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
              {/* Enter Date */}
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
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    required
                  />
                </div>
              </div>

              {/* Select Branch */}
              <div>
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

              {/* Stylist */}
              <div>
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

              {/* Service */}
              <div>
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
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Time Slot
                </label>
                <select
                  id="timeSlot"
                  value={selectedTimeSlot ? selectedTimeSlot.startTime : ""}
                  onChange={(e) => {
                    const selected = availableTimeSlots.find(
                      (slot) => slot.startTime === e.target.value
                    );
                    setSelectedTimeSlot(selected || null);
                  }}
                  className={`dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
                    !(apptStartDate && branch && service && stylist)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !(apptStartDate && branch && service && stylist) ||
                    isLoadingTimes
                  }
                  required
                >
                  <option value="">Select a time slot</option>
                  {isLoadingTimes ? (
                    <option value="" disabled>
                      Loading available time slots...
                    </option>
                  ) : availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <option key={slot.startTime} value={slot.startTime}>
                        {slot.displayTime}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {apptStartDate && branch && service && stylist
                        ? "No available time slots for this selection"
                        : "Select date, branch, service, and stylist first"}
                    </option>
                  )}
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
              </div>{" "}
              <div className="mt-6">
                {userLoyaltyPoints > 0 && (
                  <div className="mt-2">
                    <label
                      htmlFor="points-slider"
                      className="block text-sm text-gray-700 dark:text-gray-400"
                    >
                      Points to use:{" "}
                      <strong>{useLoyaltyPoints.toFixed(2)}</strong> /{" "}
                      {(userLoyaltyPoints + editpointsused).toFixed(2)}
                    </label>
                    <input
                      id="points-slider"
                      type="range"
                      min={0}
                      max={userLoyaltyPoints + editpointsused}
                      step={1}
                      value={useLoyaltyPoints}
                      onChange={(e) =>
                        setUseLoyaltyPoints(parseInt(e.target.value, 10))
                      }
                      className="mt-1 w-full"
                    />
                  </div>
                )}
              </div>
              {service && (
                <div className="mt-4 text-right">
                  <div className="text-md font-semibold text-gray-700 dark:text-gray-400">
                    Total Price ${servicePrice}
                  </div>
                  {useLoyaltyPoints > 0 && (
                    <>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                        - {useLoyaltyPoints} points applied
                      </div>
                      <div className="text-md font-semibold text-green-600 dark:text-green-400">
                        Final Price: ${finalPrice.toFixed(2)}
                      </div>
                    </>
                  )}
                </div>
              )}
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
                disabled={
                  !apptStartDate || !stylist || !service || !selectedTimeSlot
                }
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
      {/* <div className="mt-8">
        <ComponentCard title="Appointments">
          <ApptTable appointment={apptsalldetails} />
        </ComponentCard>
      </div> */}
    </>
  );
};

export default Calendar;
