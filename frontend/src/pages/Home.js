import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Fab,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  TableView as TableIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { surveyService } from '../services/surveyService';
import toast from 'react-hot-toast';

const Home = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await surveyService.getSurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Error loading surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await surveyService.deleteSurvey(surveyId);
        toast.success('Survey deleted successfully');
        loadSurveys();
      } catch (error) {
        console.error('Error deleting survey:', error);
        toast.error('Failed to delete survey');
      }
    }
    setMenuAnchor(null);
  };

  const handleMenuClick = (event, survey) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSurvey(survey);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSurvey(null);
  };

  const copyShareLink = (surveyId) => {
    const shareUrl = `${window.location.origin}/take/${surveyId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Survey Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and analyze your surveys
        </Typography>
      </Box>

      {/* Survey Grid */}
      {surveys.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No surveys yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first survey to get started
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
          >
            Create Survey
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {surveys.map((survey) => (
            <Grid item xs={12} sm={6} md={4} key={survey.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {survey.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, survey)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {survey.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${survey.questions.length} questions`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={survey.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={survey.is_active ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(survey.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/view/${survey.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => navigate(`/take/${survey.id}`)}
                    size="small"
                    variant="contained"
                    color="primary"
                  >
                    Take Survey
                  </Button>
                  <Button
                    size="small"
                    startIcon={<TableIcon />}
                    onClick={() => navigate(`/surveys/${survey.id}/responses`)}
                    color="secondary"
                  >
                    Responses
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/edit/${selectedSurvey && selectedSurvey.id}`);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Survey
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/surveys/${selectedSurvey && selectedSurvey.id}/responses`);
          handleMenuClose();
        }}>
          <TableIcon sx={{ mr: 1 }} fontSize="small" />
          View Responses
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/analytics/${selectedSurvey && selectedSurvey.id}`);
          handleMenuClose();
        }}>
          <AnalyticsIcon sx={{ mr: 1 }} fontSize="small" />
          Analytics
        </MenuItem>
        <MenuItem onClick={() => copyShareLink(selectedSurvey && selectedSurvey.id)}>
          <ShareIcon sx={{ mr: 1 }} fontSize="small" />
          Copy Share Link
        </MenuItem>
        <MenuItem 
          onClick={() => handleDelete(selectedSurvey && selectedSurvey.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add survey"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Home;

