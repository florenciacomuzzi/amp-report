import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn,
  Home,
} from '@mui/icons-material';
import { trpc } from '../trpc';

function Properties() {
  const navigate = useNavigate();

  // Fetch properties with tRPC
  const { data, isLoading: loading } = trpc.property.list.useQuery();
  const properties = data?.properties ?? [];

  // Mutation for deleting a property and then invalidating the list
  const utils = trpc.useContext();
  const deletePropertyMutation = trpc.property.remove.useMutation({
    onSuccess: () => {
      utils.property.list.invalidate();
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);

  // Filter properties locally by search term
  const filteredProperties = properties.filter(
    (property: any) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.state.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle property deletion
  const handleDelete = async () => {
    if (propertyToDelete) {
      await deletePropertyMutation.mutateAsync(String(propertyToDelete));
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Property Name', flex: 1 },
    {
      field: 'address',
      headerName: 'Address',
      flex: 2,
      valueGetter: (params) =>
        `${params.row.address.street}, ${params.row.address.city}, ${params.row.address.state}`,
    },
    {
      field: 'units',
      headerName: 'Units',
      width: 100,
      valueGetter: (params) => params.row.details.numberOfUnits,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      valueGetter: (params) => params.row.details.propertyType,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/properties/${params.row.id}`)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setPropertyToDelete(params.row.id);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Properties</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/properties/new')}
        >
          Add Property
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search properties..."
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
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredProperties.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              {searchTerm ? 'No properties found' : 'No properties yet'}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Add your first property to get started'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/properties/new')}
                sx={{ mt: 2 }}
              >
                Add First Property
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredProperties.map((property: any) => (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {property.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.address.street}, {property.address.city},{' '}
                      {property.address.state} {property.address.zip}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={<Home />}
                      label={`${property.details.numberOfUnits} units`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={property.details.propertyType}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Built: {property.details.yearBuilt}
                  </Typography>
                  <Typography variant="body2">
                    Rent: ${property.details.targetRentRange.min} - $
                    {property.details.targetRentRange.max}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/properties/${property.id}/analysis`)}
                  >
                    Analysis
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setPropertyToDelete(property.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredProperties}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Properties;
