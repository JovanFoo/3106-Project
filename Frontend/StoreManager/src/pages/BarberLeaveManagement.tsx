import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import axios from "axios";
import {
  differenceInDays,
  format,
  isSameDay,
  parseISO
} from "date-fns";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from "../components/ui/modal";


const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

interface LeaveStats {
  totalLeave: number;
  usedLeave: number;
  availableLeave: number;
}

interface LeaveApplication {
  id: string;
  _id?: string;
  date: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  reason: string;
  image?: string;
}

interface DocumentSubmission {
  type: string;
  leaveDate: string;
  dueDate: string;
  attachments: number;
  comments: number;
}

interface NewApplication {
  startDate: string;
  endDate: string;
  reason: string;
  image?: string;
}

interface ServerHighlight {
  date: Date;
  status: string;
}

const BarberLeaveManagement: React.FC = () => {
  const [leaveStats, setLeaveStats] = useState<LeaveStats>({
    totalLeave: 30,
    usedLeave: 0,
    availableLeave: 30
  });
  const [filter, setFilter] = useState("all");
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [newApplication, setNewApplication] = useState<NewApplication>({
    startDate: "",
    endDate: "",
    reason: "",
    image: "",
  });
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [documentSubmissions, setDocumentSubmissions] = useState<DocumentSubmission[]>([
    {
      type: "Medical Certificate",
      leaveDate: "2024-12-20",
      dueDate: "2025-01-10",
      attachments: 2,
      comments: 13,
    },
    {
      type: "Death Certificate",
      leaveDate: "2024-12-31",
      dueDate: "2025-01-17",
      attachments: 1,
      comments: 5,
    },
  ]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<ServerHighlight[]>([]);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const theme = useTheme();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const fetchLeaveRequests = async () => {
    try {
      console.log("Fetching leave requests...");
      const response = await axios.get(
        `${api_address}/api/leave-requests/my-leave-requests`,
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      console.log("Leave requests response:", response.data);
      const requests = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      const formattedRequests = requests.map((request: any) => ({
        id: request._id,
        date: format(new Date(request.createdAt || new Date()), "yyyy-MM-dd"),
        startDate: format(new Date(request.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(request.endDate), "yyyy-MM-dd"),
        totalDays:
          differenceInDays(
            new Date(request.endDate),
            new Date(request.startDate)
          ) + 1,
        status: request.status || "Pending",
        reason: request.reason || "",
        image: request.image || "",
      }));

      // Update calendar highlights
      const newHighlights: ServerHighlight[] = [];
      formattedRequests.forEach((request: any) => {
        const start = parseISO(request.startDate);
        const end = parseISO(request.endDate);
        const days = differenceInDays(end, start) + 1;

        for (let i = 0; i < days; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          newHighlights.push({
            date,
            status: request.status
          });
        }
      });
      setHighlights(newHighlights);

      console.log("Formatted requests:", formattedRequests);
      setLeaveApplications(formattedRequests);
      
      // Calculate total used leave days
      const approvedApplications = formattedRequests.filter(
        (app: LeaveApplication) => app.status?.toLowerCase?.() === "approved"
      );

      const totalUsedDays = approvedApplications.reduce(
        (total: number, app: LeaveApplication) => total + app.totalDays,
        0
      );

      setLeaveStats({
        totalLeave: 30,
        usedLeave: totalUsedDays,
        availableLeave: 30 - totalUsedDays
      });
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setLeaveApplications([]);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewApplication({ ...newApplication, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyLeave = async () => {
    if (!newApplication.startDate || !newApplication.endDate || !newApplication.reason) {
      toast.warning("Please fill in all required fields");
      return;
    }

    const startDate = new Date(newApplication.startDate);
    const endDate = new Date(newApplication.endDate);
    if (startDate > endDate) {
      toast.warning("End date must be after start date");
      return;
    }

    try {
      console.log("Submitting leave application:", newApplication);
      const response = await axios.post(
        `${api_address}/api/leave-requests`,
        {
          startDate: newApplication.startDate,
          endDate: newApplication.endDate,
          reason: newApplication.reason,
          image: newApplication.image,
        },
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      console.log("Leave application response:", response.data);

      if (response.data && response.data._id) {
        toast.success("Leave application submitted successfully");
        setOpenApplyDialog(false);
        setNewApplication({
          startDate: "",
          endDate: "",
          reason: "",
          image: "",
        });
        fetchLeaveRequests();
      } else {
        toast.error("Failed to submit leave application. Please try again.");
      }
    } catch (error: any) {
      console.error("Error submitting leave application:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit leave application. Please try again later.";
      toast.error(errorMessage);
    }
  };

  const handleWithdrawClick = (requestId: string) => {
    console.log("Selected request ID for withdrawal:", requestId);
    setSelectedRequestId(requestId);
    setWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedRequestId) {
      console.error("No request ID selected for withdrawal");
      return;
    }

    try {
      console.log("Attempting to withdraw leave request:", selectedRequestId);
      const response = await axios.delete(
        `${api_address}/api/leave-requests/${selectedRequestId}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      console.log("Withdraw response:", response);
      setWithdrawDialogOpen(false);
      setSelectedRequestId(null);

      if (response.status === 200 || response.status === 204) {
        toast.success("Leave request withdrawn successfully");
        fetchLeaveRequests();
      } else {
        throw new Error("Failed to withdraw leave request");
      }
    } catch (error: any) {
      console.error("Error withdrawing leave request:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to withdraw leave request. Please try again later.";
      toast.error(errorMessage);
      setWithdrawDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const CustomPickersDay = (props: PickersDayProps<Date>) => {
    const { day, ...other } = props;
    const matchingHighlight = highlights.find((highlight) =>
      isSameDay(highlight.date, day)
    );

    if (!matchingHighlight) {
      return <PickersDay day={day} {...other} />;
    }

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "approved":
          return "rgba(76, 175, 80, 0.3)"; // Translucent green
        case "rejected":
          return "rgba(244, 67, 54, 0.3)"; // Translucent red
        case "pending":
          return "rgba(255, 152, 0, 0.3)"; // Translucent orange
        default:
          return "rgba(117, 117, 117, 0.3)"; // Translucent grey
      }
    };

    return (
      <PickersDay
        day={day}
        {...other}
        sx={{
          backgroundColor: getStatusColor(matchingHighlight.status),
          "&:hover": {
            backgroundColor: getStatusColor(matchingHighlight.status),
          },
          "&.Mui-selected": {
            backgroundColor: `${getStatusColor(
              matchingHighlight.status
            )} !important`,
          },
          position: "relative",
          zIndex: 1,
        }}
      />
    );
  };

  const renderLeaveStats = () => (
    <Card
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "16px",
        boxShadow: theme.shadows[0],
        border: `1px solid ${theme.palette.divider}`,
      }}
      className="dark:bg-white/[0.03] dark:border-gray-800"
    >
      <CardContent>
        <Typography variant="h6" gutterBottom className="dark:text-white/90">
          Leave Balance
        </Typography>
        <Typography variant="caption" className="dark:text-white/70">
          1 Jan 2025 - 31 Dec 2025
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item>
            <Typography variant="body2" className="dark:text-white/70">
              Total Leave Days
            </Typography>
            <Typography variant="h4" className="dark:text-white/90">
              {leaveStats.totalLeave}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" className="dark:text-white/70">
              Available Leave
            </Typography>
            <Typography variant="h4" className="dark:text-white/90">
              {leaveStats.availableLeave}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" className="dark:text-white/70">
              Used Leave
            </Typography>
            <Typography variant="h4" className="dark:text-white/90">
              {leaveStats.usedLeave}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderLeaveApplications = () => {
    const filteredApplications = leaveApplications.filter((application) => {
      if (filter === "all") return true;
      if (filter === "pending")
        return application.status.toLowerCase() === "pending";
      if (filter === "approved")
        return application.status.toLowerCase() === "approved";
      if (filter === "rejected")
        return application.status.toLowerCase() === "rejected";
      return true;
    });

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            className="dark:border-gray-800"
          >
            <ToggleButton 
              value="all" 
              className="dark:bg-white/[0.03] dark:text-white/90 dark:border-gray-800 dark:hover:bg-white/[0.08]"
            >
              ALL
            </ToggleButton>
            <ToggleButton 
              value="pending" 
              className="dark:bg-white/[0.03] dark:text-white/90 dark:border-gray-800 dark:hover:bg-white/[0.08]"
            >
              PENDING
            </ToggleButton>
            <ToggleButton 
              value="approved" 
              className="dark:bg-white/[0.03] dark:text-white/90 dark:border-gray-800 dark:hover:bg-white/[0.08]"
            >
              APPROVED
            </ToggleButton>
            <ToggleButton 
              value="rejected" 
              className="dark:bg-white/[0.03] dark:text-white/90 dark:border-gray-800 dark:hover:bg-white/[0.08]"
            >
              REJECTED
            </ToggleButton>
          </ToggleButtonGroup>

          <Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 1 }}
              onClick={() => setOpenApplyDialog(true)}
              className="dark:text-white/90"
            >
              LEAVE APPLICATION
            </Button>
          </Box>
        </Box>

        {filteredApplications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography className="dark:text-white/70">
              No leave requests found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredApplications.map((application) => (
              <Card key={application.id} className="dark:bg-white/[0.03] dark:border-gray-800">
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" className="dark:text-white/70">
                        Leave Date
                      </Typography>
                      <Typography className="dark:text-white/90">
                        {format(new Date(application.startDate), "dd MMM")} -{" "}
                        {format(new Date(application.endDate), "dd MMM")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" className="dark:text-white/70">
                        Total Days
                      </Typography>
                      <Typography className="dark:text-white/90">
                        {application.totalDays} Days
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}>
                        {application.status === "Pending" && (
                          <>
                            <Chip label="Pending" color="warning" />
                            <IconButton
                              onClick={() => handleWithdrawClick(application.id)}
                              color="error"
                              size="small"
                              className="dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </>
                        )}
                        {application.status === "Approved" && (
                          <Chip label="Approved" color="success" />
                        )}
                        {application.status === "Rejected" && (
                          <Chip label="Rejected" color="error" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle2" sx={{ mt: 2 }} className="dark:text-white/70">
                    Reason
                  </Typography>
                  <Typography className="dark:text-white/90">{application.reason}</Typography>
                  {application.image && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" className="dark:text-white/70" gutterBottom>
                        Supporting Document
                      </Typography>
                      <Box 
                        component="img" 
                        src={application.image} 
                        alt="Supporting document" 
                        sx={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: 'divider',
                          p: 1,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          }
                        }} 
                        onClick={() => handleImageZoom(application.image!)}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Dialog
          open={withdrawDialogOpen}
          onClose={() => {
            setWithdrawDialogOpen(false);
            setSelectedRequestId(null);
          }}
        >
          <DialogTitle>Withdraw Leave Request</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to withdraw this leave request? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setWithdrawDialogOpen(false);
                setSelectedRequestId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWithdraw}
              variant="contained"
              color="error"
            >
              Withdraw
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  const renderPendingDocuments = () => (
    <Card
      sx={{
        p: 3,
        borderRadius: "16px",
        boxShadow: theme.shadows[0],
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
      className="dark:bg-transparent dark:text-white"
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pending Document Submissions
        </Typography>
        <Stack spacing={3}>
          {documentSubmissions.map((doc, index) => (
            <Box key={index}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{doc.type}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave Date:{" "}
                    {format(new Date(doc.leaveDate), "dd MMMM yyyy")}
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreHorizIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" color="error.main">
                  {format(new Date(doc.dueDate), "dd MMMM yyyy")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2">📎 {doc.attachments}</Typography>
                  <Typography variant="body2">💬 {doc.comments}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  const handleImageZoom = (image: string) => {
    setZoomedImage(image);
    setImageZoomOpen(true);
  };

  return (
    <Box
      sx={{
        bgcolor:
          theme.palette.mode === "dark"
            ? "#1a1f2c" // Dark navy background
            : theme.palette.grey[50],
        minHeight: "100vh",
        py: 3,
        color: theme.palette.mode === "dark" ? "#fff" : "inherit",
      }}
      className="dark:bg-transparent dark:text-white"
    >
      <Container maxWidth="xl" className="dark:bg-transparent dark:text-white">
        <Box sx={{ mb: 4 }} className="dark:bg-transparent dark:text-white">
          <Typography variant="h4" gutterBottom sx={{ color: "inherit" }} className="dark:text-white">
            Leave Management
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {renderLeaveStats()}
            {renderLeaveApplications()}
          </Grid>
          <Grid item xs={12} md={4} className="dark:bg-transparent dark:text-white">
            <Box sx={{ mb: 4 }} className="dark:bg-white/[0.03] dark:border-gray-800 rounded-2xl">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slots={{
                    day: CustomPickersDay,
                  }}
                  sx={{
                    width: "100%",
                    '& .MuiPickersDay-root': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9) !important' : 'inherit',
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7) !important' : 'inherit',
                    },
                    '& .MuiPickersCalendarHeader-label': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9) !important' : 'inherit',
                    },
                    '& .MuiPickersCalendarHeader-switchViewButton': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9) !important' : 'inherit',
                    },
                    '& .MuiPickersArrowSwitcher-button': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9) !important' : 'inherit',
                    },
                  }}
                  className="dark:bg-transparent"
                />
              </LocalizationProvider>
            </Box>
          </Grid>
        </Grid>

        <Modal
          isOpen={openApplyDialog}
          onClose={() => setOpenApplyDialog(false)}
          // maxWidth="sm"
          // fullWidth
          className="max-w-[600px] p-6 dark:bg-transparent dark:text-white"
        >
          <div className="dark:bg-transparent dark:text-white">
          <DialogTitle>
            Apply for Leave
            {/* <IconButton
              aria-label="close"
              onClick={() => setOpenApplyDialog(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            > */}
              {/* <CloseIcon />
            </IconButton> */}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newApplication.startDate}
                onChange={(e) =>
                  setNewApplication({
                    ...newApplication,
                    startDate: e.target.value,
                  })
                }
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newApplication.endDate}
                onChange={(e) =>
                  setNewApplication({
                    ...newApplication,
                    endDate: e.target.value,
                  })
                }
                inputProps={{
                  min:
                    newApplication.startDate ||
                    new Date().toISOString().split("T")[0],
                }}
              />
              <TextField
                label="Reason"
                multiline
                rows={4}
                fullWidth
                required
                value={newApplication.reason}
                onChange={(e) =>
                  setNewApplication({ ...newApplication, reason: e.target.value })
                }
              />
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Upload Supporting Document
                  </Button>
                </label>
                {newApplication.image && (
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <img
                      src={newApplication.image}
                      alt="Uploaded document"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenApplyDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleApplyLeave}
              disabled={
                !newApplication.startDate ||
                !newApplication.endDate ||
                !newApplication.reason
              }
            >
              Submit Application
            </Button>
          </DialogActions>
          </div>
        </Modal>

        <Dialog
          open={imageZoomOpen}
          onClose={() => setImageZoomOpen(false)}
          maxWidth="md"
          fullWidth
          className="dark:bg-transparent dark:text-white"
        >
          <DialogTitle>
            Supporting Document
            <IconButton
              aria-label="close"
              onClick={() => setImageZoomOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {zoomedImage && (
              <Box
                component="img"
                src={zoomedImage}
                alt="Supporting document"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </DialogContent>
        </Dialog>
        <ToastContainer position="bottom-right" autoClose={3000} style={{ zIndex: 999999 }} />
      </Container>
    </Box>
  );
};

export default BarberLeaveManagement;
