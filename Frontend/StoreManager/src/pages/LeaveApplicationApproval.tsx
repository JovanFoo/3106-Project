import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventIcon from "@mui/icons-material/Event";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import {
  addDays,
  differenceInDays,
  eachDayOfInterval,
  format,
  startOfWeek,
} from "date-fns";
import React, { ReactElement, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContext";
import { Modal } from "../components/ui/modal";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
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
  reason: string;
  response?: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  image?: string;
}

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
      title={`${request.status}: ${format(startDate, "MMM dd")}${
        isOneDay ? "" : ` - ${format(endDate, "MMM dd")}`
      }, ${format(startDate, "yyyy")}${
        request.reason ? `\n${request.reason}` : ""
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
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string[]>([
    "Pending",
    "Approved",
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
    fetchStaff();
  }, [user._id]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const config = {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      };
      if (!token) {
        window.location.href = "/signin";
        return;
      }

      const leaveRequestsResponse = await api.get("/api/leave-requests");
      let leaveRequestsData = leaveRequestsResponse.data;

      // const stylistsResponse = await api.get("/api/stylists");
      const teamsResponse = await axios.get(`${api_address}/api/teams`, config);
      const stylistsData = teamsResponse.data || [];

      const stylistMap = stylistsData
        // .filter((x: any) => user.stylists.includes(x._id))
        .reduce((acc: any, stylist: any) => {
          acc[stylist._id] = stylist;
          return acc;
        }, {});
      // console.log("Stylists Data:", stylistsData);
      // console.log("Leave Requests Data:", leaveRequestsData);
      // console.log("User Stylists:", user.stylists);
      // console.log("Stylist Map:", stylistMap);
      leaveRequestsData = leaveRequestsData.map((request: any) => ({
        ...request,
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

  const fetchStaff = async () => {};
  useEffect(() => {
    fetchLeaveRequests();
  }, [user._id]);

  const handleApprove = async (requestId: string) => {
    try {
      console.log("Approving request:", requestId);
      await api.post(`/api/leave-requests/approve/${requestId}`);
      // console.log("Approve response:", response);
      fetchLeaveRequests();
      // Refresh the leave requests list
      // const updatedResponse = await api.get("/api/leave-requests");
      toast.success("Leave request approved successfully");
      // setLeaveRequests(updatedResponse.data);
      // setError(null);
    } catch (error: any) {
      console.error("Error approving leave request:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      toast.error("Failed to approve leave request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      console.log("Rejecting request:", requestId);
      await api.post(`/api/leave-requests/reject/${requestId}`);
      // console.log("Reject response:", response);

      fetchLeaveRequests();
      // Refresh the leave requests list
      // const updatedResponse = await api.get("/api/leave-requests");
      toast.success("Leave request rejected successfully");
      // setLeaveRequests(updatedResponse.data);
      // setError(null);
    } catch (error: any) {
      console.error("Error rejecting leave request:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      toast.error("Failed to reject leave request");
    }
  };

  const getStatusColor = (status: "Pending" | "Approved") => {
    const colors = {
      Pending: "#F97316", // Orange for pending
      Approved: "#22C55E", // Green for approved
    } as const;
    return colors[status] || theme.palette.grey[500];
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getCellColor = (request: LeaveRequest) => {
    return getStatusColor(request.status as "Pending" | "Approved");
  };

  // Add this function to handle image zoom
  const handleImageZoom = (image: string) => {
    setZoomedImage(image);
    setImageZoomOpen(true);
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
                  : theme.palette.mode === "dark"
                  ? alpha(theme.palette.grey[700], 0.5)
                  : theme.palette.grey[100],
                color: selectedStatus.includes(status)
                  ? "white"
                  : theme.palette.text.primary,
                "&:hover": {
                  bgcolor: selectedStatus.includes(status)
                    ? alpha(
                        getStatusColor(status as "Pending" | "Approved"),
                        0.8
                      )
                    : theme.palette.mode === "dark"
                    ? alpha(theme.palette.grey[700], 0.8)
                    : theme.palette.grey[200],
                },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Card>
  );

  const renderQuickApproval = () => {
    const pendingRequests = leaveRequests
      .filter((r) => r.status === "Pending")
      .filter((r) => {
        return r.stylist._id != user._id;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    if (pendingRequests.length === 0) {
      return (
        <div className=" mt-4 dark:text-white rounded-sm border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          No pending leave requests to approve
        </div>
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
                    <EventIcon
                      fontSize="small"
                      color="action"
                      className="text-gray-800 dark:text-white"
                    />
                    <Typography
                      variant="body2"
                      className="text-gray-800 dark:text-white"
                    >
                      {format(new Date(request.startDate), "MMM dd")} -{" "}
                      {format(new Date(request.endDate), "MMM dd, yyyy")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon
                      fontSize="small"
                      color="action"
                      className="text-gray-800 dark:text-white"
                    />
                    <Typography
                      variant="body2"
                      className="text-gray-800 dark:text-white"
                    >
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
                        className="text-gray-800 dark:text-white"
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
                  className="text-gray-800 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
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

  // if (loading) {
  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         minHeight: "60vh",
  //       }}
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

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
                              selectedStatus.includes(r.status)
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
        <Modal
          isOpen={imageZoomOpen}
          onClose={() => setImageZoomOpen(false)}
          className=" dark:text-white w-fit h-fit max-h-[80vh] p-20 flex justify-center items-center"
        >
          {zoomedImage && (
            <div>
              <DialogTitle>
                Supporting Document
                {/* <IconButton
              aria-label="close"
              onClick={() => setImageZoomOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton> */}
              </DialogTitle>
              <Box
                component="img"
                src={zoomedImage}
                alt="Supporting document"
                sx={{
                  height: "auto",
                  width: "auto",
                  maxWidth: "60vw",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
                onClick={(e) => {
                  // Prevent click from bubbling to backdrop
                  e.stopPropagation();
                }}
              />
            </div>
          )}
          {/* </Box> */}
        </Modal>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          style={{ zIndex: 999999 }}
        />
      </Container>
    </Box>
  );
};

export default LeaveManagement;
