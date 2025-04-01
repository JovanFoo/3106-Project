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
import axios from "axios";
import PageMeta from "../components/common/PageMeta";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";

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
  reason: LeaveType;  // This is actually the leave type (backward compatibility)
  description?: string; // Optional field for actual reason
  type: LeaveType;     // This will be same as reason for now (backward compatibility)
  response?: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
}

interface ApiResponse {
  data: {
    leaveRequests: LeaveRequest[];
    staff: Staff[];
  };
  message?: string;
}

type ViewMode = "status" | "type";
type LeaveType = "Paid" | "Childcare" | "Maternity" | "Paternity" | "Sick" | "Unpaid";

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

  // Group leave types into categories
  const leaveCategories = {
    "Time Off": ["Paid", "Unpaid"],
    "Family": ["Childcare", "Maternity", "Paternity"],
    "Medical": ["Sick"],
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        // Check if we have a token
        const token = sessionStorage.getItem("token");
        if (!token) {
          window.location.href = "/signin";
          return;
        }

        // Fetch leave requests
        const leaveRequestsResponse = await api.get("/api/leave-requests");
        let leaveRequestsData = leaveRequestsResponse.data;

        // Get unique stylist IDs from leave requests
        const stylistIds = [...new Set(leaveRequestsData.map((req: any) => req.stylist))];
        
        // Fetch stylist details for each ID
        const stylistsResponse = await api.get("/api/stylists");
        const stylistsData = stylistsResponse.data;
        
        // Create a map of stylist details by ID
        const stylistMap = stylistsData.reduce((acc: any, stylist: any) => {
          acc[stylist._id] = stylist;
          return acc;
        }, {});

        // Merge stylist details with leave requests
        leaveRequestsData = leaveRequestsData.map((request: any) => ({
          ...request,
          type: request.reason || 'Paid Time Off', // Use reason as the leave type
          stylist: stylistMap[request.stylist] || {
            _id: request.stylist,
            name: 'Unknown',
            email: 'No email'
          }
        }));

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
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      console.log('Approving request:', requestId);
      const response = await api.post(`/api/leave-requests/approve/${requestId}`);
      console.log('Approve response:', response);
      
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
      console.log('Rejecting request:', requestId);
      const response = await api.post(`/api/leave-requests/reject/${requestId}`);
      console.log('Reject response:', response);
      
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
      'Paid': 'Paid',
      'paid': 'Paid',
      'Childcare': 'Childcare',
      'childcare': 'Childcare',
      'Maternity': 'Maternity',
      'maternity': 'Maternity',
      'Paternity': 'Paternity',
      'paternity': 'Paternity',
      'Sick': 'Sick',
      'sick': 'Sick',
      'Unpaid': 'Unpaid',
      'unpaid': 'Unpaid'
    };

    // Get the normalized type or use the original if not found in mapping
    const normalizedType = typeMapping[leaveType.toLowerCase()] || leaveType;
    
    const colors: { [key in LeaveType]: string } = {
      Paid: "#059669",        // Green for paid
      Childcare: "#2563EB",   // Blue for childcare
      Maternity: "#7C3AED",   // Purple for maternity
      Paternity: "#6366F1",   // Indigo for paternity
      Sick: "#DC2626",        // Red for sick
      Unpaid: "#F97316"       // Orange for unpaid
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

  const filteredRequests = leaveRequests.filter(
    (request) =>
      (viewMode === "status" 
        ? selectedStatus.includes(request.status)
        : selectedTypes.includes(request.reason))
  );

  // Update the leave type mapping in the stats section
  const leaveTypeLabels: { [key in LeaveType]: string } = {
    Paid: "Paid",
    Childcare: "Childcare",
    Maternity: "Maternity",
    Paternity: "Paternity",
    Sick: "Sick",
    Unpaid: "Unpaid"
  };

  // Add type guard to check if a string is a valid LeaveType
  const isValidLeaveType = (type: string): type is LeaveType => {
    return ['Paid', 'Childcare', 'Maternity', 'Paternity', 'Sick', 'Unpaid'].includes(type);
  };

  const renderStats = () => (
    <Card
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "16px",
        boxShadow: theme.shadows[0],
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" sx={{ fontSize: '1.5rem' }} gutterBottom>
        Leave to Approve
      </Typography>
      <Typography variant="h3" color="primary.main" sx={{ mb: 3 }}>
        {leaveRequests.filter((r) => r.status === "Pending").length}
      </Typography>

      {viewMode === "status" && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Leave Status
            </Typography>
            <Button
              size="small"
              onClick={() => 
                selectedStatus.length === 2 
                  ? setSelectedStatus([])
                  : setSelectedStatus(["Pending", "Approved"])
              }
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
                    : "grey.100",
                  color: selectedStatus.includes(status)
                    ? "white"
                    : "text.primary",
                  "&:hover": {
                    bgcolor: selectedStatus.includes(status)
                      ? alpha(
                          getStatusColor(status as "Pending" | "Approved"),
                          0.8
                        )
                      : "grey.200",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {viewMode === "type" && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Types of Leave
            </Typography>
            <Button
              size="small"
              onClick={() => 
                selectedTypes.length === Object.keys(leaveTypeLabels).length
                  ? setSelectedTypes([])
                  : setSelectedTypes(Object.keys(leaveTypeLabels))
              }
            >
              {selectedTypes.length === Object.keys(leaveTypeLabels).length ? "Deselect All" : "Select All"}
            </Button>
          </Box>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {Object.entries(leaveTypeLabels).map(([type, label]) => (
              <Chip
                key={type}
                label={label}
                onClick={() => handleTypeToggle(type)}
                sx={{
                  bgcolor: selectedTypes.includes(type)
                    ? getLeaveTypeColor(type)
                    : "grey.100",
                  color: selectedTypes.includes(type)
                    ? "white"
                    : "text.primary",
                  "&:hover": {
                    bgcolor: selectedTypes.includes(type)
                      ? alpha(getLeaveTypeColor(type), 0.8)
                      : "grey.200",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );

  const renderCalendarHeader = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    const weekEnd = addDays(weekStart, 6); // Show 7 days

    return (
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Calendar View
        </Typography>
        <Box
          sx={{
            display: "flex",
            bgcolor: "#F3F4F6",
            borderRadius: "8px",
            p: 0.5,
          }}
        >
          <Button
            variant={viewMode === "status" ? "contained" : "text"}
            onClick={() => setViewMode("status")}
            sx={{
              minWidth: 120,
              bgcolor: viewMode === "status" ? "white" : "transparent",
              color: viewMode === "status" ? "text.primary" : "text.secondary",
              boxShadow: viewMode === "status" ? 1 : 0,
              "&:hover": {
                bgcolor: viewMode === "status" ? "white" : "grey.200",
              },
            }}
          >
            LEAVE STATUS
          </Button>
          <Button
            variant={viewMode === "type" ? "contained" : "text"}
            onClick={() => setViewMode("type")}
            sx={{
              minWidth: 120,
              bgcolor: viewMode === "type" ? "white" : "transparent",
              color: viewMode === "type" ? "text.primary" : "text.secondary",
              boxShadow: viewMode === "type" ? 1 : 0,
              "&:hover": {
                bgcolor: viewMode === "type" ? "white" : "grey.200",
              },
            }}
          >
            LEAVE TYPES
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <IconButton onClick={() => setCurrentDate((d) => addDays(d, -7))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography>
            {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
          </Typography>
          <IconButton onClick={() => setCurrentDate((d) => addDays(d, 7))}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderCalendar = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    const weekEnd = addDays(weekStart, 6); // Show 7 days
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <Card
        sx={{
          p: 3,
          borderRadius: "16px",
          boxShadow: theme.shadows[0],
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {renderCalendarHeader()}
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 900 }}>
            <Grid container>
              {/* Header row with days */}
              <Grid item xs={2}>
                <Box
                  sx={{
                    p: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Staff
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Grid container>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, i) => (
                      <Grid item xs key={day}>
                        <Box
                          sx={{
                            p: 1,
                            textAlign: "center",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {day}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {format(days[i], "d")}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  )}
                </Grid>
              </Grid>

              {/* Staff rows */}
              {staff.map((member) => (
                <React.Fragment key={member._id}>
                  <Grid item xs={2}>
                    <Box
                      sx={{
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        minHeight: "48px",
                      }}
                    >
                      <Avatar
                        src={member.profilePicture}
                        sx={{
                          width: 32,
                          height: 32,
                          flexShrink: 0,
                        }}
                      >
                        {member?.name ? member.name.charAt(0) : '?'}
                      </Avatar>
                      <Tooltip title={member?.name || 'Unknown'} placement="right-start">
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "calc(100% - 40px)", // Account for avatar width
                            cursor: "pointer",
                          }}
                        >
                          {member?.name || 'Unknown'}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={10}>
                    <Grid container>
                      {days.map((day, i) => {
                        // Set current day to midnight for comparison
                        const currentDay = new Date(day);
                        currentDay.setHours(0, 0, 0, 0);

                        const dayRequests = leaveRequests.filter((r) => {
                          // Set request dates to midnight
                          const startDate = new Date(r.startDate);
                          const endDate = new Date(r.endDate);
                          startDate.setHours(0, 0, 0, 0);
                          endDate.setHours(0, 0, 0, 0);

                          return (
                            r.stylist._id === member._id &&
                            currentDay >= startDate &&
                            currentDay <= endDate &&
                            (viewMode === "status"
                              ? selectedStatus.includes(r.status)
                              : selectedTypes.includes(r.reason))
                          );
                        });

                        return (
                          <Grid item xs key={i}>
                            <Box
                              sx={{
                                p: 1,
                                height: "48px",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                position: "relative",
                              }}
                            >
                              {dayRequests.map((request) => {
                                const startDate = new Date(request.startDate);
                                const endDate = new Date(request.endDate);
                                startDate.setHours(0, 0, 0, 0);
                                endDate.setHours(0, 0, 0, 0);

                                const isOneDay = format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
                                const isFirstDay = format(currentDay, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
                                const isLastDay = format(currentDay, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
                                const isMiddleDay = !isOneDay && currentDay > startDate && currentDay < endDate;

                                return (
                                  <Tooltip
                                    key={request._id}
                                    title={`${request.reason} (${
                                      request.status
                                    }): ${format(
                                      startDate,
                                      "MMM dd"
                                    )}${isOneDay ? '' : ` - ${format(
                                      endDate,
                                      "MMM dd"
                                    )}`}, ${format(
                                      startDate,
                                      "yyyy"
                                    )}${
                                      request.description ? `\n${request.description}` : ''
                                    }`}
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
                                        borderRadius: isOneDay ? "4px" : `${
                                          isFirstDay ? "4px" : "0"
                                        } ${isLastDay ? "4px" : "0"} ${
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
                              })}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        </Box>
      </Card>
    );
  };

  const renderQuickApproval = () => {
    const pendingRequests = leaveRequests
      .filter((r) => r.status === "Pending")
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (pendingRequests.length === 0) {
      return (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            borderRadius: "12px",
          }}
        >
          No pending leave requests to approve
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Approval
        </Typography>
        <Grid container spacing={2}>
          {pendingRequests.map((request) => (
            <Grid item xs={12} key={request._id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: theme.shadows[0],
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2],
                  },
                }}
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
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {request.stylist?.name ? request.stylist.name.charAt(0) : '?'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {request.stylist?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.stylist?.email || 'No email'}
                      </Typography>
                    </Box>
                    <Chip
                      label={request.reason}
                      size="small"
                      sx={{
                        bgcolor: getLeaveTypeColor(request.reason),
                        color: "white",
                        fontWeight: "medium",
                        borderRadius: "8px",
                      }}
                    />
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
                        bgcolor: theme.palette.grey[50],
                      }}
                    >
                      {request.description || 'No additional details provided'}
                    </Typography>
                  </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: "flex-end", gap: 1, p: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleReject(request._id)}
                    startIcon={<CancelIcon />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleApprove(request._id)}
                    startIcon={<CheckCircleIcon />}
                  >
                    Approve
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const getCellColor = (request: LeaveRequest) => {
    if (viewMode === "status") {
      return getStatusColor(request.status as "Pending" | "Approved");
    }
    return getLeaveTypeColor(request.reason);
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
    <Box sx={{ bgcolor: theme.palette.grey[50], minHeight: "100vh", py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Leave Management
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {renderStats()}
            {renderQuickApproval()}
          </Grid>
          <Grid item xs={12} md={8}>
            {renderCalendar()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LeaveManagement;
