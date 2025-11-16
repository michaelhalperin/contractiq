import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress, LinearProgress } from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { contractService } from '../services/contract.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface UploadZoneProps {
  onUploadComplete?: (contractId: string) => void;
}

const UploadZone = ({ onUploadComplete }: UploadZoneProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await contractService.upload(file);
      setUploadProgress(100);
      setTimeout(() => {
        toast.success('Contract uploaded! Analysis in progress...');
        if (onUploadComplete) {
          onUploadComplete(response.id);
        } else {
          navigate(`/contracts/${response.id}`);
        }
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [navigate, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: { xs: 4, md: 6 },
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'rgba(148, 163, 184, 0.2)',
        background: isDragActive
          ? 'rgba(99, 102, 241, 0.08)'
          : 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px)',
        cursor: isUploading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        '&:hover': {
          borderColor: isUploading ? 'rgba(148, 163, 184, 0.2)' : 'primary.main',
          background: isUploading
            ? 'rgba(15, 23, 42, 0.4)'
            : 'rgba(99, 102, 241, 0.05)',
          transform: isUploading ? 'none' : 'scale(1.01)',
        },
      }}
    >
      <input {...getInputProps()} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 250, md: 320 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <Box sx={{ mb: 4, position: 'relative', display: 'inline-block' }}>
                <CircularProgress
                  size={80}
                  thickness={4}
                  sx={{
                    color: 'primary.main',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Description sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Uploading and analyzing...
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {uploadProgress}% complete
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center', width: '100%' }}
            >
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Box
                  sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4,
                    background: isDragActive
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                    border: `2px solid ${isDragActive ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'}`,
                    boxShadow: isDragActive
                      ? '0 12px 40px rgba(99, 102, 241, 0.3)'
                      : '0 8px 32px rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CloudUpload
                    sx={{
                      fontSize: { xs: 48, md: 64 },
                      color: 'primary.main',
                    }}
                  />
                </Box>
              </motion.div>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  background: isDragActive
                    ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {isDragActive ? 'Drop your contract here' : 'Drag & drop your contract'}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, fontWeight: 400 }}
              >
                or click to browse
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {['PDF', 'DOCX', 'TXT'].map((type) => (
                  <Box
                    key={type}
                    sx={{
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {type}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mt: 2,
                  display: 'block',
                }}
              >
                Maximum file size: 10MB
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Paper>
  );
};

export default UploadZone;
