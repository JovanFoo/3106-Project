const LeaveRequest = require("../models/LeaveRequest");
const Appointment = require("../models/Appointment");
const Stylist = require("../models/Stylist");
const Service = require("../models/Service");
const Customer = require("../models/Customer");

const CalendarEventController = {
  async getStylistsCalendarEvent(req, res) {
    console.log("CalendarEventController > getCalendarEvents");
    try {
      let events = [];
      const stylistId = req.userId;
      const { currentYear, currentMonth } = req.query;
      console.log("currentYear:", currentYear);
      console.log("currentMonth:", currentMonth);
      const startDate = new Date(
        Number(currentYear),
        Number(currentMonth) - 1,
        1
      );
      const endDate = new Date(
        Number(currentYear),
        Number(currentMonth) + 2,
        -1
      );
      console.log("startDate:", startDate);
      console.log("endDate:", endDate);
      const stylist = await Stylist.findById(stylistId)
        .populate("leaveRequests")
        .populate("appointments");
      if (!stylist) {
        return res.status(404).json({ message: "Stylist not found" });
      } else {
        console.log("stylist:", stylist);
      }
      const leaveRequests = stylist.leaveRequests.filter(
        (leave) =>
          leave.status === "approved" &&
          leave.startDate >= startDate &&
          leave.endDate <= endDate
      );
      const appointments = stylist.appointments.filter((appointment) => {
        return appointment.date >= startDate && appointment.date <= endDate;
      });
      const appointmentsWithCustomer = await Promise.all(
        appointments.map(async (appointment) => {
          const customer = await Customer.findOne({
            appointments: appointment._id,
          });
          if (!customer) return null;
          const appointmentn = await Appointment.findById(
            appointment._id
          ).populate("service");
          if (!appointmentn) return null;
          const service = await Service.findById(appointmentn.service);
          if (!service) return null;
          const appointmentStartDate = new Date(appointmentn.date);
          let appointmentEndDate = new Date(appointment.date);
          appointmentEndDate.setMinutes(
            appointmentEndDate.getMinutes() + service.duration
          );
          return {
            id: appointmentn._id,
            start: appointmentStartDate,
            end: appointmentEndDate,
            title: "Appointment",
            description: `${customer.name} - ${service.name}`,
            type: "Appointment",
          };
        })
      );
      const leaveEvents = leaveRequests.map((leave) => {
        const leaveStartDate = new Date(leave.startDate);
        const leaveEndDate = new Date(leave.endDate);
        return {
          id: leave._id,
          start: leaveStartDate,
          end: leaveEndDate,
          title: "Leave",
          description: `${leave.description} approved by ${leave.approvedBy.name}`,
          type: "Leave",
        };
      });
      events = [...leaveEvents, ...appointmentsWithCustomer].filter(Boolean);
      console.log("events:", events);
      return res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
module.exports = CalendarEventController;
// class CalendarEvent {
//   start: Date;
//   end: Date;
//   title: string;
//   description: string;
//   stylist: string;
// }
