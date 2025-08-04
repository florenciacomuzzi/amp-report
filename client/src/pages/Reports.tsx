import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  Download,
  Visibility,
  MoreVert,
} from '@mui/icons-material';
import { trpc } from '../trpc';

interface Report {
  id: number;
  propertyName: string;
  propertyId: number;
  createdAt: string;
  status: 'completed' | 'in-progress' | 'failed';
  tenantProfileGenerated: boolean;
  recommendationsCount: number;
}

function Reports() {
  const navigate = useNavigate();

  // Fetch properties with tRPC
  const { data, isLoading: loading } = trpc.property.list.useQuery();
  const properties = data?.properties ?? [];

  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  // Mock reports data (based on properties list)
  const reports: Report[] = properties.map((property: any, index: number) => ({
    id: index + 1,
    propertyName: property.name,
    propertyId: property.id,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.8 ? 'in-progress' : 'completed',
    tenantProfileGenerated: Math.random() > 0.3,
    recommendationsCount: Math.floor(Math.random() * 15) + 5,
  }));

  const filteredReports = reports.filter((report) =>
    report.propertyName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, reportId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(reportId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleViewReport = (report: Report) => {
    navigate(`/properties/${report.propertyId}/analysis`);
    handleMenuClose();
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Export report ${selectedReport} as ${format}`);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analysis Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and export all your property analysis reports
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h4">{reports.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">
                {reports.filter((r) => r.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                This Month
              </Typography>
              <Typography variant="h4">
                {reports.filter(
                  (r) =>
                    new Date(r.createdAt).getMonth() === new Date().getMonth() &&
                    new Date(r.createdAt).getFullYear() === new Date().getFullYear(),
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search reports by property name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" startIcon={<FilterList />}>
          Filter
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tenant Profile</TableCell>
              <TableCell>Recommendations</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No reports found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.propertyName}</TableCell>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      color={
                        report.status === 'completed'
                          ? 'success'
                          : report.status === 'in-progress'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {report.tenantProfileGenerated ? 'Generated' : 'Pending'}
                  </TableCell>
                  <TableCell>{report.recommendationsCount}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuClick(e, report.id)}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedReport === report.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleViewReport(report)}>
                        <Visibility fontSize="small" sx={{ mr: 1 }} /> View
                      </MenuItem>
                      <MenuItem onClick={() => handleExportReport('pdf')}>
                        <Download fontSize="small" sx={{ mr: 1 }} /> Export PDF
                      </MenuItem>
                      <MenuItem onClick={() => handleExportReport('excel')}>
                        <Download fontSize="small" sx={{ mr: 1 }} /> Export Excel
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Reports;
