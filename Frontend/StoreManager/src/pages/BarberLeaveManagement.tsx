import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { format, differenceInDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import axios from 'axios';

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;

interface LeaveStats {
  availableUnpaidLeave: number;
  availablePaidLeave: number;
  usedLeave: number;
}

interface LeaveApplication {
  id: string;
  date: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  type: string;
  reason: string;
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
  const [filter, setFilter] = useState('all');
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [newApplication, setNewApplication] = useState<NewApplication>({
    startDate: '',
    endDate: '',
    type: 'paid',
    reason: ''
  });
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [documentSubmissions, setDocumentSubmissions] = useState<DocumentSubmission[]>([
    {
      type: 'Medical Certificate',
      leaveDate: '2024-12-20',
      dueDate: '2025-01-10',
      attachments: 2,
      comments: 13
    },
    {
      type: 'Death Certificate',
      leaveDate: '2024-12-31',
      dueDate: '2025-01-17',
      attachments: 1,
      comments: 5
    }
  ]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<ServerHighlight[]>([]);

  const fetchLeaveBalance = async () => {
    try {
      console.log('Fetching leave balance...');
      const response = await axios.get(`${api_address}/api/leave-requests/balance`, {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      });
      
      console.log('Leave balance response:', response.data);
      if (response.data.success) {
        setLeaveStats({
          availableUnpaidLeave: response.data.data.availableUnpaidLeave || 20,
          availablePaidLeave: response.data.data.availablePaidLeave || 30,
          usedLeave: response.data.data.usedPaidLeave + response.data.data.usedUnpaidLeave || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      // Set default values if fetch fails
      setLeaveStats({
        availableUnpaidLeave: 20,
        availablePaidLeave: 30,
        usedLeave: 0,
      });
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      console.log('Fetching leave requests...');
      const response = await axios.get(`${api_address}/api/leave-requests/my-leave-requests`, {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      });
      
      console.log('Leave requests response:', response.data);
      const requests = Array.isArray(response.data) ? response.data : [];
      const formattedRequests = requests.map((request: any) => ({
        id: request._id,
        date: format(new Date(request.createdAt || new Date()), 'yyyy-MM-dd'),
        startDate: format(new Date(request.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(request.endDate), 'yyyy-MM-dd'),
        totalDays: differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1,
        status: request.status || 'Pending',
        type: request.type || 'paid',
        reason: request.reason || ''
      }));

      // Update calendar highlights
      const newHighlights: ServerHighlight[] = [];
      formattedRequests.forEach(request => {
        const start = parseISO(request.startDate);
        const end = parseISO(request.endDate);
        const days = differenceInDays(end, start) + 1;
        
        for (let i = 0; i < days; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          newHighlights.push({
            date,
            status: request.status,
            type: request.type
          });
        }
      });
      setHighlights(newHighlights);
      
      console.log('Formatted requests:', formattedRequests);
      setLeaveApplications(formattedRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveApplications([]);
    }
  };

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveRequests();
  }, []);

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleApplyLeave = async () => {
    try {
      const response = await axios.post(
        `${api_address}/api/leave/apply`,
        {
          startDate: newApplication.startDate,
          endDate: newApplication.endDate,
          type: newApplication.type,
          reason: newApplication.reason
        },
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      
      if (response.data.success) {
        setOpenApplyDialog(false);
        fetchLeaveBalance();
        fetchLeaveRequests();
      }
    } catch (error) {
      console.error('Error applying for leave:', error);
    }
  };

  const handleWithdrawClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedRequestId) return;
    
    try {
      console.log('Withdrawing leave request:', selectedRequestId);
      const response = await axios.delete(
        `${api_address}/api/leave-requests/${selectedRequestId}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      
      console.log('Withdraw response:', response);
      if (response.data.success) {
        // Show success message
        alert(response.data.message || 'Leave request withdrawn successfully');
        // Refresh the leave requests list
        fetchLeaveRequests();
        // Close the dialog
        setWithdrawDialogOpen(false);
        setSelectedRequestId(null);
      }
    } catch (error: any) {
      console.error('Error withdrawing leave request:', error);
      console.error('Error details:', error.response?.data);
      
      // Show specific error message from backend if available
      const errorMessage = error.response?.data?.message || 'Failed to withdraw leave request. Please try again later.';
      alert(errorMessage);
      
      // Close the dialog
      setWithdrawDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const CustomPickersDay = (props: PickersDayProps<Date>) => {
    const { day, ...other } = props;
    const matchingHighlight = highlights.find(
      highlight => isSameDay(highlight.date, day)
    );

    if (!matchingHighlight) {
      return <PickersDay day={day} {...other} />;
    }

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return 'rgba(76, 175, 80, 0.3)'; // Translucent green
        case 'rejected':
          return 'rgba(244, 67, 54, 0.3)'; // Translucent red
        case 'pending':
          return 'rgba(255, 152, 0, 0.3)'; // Translucent orange
        default:
          return 'rgba(117, 117, 117, 0.3)'; // Translucent grey
      }
    };

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={" "}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: getStatusColor(matchingHighlight.status),
            color: getStatusColor(matchingHighlight.status),
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            '&::after': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '1px solid currentColor',
              content: '""',
            },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <PickersDay 
            day={day} 
            {...other}
            sx={{
              '& .MuiPickersDay-root': {
                position: 'relative',
                zIndex: 2,
              }
            }}
          />
        </Box>
      </Badge>
    );
  };

  const renderLeaveStats = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Total Leave</Typography>
        <Typography variant="caption" color="text.secondary">1 Jan 2025 - 31 Dec 2025</Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item>
            <Typography variant="body2" color="success.main">Available Unpaid Leave</Typography>
            <Typography variant="h4">{leaveStats.availableUnpaidLeave}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="primary.main">Available Paid Leave</Typography>
            <Typography variant="h4">{leaveStats.availablePaidLeave}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="error.main">Used Leave</Typography>
            <Typography variant="h4">{leaveStats.usedLeave}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderLeaveApplications = () => {
    console.log('Current leave applications:', leaveApplications);
    const filteredApplications = leaveApplications.filter(application => {
      if (filter === 'all') return true;
      if (filter === 'review') return application.status.toLowerCase() === 'pending';
      if (filter === 'approved') return application.status.toLowerCase() === 'approved';
      if (filter === 'rejected') return application.status.toLowerCase() === 'rejected';
      return true;
    });

    console.log('Current filter:', filter);
    console.log('Filtered applications:', filteredApplications);

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="review">Review</ToggleButton>
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
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No leave requests found</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent>
                  <Grid container alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Leave Date
                      </Typography>
                      <Typography>
                        {format(new Date(application.startDate), 'dd MMM')} - {format(new Date(application.endDate), 'dd MMM')}
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
                      <Typography sx={{ textTransform: 'capitalize' }}>{application.type} Leave</Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {application.status === 'Pending' && (
                        <Chip label="Pending Approval" color="warning" />
                      )}
                      {application.status === 'Approved' && (
                        <Chip label="Approved" color="success" />
                      )}
                      {application.status === 'Rejected' && (
                        <Chip label="Rejected" color="error" />
                      )}
                      {application.status === 'Pending' && (
                        <Button 
                          onClick={() => handleWithdrawClick(application.id)} 
                          variant="outlined" 
                          color="error" 
                          size="small"
                        >
                          Withdraw
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Reason
                  </Typography>
                  <Typography>{application.reason}</Typography>
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
              Are you sure you want to withdraw this leave request? This action cannot be undone.
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
        <Typography variant="h6" gutterBottom>Pending Document Submissions</Typography>
        <Stack spacing={3}>
          {documentSubmissions.map((doc, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1">{doc.type}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave Date: {format(new Date(doc.leaveDate), 'dd MMMM yyyy')}
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreHorizIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="error.main">
                  {format(new Date(doc.dueDate), 'dd MMMM yyyy')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    📎 {doc.attachments}
                  </Typography>
                  <Typography variant="body2">
                    💬 {doc.comments}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Leave Management</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {renderLeaveStats()}
          {renderLeaveApplications()}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderPendingDocuments()}
          <Box sx={{ mt: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slots={{
                  day: CustomPickersDay
                }}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openApplyDialog} onClose={() => setOpenApplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Apply for Leave
          <IconButton
            aria-label="close"
            onClick={() => setOpenApplyDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                label="Leave Type"
                value={newApplication.type}
                onChange={(e) => setNewApplication({ ...newApplication, type: e.target.value })}
              >
                <MenuItem value="paid">Paid Leave</MenuItem>
                <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                <MenuItem value="medical">Medical Leave</MenuItem>
                <MenuItem value="emergency">Emergency Leave</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newApplication.startDate}
              onChange={(e) => setNewApplication({ ...newApplication, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newApplication.endDate}
              onChange={(e) => setNewApplication({ ...newApplication, endDate: e.target.value })}
            />
            <TextField
              label="Reason"
              multiline
              rows={4}
              fullWidth
              value={newApplication.reason}
              onChange={(e) => setNewApplication({ ...newApplication, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApplyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApplyLeave}>Submit Application</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BarberLeaveManagement; 