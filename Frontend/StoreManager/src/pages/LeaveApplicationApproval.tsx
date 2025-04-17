import React, { useState, useEffect, ReactElement } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Grid,
  Stack,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  alpha,
} from "@mui/material";
import {
  format,
  addDays,
  differenceInDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArticleIcon from "@mui/icons-material/Article";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import PageMeta from "../components/common/PageMeta";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      // Remove 'Bearer ' prefix if it exists, as the backend doesn't expect it
      config.headers.Authorization = token.replace("Bearer ", "");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh the token
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3000"
            }/api/auth/refresh-token`,
            {
              token: refreshToken.replace("Bearer ", ""), // Remove prefix if it exists
            }
          );
          if (response.data.token) {
            sessionStorage.setItem("token", response.data.token);
            // Retry the original request
            const config = error.config;
            config.headers.Authorization = response.data.token;
            return api(config);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
      // If refresh fails or no refresh token, clear everything and redirect
      sessionStorage.clear();
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

interface Staff {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface LeaveRequest {
  _id: string;
  stylist: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  type: LeaveType; // Leave type (Paid/Unpaid)
  reason: string; // The actual reason for leave
  response?: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  image?: string;
}

interface ApiResponse {
  data: {
    leaveRequests: LeaveRequest[];
    staff: Staff[];
  };
  message?: string;
}

type ViewMode = "status" | "type";
type LeaveType = "Paid" | "Unpaid";

interface LeaveRequestCellProps {
  request: LeaveRequest;
  currentDay: Date;
  getCellColor: (request: LeaveRequest) => string;
}

const LeaveRequestCell: React.FC<LeaveRequestCellProps> = ({
  request,
  currentDay,
  getCellColor,
}) => {
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const isOneDay =
    format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd");
  const isFirstDay =
    format(currentDay, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd");
  const isLastDay =
    format(currentDay, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd");
  const isMiddleDay =
    !isOneDay && currentDay > startDate && currentDay < endDate;

  return (
    <Tooltip
      title={`${request.type} (${request.status}): ${format(
        startDate,
        "MMM dd"
      )}${isOneDay ? "" : ` - ${format(endDate, "MMM dd")}`}, ${format(
        startDate,
        "yyyy"
      )}${request.reason ? `\n${request.reason}` : ""}`}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          height: "24px",
          bgcolor: getCellColor(request),
          opacity: 0.8,
          left: isFirstDay ? "8px" : 0,
          right: isLastDay ? "8px" : 0,
          borderRadius: isOneDay
            ? "4px"
            : `${isFirstDay ? "4px" : "0"} ${isLastDay ? "4px" : "0"} ${
                isLastDay ? "4px" : "0"
              } ${isFirstDay ? "4px" : "0"}`,
          zIndex: 1,
          ...(isMiddleDay && {
            left: 0,
            right: 0,
            borderRadius: 0,
          }),
        }}
      />
    </Tooltip>
  );
};

const LeaveManagement = (): ReactElement => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("status");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string[]>([
    "Pending",
    "Approved",
  ]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "Paid",
    "Childcare",
    "Maternity",
    "Paternity",
    "Sick",
    "Unpaid",
  ]);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Calculate days for the calendar
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = addDays(weekStart, 6); // Show 7 days
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const user = useUser();

  useEffect(() => {
    if (!user._id) {
      user.loadUserContext();
    }
  }, [user._id]);
  // Group leave types into categories
  const leaveCategories = {
    "Time Off": ["Paid", "Unpaid"],
    Family: ["Childcare", "Maternity", "Paternity"],
    Medical: ["Sick"],
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          window.location.href = "/signin";
          return;
        }

        const leaveRequestsResponse = await api.get("/api/leave-requests");
        let leaveRequestsData = leaveRequestsResponse.data;

        const stylistIds = [
          ...new Set(leaveRequestsData.map((req: any) => req.stylist)),
        ];
        const stylistsResponse = await api.get("/api/stylists");
        const stylistsData = stylistsResponse.data.filter((x: any) =>
          user.stylists.includes(x._id)
        );

        const stylistMap = stylistsData
          .filter((x: any) => user.stylists.includes(x._id))
          .reduce((acc: any, stylist: any) => {
            acc[stylist._id] = stylist;
            return acc;
          }, {});
        console.log("Stylists Data:", stylistsData);
        console.log("Leave Requests Data:", leaveRequestsData);
        console.log("User Stylists:", user.stylists);
        console.log("Stylist Map:", stylistMap);
        leaveRequestsData = leaveRequestsData
          .filter((x: any) => user.stylists.includes(x.stylist))
          .map((request: any) => ({
            ...request,
            type: request.type || "Paid", // Use the type field directly
            reason: request.reason || "", // Use reason as is
            stylist: stylistMap[request.stylist] || {
              _id: request.stylist,
              name: "Unknown",
              email: "No email",
            },
          }));
        console.log("Filtered Leave Requests Data:", leaveRequestsData);
        setLeaveRequests(leaveRequestsData);
        setStaff(stylistsData);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          setError("Your session has expired. Please sign in again.");
          window.location.href = "/signin";
        } else {
          setError(error.response?.data?.message || "Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [user._id]);

  const handleApprove = async (requestId: string) => {
    try {
      console.log("Approving request:", requestId);
      const response = await api.post(
        `/api/leave-requests/approve/${requestId}`
      );
      console.log("Approve response:", response);

      // Refresh the leave requests list
      const updatedResponse = await api.get("/api/leave-requests");
      setLeaveRequests(updatedResponse.data);
      setError(null);
    } catch (error: any) {
      console.error("Error approving leave request:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      setError(
        error.response?.data?.message || "Failed to approve leave request"
      );
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      console.log("Rejecting request:", requestId);
      const response = await api.post(
        `/api/leave-requests/reject/${requestId}`
      );
      console.log("Reject response:", response);

      // Refresh the leave requests list
      const updatedResponse = await api.get("/api/leave-requests");
      setLeaveRequests(updatedResponse.data);
      setError(null);
    } catch (error: any) {
      console.error("Error rejecting leave request:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      setError(
        error.response?.data?.message || "Failed to reject leave request"
      );
    }
  };

  const getStatusColor = (status: "Pending" | "Approved") => {
    const colors = {
      Pending: "#F97316", // Orange for pending
      Approved: "#22C55E", // Green for approved
    } as const;
    return colors[status] || theme.palette.grey[500];
  };

  const getLeaveTypeColor = (leaveType: string | undefined) => {
    if (!leaveType) return theme.palette.grey[500];

    // Map of leave type variations to their normalized form
    const typeMapping: { [key: string]: LeaveType } = {
      Paid: "Paid",
      paid: "Paid",
      Unpaid: "Unpaid",
      unpaid: "Unpaid",
    };

    // Get the normalized type or use the original if not found in mapping
    const normalizedType = typeMapping[leaveType.toLowerCase()] || leaveType;

    const colors: { [key in LeaveType]: string } = {
      Paid: "#059669", // Green for paid
      // Childcare: "#2563EB",   // Blue for childcare
      // Maternity: "#7C3AED",   // Purple for maternity
      // Paternity: "#6366F1",   // Indigo for paternity
      // Sick: "#DC2626",        // Red for sick
      Unpaid: "#F97316", // Orange for unpaid
    };
    return colors[normalizedType as LeaveType] || theme.palette.grey[500];
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredRequests = leaveRequests.filter((request) =>
    viewMode === "status"
      ? selectedStatus.includes(request.status)
      : selectedTypes.includes(request.type)
  );

  // Update the leave type mapping in the stats section
  const leaveTypeLabels: { [key in LeaveType]: string } = {
    Paid: "Paid",
    // Childcare: "Childcare",
    // Maternity: "Maternity",
    // Paternity: "Paternity",
    // Sick: "Sick",
    Unpaid: "Unpaid",
  };

  // Add type guard to check if a string is a valid LeaveType
  const isValidLeaveType = (type: string): type is LeaveType => {
    return [
      "Paid",
      "Childcare",
      "Maternity",
      "Paternity",
      "Sick",
      "Unpaid",
    ].includes(type);
  };

  const renderStats = () => (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <Typography
        variant="h6"
        className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90"
      >
        Leave to Approve
      </Typography>
      <Typography
        variant="h3"
        color="primary.main"
        className="mb-3 dark:text-white/90"
      >
        {leaveRequests.filter((r) => r.status === "Pending").length}
      </Typography>

      {viewMode === "status" && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              className="font-medium text-gray-800 dark:text-white/90"
            >
              Leave Status
            </Typography>
            <Button
              size="small"
              onClick={() =>
                selectedStatus.length === 2
                  ? setSelectedStatus([])
                  : setSelectedStatus(["Pending", "Approved"])
              }
              className="text-gray-800 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-white/[0.03]"
            >
              {selectedStatus.length === 2 ? "Deselect All" : "Select All"}
            </Button>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {["Pending", "Approved"].map((status) => (
            <Chip
              key={status}
              label={status}
              onClick={() => handleStatusToggle(status)}
              sx={{
                bgcolor: selectedStatus.includes(status)
                  ? getStatusColor(status as "Pending" | "Approved")
                  : theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.grey[700], 0.5)
                    : theme.palette.grey[100],
                  color: selectedStatus.includes(status)
                    ? "white"
                    : theme.palette.text.primary,
                  "&:hover": {
                    bgcolor: selectedStatus.includes(status)
                      ? alpha(getStatusColor(status as "Pending" | "Approved"), 0.8)
                      : theme.palette.mode === 'dark'
                        ? alpha(theme.palette.grey[700], 0.8)
                        : theme.palette.grey[200],
                  },
                }}
              />
            ))}
          </Stack>  
        </Box>
      )}

      {viewMode === "type" && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              className="font-medium text-gray-800 dark:text-white/90"
            >
              Types of Leave
            </Typography>
            <Button
              size="small"
              onClick={() =>
                selectedTypes.length === Object.keys(leaveTypeLabels).length
                  ? setSelectedTypes([])
                  : setSelectedTypes(Object.keys(leaveTypeLabels))
              }
              className="text-gray-800 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-white/[0.03]"
            >
              {selectedTypes.length === Object.keys(leaveTypeLabels).length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </Box>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {Object.entries(leaveTypeLabels).map(([type, label]) => (
              <Chip
                key={type}
                label={label}
                onClick={() => handleTypeToggle(type)}
                className={`border border-gray-200 dark:border-gray-800 ${
                  selectedTypes.includes(type)
                    ? ""
                    : "bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90"
                }`}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );

  const renderQuickApproval = () => {
    const pendingRequests = leaveRequests
      .filter((r) => r.status === "Pending")
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    if (pendingRequests.length === 0) {
      return (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            borderRadius: "12px",
            bgcolor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.info.main, 0.1)
                : undefined,
          }}
        >
          No pending leave requests to approve
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          className="text-gray-800 dark:text-white/90"
        >
          Approval List
        </Typography>
        <Stack spacing={2}>
          {pendingRequests.map((request) => (
            <Card
              key={request._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
                    src={request.stylist?.profilePicture}
                    className="h-12 w-12 bg-primary"
                  >
                    {request.stylist?.name
                      ? request.stylist.name.charAt(0)
                      : "?"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      className="font-medium text-gray-800 dark:text-white/90"
                    >
                      {request.stylist?.name || "Unknown"}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-white/70"
                    >
                      {request.stylist?.email || "No email"}
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {format(new Date(request.startDate), "MMM dd")} -{" "}
                      {format(new Date(request.endDate), "MMM dd, yyyy")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {differenceInDays(
                        new Date(request.endDate),
                        new Date(request.startDate)
                      ) + 1}{" "}
                      days
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      p: 1.5,
                      borderRadius: "8px",
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.grey[800], 0.5)
                          : theme.palette.grey[50],
                    }}
                    className="text-gray-800 dark:text-white/90 dark:bg-transparent border border-gray-200 dark:border-gray-800"
                  >
                    {request.reason || "No reason provided"}
                  </Typography>
                  {request.image && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Supporting Document
                      </Typography>
                      <Box
                        component="img"
                        src={request.image}
                        alt="Supporting document"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          border: "1px solid",
                          borderColor: "divider",
                          p: 1,
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                        }}
                        onClick={() => handleImageZoom(request.image!)}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: "flex-end", gap: 1, p: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(request._id)}
                  startIcon={<CancelIcon />}
                  className="text-gray-800 dark:text-white/90"
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleApprove(request._id)}
                  startIcon={<CheckCircleIcon />}
                  className="text-white dark:text-white/90"
                >
                  Approve
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  };

  const getCellColor = (request: LeaveRequest) => {
    if (viewMode === "status") {
      return getStatusColor(request.status as "Pending" | "Approved");
    }
    return getLeaveTypeColor(request.type);
  };

  // Add this function to handle image zoom
  const handleImageZoom = (image: string) => {
    setZoomedImage(image);
    setImageZoomOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 3,
      }}
      className="dark:bg-transparent"
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" className="text-gray-800 dark:text-white/90">
            Leave Management
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "12px",
              bgcolor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.error.main, 0.1)
                  : undefined,
            }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left column with stats and quick approval */}
          <Grid item xs={12} md={4}>
            {renderStats()}
            {renderQuickApproval()}
          </Grid>

          {/* Right column with calendar */}
          <Grid item xs={12} md={8}>
            <Card className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              {/* Calendar Header */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="h6"
                    className="text-gray-800 dark:text-white/90"
                  >
                    Calendar View
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setCurrentDate((d) => addDays(d, -7))}
                      className="text-gray-800 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-white/[0.03]"
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="body2"
                      className="min-w-[120px] text-center text-gray-800 dark:text-white/90"
                    >
                      {format(weekStart, "d MMM")} -{" "}
                      {format(weekEnd, "d MMM yyyy")}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setCurrentDate((d) => addDays(d, 7))}
                      className="text-gray-800 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-white/[0.03]"
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              {/* Calendar Grid */}
              <Box className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    width: "100%",
                  }}
                  className="dark:bg-transparent dark:text-white"
                >
                  {/* Staff Column */}
                  <Box
                    sx={{
                      borderRight: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                    }}
                    className="dark:bg-transparent dark:text-white"
                  >
                    {/* Staff Header */}
                    <Box
                      sx={{
                        height: "72px",
                        p: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.grey[800], 0.5)
                            : theme.palette.grey[50],
                      }}
                      className="dark:bg-transparent dark:text-white"
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        className="dark:text-white/90 dark:bg-transparent"
                      >
                        Staff
                      </Typography>
                    </Box>

                    {/* Staff List */}
                    {staff.map((member) => (
                      <Box
                        key={member._id}
                        sx={{
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          height: "48px",
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? alpha(theme.palette.common.white, 0.05)
                                : alpha(theme.palette.common.black, 0.02),
                          },
                        }}
                      >
                        <Avatar
                          src={member.profilePicture}
                          sx={{
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                          }}
                        >
                          {member?.name ? member.name.charAt(0) : "?"}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flexGrow: 1,
                          }}
                        >
                          {member?.name || "Unknown"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Calendar Content */}
                  <Box>
                    {/* Days Header */}
                    <Box
                      sx={{
                        height: "72px",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.grey[800], 0.5)
                            : theme.palette.grey[50],
                      }}
                      className="dark:text-white/90 dark:bg-transparent"
                    >
                      <Grid container sx={{ height: "100%" }}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (dayName, i) => (
                            <Grid item xs key={dayName}>
                              <Box
                                sx={{
                                  height: "100%",
                                  p: 1.5,
                                  textAlign: "center",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  borderLeft: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  className="dark:text-white/90 dark:bg-transparent"
                                >
                                  {dayName}
                                </Typography>
                                <Typography variant="body2">
                                  {format(days[i], "d")}
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>

                    {/* Calendar Cells */}
                    {staff.map((member) => (
                      <Grid container key={member._id}>
                        {days.map((day, i) => {
                          const currentDay = new Date(day);
                          currentDay.setHours(0, 0, 0, 0);

                          const dayRequests = leaveRequests.filter((r) => {
                            const startDate = new Date(r.startDate);
                            const endDate = new Date(r.endDate);
                            startDate.setHours(0, 0, 0, 0);
                            endDate.setHours(0, 0, 0, 0);

                            return (
                              r.stylist._id === member._id &&
                              currentDay >= startDate &&
                              currentDay <= endDate &&
                              r.status !== "Rejected" &&
                              (viewMode === "status"
                                ? selectedStatus.includes(r.status)
                                : selectedTypes.includes(r.type))
                            );
                          });

                          return (
                            <Grid item xs key={i}>
                              <Box
                                sx={{
                                  height: "48px",
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  borderLeft: `1px solid ${theme.palette.divider}`,
                                  position: "relative",
                                  "&:hover": {
                                    bgcolor:
                                      theme.palette.mode === "dark"
                                        ? alpha(
                                            theme.palette.common.white,
                                            0.02
                                          )
                                        : alpha(
                                            theme.palette.common.black,
                                            0.02
                                          ),
                                  },
                                }}
                              >
                                {dayRequests.map((request) => (
                                  <LeaveRequestCell
                                    key={request._id}
                                    request={request}
                                    currentDay={currentDay}
                                    getCellColor={getCellColor}
                                  />
                                ))}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Image Zoom Dialog */}
        <Dialog
          open={imageZoomOpen}
          onClose={() => setImageZoomOpen(false)}
          maxWidth={false}
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "hidden",
            },
          }}
          sx={{
            "& .MuiBackdrop-root": {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <IconButton
              onClick={() => setImageZoomOpen(false)}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                color: "white",
                bgcolor: "rgba(0, 0, 0, 0.4)",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            {zoomedImage && (
              <Box
                component="img"
                src={zoomedImage}
                alt="Supporting document"
                sx={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  // Prevent click from bubbling to backdrop
                  e.stopPropagation();
                }}
              />
            )}
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LeaveManagement;
