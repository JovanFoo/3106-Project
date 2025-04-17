import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
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
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

interface CustomerBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  stylistName: string;
  status: 'pending' | 'rescheduled' | 'cancelled' | 'no_answer';
  contactAttempts: Array<{
    timestamp: string;
    method: 'phone' | 'email';
    result: string;
  }>;
}

type BookingStatus = CustomerBooking['status'] | 'all';

interface RescheduleDialogProps {
  open: boolean;
  booking: CustomerBooking | null;
  onClose: () => void;
  onReschedule: (newDate: Date) => void;
}

const RescheduleDialog: React.FC<RescheduleDialogProps> = ({ open, booking, onClose, onReschedule }) => {
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    const oldDate = booking ? new Date(booking.appointmentDate) : new Date();
    
    // Reset time of dates for comparison
    selectedDate.setHours(0, 0, 0, 0);
    oldDate.setHours(0, 0, 0, 0);
    
    if (selectedDate <= oldDate) {
      setError('New appointment date must be after the current appointment date');
    } else {
      setError('');
    }
    setNewDate(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTime(event.target.value);
  };

  const handleSubmit = () => {
    if (newDate && newTime && !error) {
      const [hours, minutes] = newTime.split(':');
      const newDateTime = new Date(newDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));
      onReschedule(newDateTime);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Booking</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="subtitle1" gutterBottom>Current Booking Details:</Typography>
          {booking && (
            <>
              <Typography variant="body2">Customer: {booking.customerName}</Typography>
              <Typography variant="body2">Original Date: {format(new Date(booking.appointmentDate), 'PPP')}</Typography>
              <Typography variant="body2">Original Time: {booking.appointmentTime}</Typography>
              <Typography variant="body2">Services: {booking.service}</Typography>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            type="date"
            label="New Appointment Date"
            value={newDate}
            onChange={handleDateChange}
            fullWidth
            error={!!error}
            helperText={error}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="time"
            label="New Appointment Time"
            value={newTime}
            onChange={handleTimeChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          disabled={!newDate || !newTime || !!error}
        >
          Confirm Reschedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EmergencyLeaveManagement: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('pending');
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  useEffect(() => {
    // Hardcoded test data
    const testData: CustomerBooking[] = [
      {
        id: '1',
        customerName: '[hardcoded] Alice Johnson',
        customerEmail: 'alice@example.com',
        customerPhone: '1234567890',
        appointmentDate: '2024-03-25',
        appointmentTime: '10:00 AM',
        service: 'Haircut, Color',
        stylistName: '[hardcoded] Sarah Smith',
        status: 'pending',
        contactAttempts: []
      },
      {
        id: '2',
        customerName: '[hardcoded] Bob Wilson',
        customerEmail: 'bob@example.com',
        customerPhone: '2345678901',
        appointmentDate: '2024-03-26',
        appointmentTime: '2:30 PM',
        service: 'Beard Trim',
        stylistName: '[hardcoded] Sarah Smith',
        status: 'rescheduled',
        contactAttempts: [
          {
            timestamp: '2024-03-24 09:15 AM',
            method: 'phone',
            result: 'Left voicemail'
          }
        ]
      },
      {
        id: '3',
        customerName: '[hardcoded] Carol Martinez',
        customerEmail: 'carol@example.com',
        customerPhone: '3456789012',
        appointmentDate: '2024-03-25',
        appointmentTime: '11:30 AM',
        service: 'Full Color, Highlights',
        stylistName: '[hardcoded] Sarah Smith',
        status: 'rescheduled',
        contactAttempts: [
          {
            timestamp: '2024-03-24 10:00 AM',
            method: 'email',
            result: 'Rescheduled to next week'
          }
        ]
      },
      {
        id: '4',
        customerName: '[hardcoded] David Brown',
        customerEmail: 'david@example.com',
        customerPhone: '4567890123',
        appointmentDate: '2024-03-27',
        appointmentTime: '3:00 PM',
        service: 'Haircut',
        stylistName: '[hardcoded] Sarah Smith',
        status: 'no_answer',
        contactAttempts: [
          {
            timestamp: '2024-03-24 11:30 AM',
            method: 'phone',
            result: 'No answer'
          },
          {
            timestamp: '2024-03-24 2:00 PM',
            method: 'email',
            result: 'No response'
          }
        ]
      },
      {
        id: '5',
        customerName: '[hardcoded] Emma Davis',
        customerEmail: 'emma@example.com',
        customerPhone: '5678901234',
        appointmentDate: '2024-03-28',
        appointmentTime: '1:00 PM',
        service: 'Styling, Treatment',
        stylistName: '[hardcoded] Sarah Smith',
        status: 'cancelled',
        contactAttempts: [
          {
            timestamp: '2024-03-24 3:30 PM',
            method: 'phone',
            result: 'Customer cancelled'
          }
        ]
      }
    ];

    setBookings(testData);
  }, []);

  const handleStatusUpdate = (bookingId: string, newStatus: CustomerBooking['status']) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      )
    );
  };

  const handleReschedule = (booking: CustomerBooking) => {
    setSelectedBooking(booking);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleConfirm = (newDate: Date) => {
    if (selectedBooking) {
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                status: 'rescheduled' as const,
                appointmentDate: format(newDate, 'yyyy-MM-dd'),
                contactAttempts: [
                  ...booking.contactAttempts,
                  {
                    timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
                    method: 'phone',
                    result: `Rescheduled to ${format(newDate, 'PPP')}`
                  }
                ]
              }
            : booking
        )
      );
      setRescheduleDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ bgcolor: theme.palette.grey[50], minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                Emergency Leave Management
              </Typography>
              <TextField
                fullWidth
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['all', 'pending', 'rescheduled', 'cancelled', 'no_answer'].map((status) => (
                  <Chip
                    key={status}
                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                    onClick={() => setStatusFilter(status as BookingStatus)}
                    color={
                      status === 'pending' ? 'warning' :
                      status === 'rescheduled' ? 'success' :
                      status === 'cancelled' ? 'error' :
                      status === 'no_answer' ? 'info' :
                      'default'
                    }
                    variant={statusFilter === status ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedBooking?.id === booking.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => setSelectedBooking(booking)}
              >
                <CardContent>
                  <Typography variant="h6">{booking.customerName}</Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {format(new Date(booking.appointmentDate), 'PPP')} at {booking.appointmentTime}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {booking.service}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      color={
                        booking.status === 'pending' ? 'warning' :
                        booking.status === 'rescheduled' ? 'success' :
                        booking.status === 'cancelled' ? 'error' :
                        'default'
                      }
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={8}>
            {selectedBooking ? (
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Booking Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Customer Information
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                              {selectedBooking.customerName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{selectedBooking.customerName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedBooking.customerEmail}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{selectedBooking.customerPhone}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Appointment Details
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="body1">
                              {format(new Date(selectedBooking.appointmentDate), 'PPP')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body1">{selectedBooking.appointmentTime}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ArticleIcon fontSize="small" color="action" />
                            <Typography variant="body1">{selectedBooking.service}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Contact History
                          </Typography>
                          {selectedBooking.contactAttempts.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                              {selectedBooking.contactAttempts.map((attempt, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: theme.palette.grey[50]
                                  }}
                                >
                                  {attempt.method === 'phone' ? (
                                    <PhoneIcon fontSize="small" color="action" />
                                  ) : (
                                    <EmailIcon fontSize="small" color="action" />
                                  )}
                                  <AccessTimeIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {format(new Date(attempt.timestamp), 'PPP p')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {attempt.result}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No contact attempts recorded yet
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    {(selectedBooking.status === 'pending' || selectedBooking.status === 'no_answer') && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleReschedule(selectedBooking)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                          >
                            Cancel Booking
                          </Button>
                          {selectedBooking.status === 'pending' && (
                            <Button
                              variant="outlined"
                              color="warning"
                              onClick={() => handleStatusUpdate(selectedBooking.id, 'no_answer')}
                            >
                              No Answer
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                bgcolor: theme.palette.background.paper,
                borderRadius: 1,
                p: 3
              }}>
                <Typography color="text.secondary">
                  Select a booking to view details
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <RescheduleDialog
        open={rescheduleDialogOpen}
        booking={selectedBooking}
        onClose={() => {
          setRescheduleDialogOpen(false);
          setSelectedBooking(null);
        }}
        onReschedule={handleRescheduleConfirm}
      />
    </Box>
  );
};

export default EmergencyLeaveManagement; 