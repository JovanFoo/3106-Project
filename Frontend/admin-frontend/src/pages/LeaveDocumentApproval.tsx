import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Drawer,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';

interface DocumentSubmission {
  id: string;
  staffName: string;
  staffEmail: string;
  leaveDate: string;
  leaveEndDate: string;
  status: 'review' | 'approved' | 'rejected';
  currentSubmission: {
    fileName: string;
    uploadDate: string;
    fileUrl: string;
  };
  previousSubmissions: Array<{
    fileName: string;
    uploadDate: string;
    fileUrl: string;
  }>;
  comments: Array<{
    author: string;
    message: string;
    timestamp: string;
  }>;
}

const LeaveDocumentApproval: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentSubmission | null>(null);
  const [documents, setDocuments] = useState<DocumentSubmission[]>([]);
  const [viewStatus, setViewStatus] = useState<'review' | 'approved' | 'rejected'>('review');

  useEffect(() => {
    // TODELETE: Test data
    const testData: DocumentSubmission[] = [
      {
        id: '1',
        staffName: '[hardcoded] Andre Lau',
        staffEmail: 'Andre.Lau@gmail.com',
        leaveDate: '2024-09-20',
        leaveEndDate: '2024-09-22',
        status: 'review',
        currentSubmission: {
          fileName: 'file 1',
          uploadDate: '2024-03-15',
          fileUrl: '/documents/medical1.pdf'
        },
        previousSubmissions: [
          {
            fileName: 'file 1',
            uploadDate: '2024-03-14',
            fileUrl: '/documents/medical1_old.pdf'
          },
          {
            fileName: 'file 1',
            uploadDate: '2024-03-13',
            fileUrl: '/documents/medical1_older.pdf'
          }
        ],
        comments: [
          {
            author: 'Jane Doe',
            message: 'File submitted is blank. Resubmit.',
            timestamp: '2024-03-14T10:30:00'
          },
          {
            author: 'Jane Doe',
            message: 'File submitted is blank. Resubmit.',
            timestamp: '2024-03-13T15:45:00'
          }
        ]
      },
      {
        id: '2',
        staffName: '[hardcoded] Sarah Chen',
        staffEmail: 'Sarah.Chen@gmail.com',
        leaveDate: '2024-08-15',
        leaveEndDate: '2024-08-16',
        status: 'approved',
        currentSubmission: {
          fileName: 'medical_certificate_2024.pdf',
          uploadDate: '2024-03-15',
          fileUrl: '/documents/medical2.pdf'
        },
        previousSubmissions: [],
        comments: [
          {
            author: 'Jane Doe',
            message: 'Approved. Get well soon!',
            timestamp: '2024-03-15T11:30:00'
          }
        ]
      },
      {
        id: '3',
        staffName: '[hardcoded] Michael Wong',
        staffEmail: 'Michael.Wong@gmail.com',
        leaveDate: '2024-10-01',
        leaveEndDate: '2024-10-03',
        status: 'rejected',
        currentSubmission: {
          fileName: 'hospital_appointment.pdf',
          uploadDate: '2024-03-14',
          fileUrl: '/documents/medical3.pdf'
        },
        previousSubmissions: [
          {
            fileName: 'wrong_date.pdf',
            uploadDate: '2024-03-13',
            fileUrl: '/documents/medical3_old.pdf'
          }
        ],
        comments: [
          {
            author: 'Jane Doe',
            message: 'Rejected. Appointment date does not match leave application.',
            timestamp: '2024-03-14T16:20:00'
          },
          {
            author: 'Jane Doe',
            message: 'Please submit the correct appointment date.',
            timestamp: '2024-03-13T16:20:00'
          }
        ]
      },
      {
        id: '4',
        staffName: '[hardcoded] Emma Liu',
        staffEmail: 'Emma.Liu@gmail.com',
        leaveDate: '2024-09-25',
        leaveEndDate: '2024-09-26',
        status: 'review',
        currentSubmission: {
          fileName: 'dental_cert.pdf',
          uploadDate: '2024-03-15',
          fileUrl: '/documents/medical4.pdf'
        },
        previousSubmissions: [],
        comments: []
      },
      {
        id: '5',
        staffName: '[hardcoded] James Taylor',
        staffEmail: 'James.Taylor@gmail.com',
        leaveDate: '2024-09-18',
        leaveEndDate: '2024-09-20',
        status: 'approved',
        currentSubmission: {
          fileName: 'specialist_appointment.pdf',
          uploadDate: '2024-03-14',
          fileUrl: '/documents/medical5.pdf'
        },
        previousSubmissions: [
          {
            fileName: 'blurry_scan.pdf',
            uploadDate: '2024-03-13',
            fileUrl: '/documents/medical5_old.pdf'
          }
        ],
        comments: [
          {
            author: 'Jane Doe',
            message: 'Approved after receiving clear scan.',
            timestamp: '2024-03-14T15:15:00'
          },
          {
            author: 'Jane Doe',
            message: 'The scanned document is not clear. Please rescan and submit.',
            timestamp: '2024-03-13T14:15:00'
          }
        ]
      },
      {
        id: '6',
        staffName: '[hardcoded] David Zhang',
        staffEmail: 'David.Zhang@gmail.com',
        leaveDate: '2024-09-28',
        leaveEndDate: '2024-09-30',
        status: 'rejected',
        currentSubmission: {
          fileName: 'leave_request.pdf',
          uploadDate: '2024-03-15',
          fileUrl: '/documents/medical6.pdf'
        },
        previousSubmissions: [],
        comments: [
          {
            author: 'Jane Doe',
            message: 'Rejected. Insufficient supporting documentation provided.',
            timestamp: '2024-03-15T16:45:00'
          }
        ]
      }
    ];

    setDocuments(testData);
    if (id) {
      const doc = testData.find(d => d.id === id);
      if (doc) setSelectedDocument(doc);
    }
  }, [id]);

  const handleDocumentClick = (document: DocumentSubmission) => {
    setSelectedDocument(document);
  };

  const handleClose = () => {
    setSelectedDocument(null);
  };

  const handleStatusChange = (event: React.MouseEvent<HTMLElement>, newStatus: 'review' | 'approved' | 'rejected') => {
    if (newStatus !== null) {
      setViewStatus(newStatus);
    }
  };

  const handleApprove = (documentId: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'approved' as const } 
          : doc
      )
    );
    handleClose();
  };

  const handleReject = (documentId: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'rejected' as const } 
          : doc
      )
    );
    handleClose();
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.staffEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = doc.status === viewStatus;
    return matchesSearch && matchesStatus;
  });

  const renderDocumentList = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={viewStatus}
          exclusive
          onChange={handleStatusChange}
          aria-label="document status"
          sx={{ mb: 2 }}
        >
          <ToggleButton 
            value="review" 
            aria-label="to review"
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }
            }}
          >
            To Review ({documents.filter(d => d.status === 'review').length})
          </ToggleButton>
          <ToggleButton 
            value="approved" 
            aria-label="approved"
            sx={{
              '&.Mui-selected': {
                bgcolor: 'success.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'success.dark',
                }
              }
            }}
          >
            Approved ({documents.filter(d => d.status === 'approved').length})
          </ToggleButton>
          <ToggleButton 
            value="rejected" 
            aria-label="rejected"
            sx={{
              '&.Mui-selected': {
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark',
                }
              }
            }}
          >
            Rejected ({documents.filter(d => d.status === 'rejected').length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={2}>
        {filteredDocuments.map((doc) => (
          <Card
            key={doc.id}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
            onClick={() => handleDocumentClick(doc)}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {doc.staffName.charAt(0)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {doc.staffName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave Date: {format(new Date(doc.leaveDate), 'dd MMM yyyy')} - {format(new Date(doc.leaveEndDate), 'dd MMM yyyy')}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary">
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderDocumentDetail = () => {
    if (!selectedDocument) return null;

    return (
      <Drawer
        anchor="right"
        open={!!selectedDocument}
        onClose={handleClose}
        variant="temporary"
        PaperProps={{
          sx: { 
            width: '40%',
            minWidth: 400,
            maxWidth: 600,
            p: 3
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Medical Certificate</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Leave Date
            </Typography>
            <Typography variant="body1">
              {format(new Date(selectedDocument.leaveDate), 'dd MMM yyyy')} - {format(new Date(selectedDocument.leaveEndDate), 'dd MMM yyyy')}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48 }}>
                {selectedDocument.staffName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {selectedDocument.staffName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDocument.staffEmail}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Submission
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography>{selectedDocument.currentSubmission.fileName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Uploaded on {format(new Date(selectedDocument.currentSubmission.uploadDate), 'dd MMM yyyy')}
              </Typography>
            </Paper>
          </Box>

          {selectedDocument.previousSubmissions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Previous Submissions
              </Typography>
              <Stack spacing={2}>
                {selectedDocument.previousSubmissions.map((submission, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Typography>{submission.fileName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded on {format(new Date(submission.uploadDate), 'dd MMM yyyy')}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {selectedDocument.comments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comments
              </Typography>
              <Stack spacing={2}>
                {selectedDocument.comments.map((comment, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2">{comment.author}</Typography>
                    <Typography variant="body2">{comment.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(comment.timestamp), 'dd MMM yyyy HH:mm')}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={() => handleReject(selectedDocument.id)}
            >
              Reject
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => handleApprove(selectedDocument.id)}
            >
              Approve
            </Button>
          </Box>
        </Box>
      </Drawer>
    );
  };

  return (
    <Box sx={{ bgcolor: theme.palette.grey[50], minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
            Documentation
          </Typography>
          <TextField
            size="small"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            {renderDocumentList()}
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper 
              sx={{ 
                height: 'calc(100vh - 180px)', 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 24,
                borderRadius: '16px',
                bgcolor: 'background.paper'
              }}
            >
              {selectedDocument ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Medical Certificate</Typography>
                    <IconButton onClick={handleClose}>
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Leave Date
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedDocument.leaveDate), 'dd MMM yyyy')} - {format(new Date(selectedDocument.leaveEndDate), 'dd MMM yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 48, height: 48 }}>
                        {selectedDocument.staffName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {selectedDocument.staffName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedDocument.staffEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Submission
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography>{selectedDocument.currentSubmission.fileName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded on {format(new Date(selectedDocument.currentSubmission.uploadDate), 'dd MMM yyyy')}
                        </Typography>
                      </Paper>
                    </Box>

                    {selectedDocument.previousSubmissions.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Previous Submissions
                        </Typography>
                        <Stack spacing={2}>
                          {selectedDocument.previousSubmissions.map((submission, index) => (
                            <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                              <Typography>{submission.fileName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Uploaded on {format(new Date(submission.uploadDate), 'dd MMM yyyy')}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {selectedDocument.comments.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Comments
                        </Typography>
                        <Stack spacing={2}>
                          {selectedDocument.comments.map((comment, index) => (
                            <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2">{comment.author}</Typography>
                              <Typography variant="body2">{comment.message}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(comment.timestamp), 'dd MMM yyyy HH:mm')}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {selectedDocument.status === 'review' && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        fullWidth
                        onClick={() => handleReject(selectedDocument.id)}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        onClick={() => handleApprove(selectedDocument.id)}
                      >
                        Approve
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    No Document Selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Select a document from the list to view its details and take action.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LeaveDocumentApproval; 