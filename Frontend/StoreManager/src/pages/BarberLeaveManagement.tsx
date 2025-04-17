import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Badge,
} from "@mui/material";
import {
  format,
  differenceInDays,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axios from "axios";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

interface LeaveStats {
  availableUnpaidLeave: number;
  availablePaidLeave: number;
  usedLeave: number;
}

interface LeaveApplication {
  id: string;
  _id?: string;
  date: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  type: string;
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
  type: string;
  reason: string;
  image?: string;
}

interface ServerHighlight {
  date: Date;
  status: string;
  type: string;
}

const BarberLeaveManagement: React.FC = () => {
  const [leaveStats, setLeaveStats] = useState<LeaveStats>({
    availableUnpaidLeave: 20,
    availablePaidLeave: 30,
    usedLeave: 2,
  });
  const [filter, setFilter] = useState("all");
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [newApplication, setNewApplication] = useState<NewApplication>({
    startDate: "",
    endDate: "",
    type: "paid",
    reason: "",
    image: "",
  });
  const [leaveApplications, setLeaveApplications] = useState<
    LeaveApplication[]
  >([]);
  const [documentSubmissions, setDocumentSubmissions] = useState<
    DocumentSubmission[]
  >([
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
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [highlights, setHighlights] = useState<ServerHighlight[]>([]);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
        type: request.type?.toLowerCase() || "paid",
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
            status: request.status,
            type: request.type,
          });
        }
      });
      setHighlights(newHighlights);

      console.log("Formatted requests:", formattedRequests);
      setLeaveApplications(formattedRequests);
      
      // Add console logs to debug leave stats calculation
      console.log("All requests statuses:", formattedRequests.map((req: LeaveApplication) => req.status));
      console.log("All requests types:", formattedRequests.map((req: LeaveApplication) => req.type));

      // Adjust leave stats based on approved applications
      const approvedApplications = formattedRequests.filter(
        (app: LeaveApplication) => app.status?.toLowerCase?.() === "approved"
      );

      console.log("Approved applications:", approvedApplications);

      let usedPaid = 0;
      let usedUnpaid = 0;

      approvedApplications.forEach((app: LeaveApplication) => {
        console.log("Processing app:", app);
        const leaveType = app.type?.toLowerCase();
        if (leaveType === "paid") {
          usedPaid += app.totalDays;
        } else if (leaveType === "unpaid") {
          usedUnpaid += app.totalDays;
        }
      });

      console.log("Used paid days:", usedPaid);
      console.log("Used unpaid days:", usedUnpaid);

      setLeaveStats({
        availablePaidLeave: 30 - usedPaid,
        availableUnpaidLeave: 20 - usedUnpaid,
        usedLeave: usedPaid + usedUnpaid,
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
    // Validate required fields
    if (
      !newApplication.startDate ||
      !newApplication.endDate ||
      !newApplication.type ||
      !newApplication.reason
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate date range
    const startDate = new Date(newApplication.startDate);
    const endDate = new Date(newApplication.endDate);
    if (startDate > endDate) {
      alert("End date must be after start date");
      return;
    }

    try {
      console.log("Submitting leave application:", newApplication);
      const response = await axios.post(
        `${api_address}/api/leave-requests`,
        {
          startDate: newApplication.startDate,
          endDate: newApplication.endDate,
          type: newApplication.type.toLowerCase(),
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

      // Check if the response contains the created leave request
      if (response.data && response.data._id) {
        alert("Leave application submitted successfully");
        setOpenApplyDialog(false);
        // Reset form
        setNewApplication({
          startDate: "",
          endDate: "",
          type: "paid",
          reason: "",
          image: "",
        });
        // Refresh data
        fetchLeaveRequests();
      } else {
        alert("Failed to submit leave application. Please try again.");
      }
    } catch (error: any) {
      console.error("Error submitting leave application:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit leave application. Please try again later.";
      alert(errorMessage);
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
        alert("Leave request withdrawn successfully");
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
      alert(errorMessage);
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
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Total Leave
        </Typography>
        <Typography variant="caption" color="text.secondary">
          1 Jan 2025 - 31 Dec 2025
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item>
            <Typography variant="body2" color="success.main">
              Available Unpaid Leave
            </Typography>
            <Typography variant="h4">
              {leaveStats.availableUnpaidLeave}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="primary.main">
              Available Paid Leave
            </Typography>
            <Typography variant="h4">
              {leaveStats.availablePaidLeave}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="error.main">
              Used Leave
            </Typography>
            <Typography variant="h4">{leaveStats.usedLeave}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderLeaveApplications = () => {
    console.log("Current leave applications:", leaveApplications);
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

    console.log("Current filter:", filter);
    console.log("Filtered applications:", filteredApplications);

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="approved">Approved</ToggleButton>
            <ToggleButton value="rejected">Rejected</ToggleButton>
          </ToggleButtonGroup>

          <Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 1 }}
              onClick={() => setOpenApplyDialog(true)}
            >
              Leave Application
            </Button>
          </Box>
        </Box>

        {filteredApplications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              No leave requests found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Leave Date
                      </Typography>
                      <Typography>
                        {format(new Date(application.startDate), "dd MMM")} -{" "}
                        {format(new Date(application.endDate), "dd MMM")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Days
                      </Typography>
                      <Typography>{application.totalDays} Days</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography sx={{ textTransform: "capitalize" }}>
                        {application.type} Leave
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          justifyContent: "flex-end",
                        }}
                      >
                        {application.status === "Pending" && (
                          <>
                            <Chip label="Pending" color="warning" />
                            <IconButton
                              onClick={() =>
                                handleWithdrawClick(application.id)
                              }
                              color="error"
                              size="small"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                                },
                              }}
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
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Reason
                  </Typography>
                  <Typography>{application.reason}</Typography>
                  {application.image && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
    <Card>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Leave Management
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {renderLeaveStats()}
          {renderLeaveApplications()}
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slots={{
                  day: CustomPickersDay,
                }}
                sx={{ width: "100%" }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={openApplyDialog}
        onClose={() => setOpenApplyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Apply for Leave
          <IconButton
            aria-label="close"
            onClick={() => setOpenApplyDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Leave Type</InputLabel>
              <Select
                label="Leave Type"
                value={newApplication.type}
                onChange={(e) =>
                  setNewApplication({ ...newApplication, type: e.target.value })
                }
                required
              >
                <MenuItem value="paid">Paid Leave</MenuItem>
                <MenuItem value="unpaid">Unpaid Leave</MenuItem>
              </Select>
            </FormControl>
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
              !newApplication.type ||
              !newApplication.reason
            }
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={imageZoomOpen}
        onClose={() => setImageZoomOpen(false)}
        maxWidth="md"
        fullWidth
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
    </Container>
  );
};

export default BarberLeaveManagement;
