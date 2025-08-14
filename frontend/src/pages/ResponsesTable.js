import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { surveyService } from '../services/surveyService';
import toast from 'react-hot-toast';

const ResponsesTable = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [surveyData, responsesData] = await Promise.all([
        surveyService.getSurvey(id),
        surveyService.getResponses(id)
      ]);
      
      setSurvey(surveyData);
      setResponses(responsesData);
      toast.success(`Loaded ${responsesData.length} responses`);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load survey responses');
    } finally {
      setLoading(false);
    }
  };

  const generateColumns = () => {
    if (!survey || !survey.questions) return [];

    const baseColumns = [
      {
        field: 'id',
        headerName: 'Response ID',
        width: 120,
        type: 'number',
      },
      {
        field: 'submitted_at',
        headerName: 'Submitted',
        width: 180,
        type: 'dateTime',
        valueGetter: (params) => new Date(params.value),
        renderCell: (params) => (
          <Typography variant="body2">
            {new Date(params.value).toLocaleString()}
          </Typography>
        ),
      },
      {
        field: 'respondent_ip',
        headerName: 'IP Address',
        width: 130,
        renderCell: (params) => (
          <Chip 
            label={params.value || 'Unknown'} 
            size="small" 
            variant="outlined"
          />
        ),
      },
    ];

    // Dynamic columns for each question
    const questionColumns = survey.questions.map((question, index) => {
      const fieldName = `question_${index}`;
      
      return {
        field: fieldName,
        headerName: question.text.length > 30 
          ? `${question.text.substring(0, 30)}...` 
          : question.text,
        width: 200,
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => {
          const response = params.row.responses || {};
          return response[question.text] || '';
        },
        renderCell: (params) => {
          const value = params.value;
          
          if (question.type === 'audio') {
            return value ? (
              <Chip label="Audio Response" color="primary" size="small" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No audio
              </Typography>
            );
          }
          
          if (question.type === 'multiple_choice') {
            return (
              <Chip 
                label={value || 'No selection'} 
                size="small"
                color={value ? 'primary' : 'default'}
                variant={value ? 'filled' : 'outlined'}
              />
            );
          }
          
          if (question.type === 'rating') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {value || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  /10
                </Typography>
              </Box>
            );
          }
          
          return (
            <Typography 
              variant="body2" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
              title={value}
            >
              {value || 'No response'}
            </Typography>
          );
        },
      };
    });

    return [...baseColumns, ...questionColumns];
  };

  const filteredResponses = responses.filter((response) => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    
    // Search in response ID
    if (response.id.toString().includes(searchLower)) return true;
    
    // Search in IP address
    if (response.respondent_ip && response.respondent_ip.toLowerCase().includes(searchLower)) return true;
    
    // Search in response values
    const responseValues = Object.values(response.responses || {});
    return responseValues.some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const handleExportCSV = () => {
    if (!survey || !responses.length) {
      toast.error('No data to export');
      return;
    }

    const csvHeaders = [
      'Response ID',
      'Submitted At',
      'IP Address',
      ...survey.questions.map(q => q.text)
    ];

    const csvRows = responses.map(response => [
      response.id,
      new Date(response.submitted_at).toLocaleString(),
      response.respondent_ip || 'Unknown',
      ...survey.questions.map(q => response.responses[q.text] || '')
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${survey.title}_responses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully!');
  };

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <Button
        startIcon={<ExportIcon />}
        onClick={handleExportCSV}
        size="small"
      >
        Export CSV
      </Button>
      <Button
        startIcon={<RefreshIcon />}
        onClick={loadData}
        size="small"
      >
        Refresh
      </Button>
    </GridToolbarContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!survey) {
    return (
      <Alert severity="error">
        Survey not found or failed to load.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Survey Responses
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {survey.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Chip 
            label={`${responses.length} Total Responses`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`${survey.questions.length} Questions`} 
            color="secondary" 
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search responses..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredResponses}
          columns={generateColumns()}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          slots={{
            toolbar: CustomToolbar,
          }}
          density="compact"
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>

      {responses.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No responses yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share your survey to start collecting responses.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ResponsesTable;
