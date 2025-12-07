import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress, LinearProgress, Chip } from '@mui/material';
import { CloudUpload, Description, AutoAwesome } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { contractService } from '../services/contract.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface UploadZoneProps {
  onUploadComplete?: (contractId: string) => void;
}

const UploadZone = ({ onUploadComplete }: UploadZoneProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Get max file size based on plan
  const getMaxFileSize = () => {
    if (!user) return 5 * 1024 * 1024; // Default to free plan
    const plan = user.subscriptionPlan;
    if (plan === 'enterprise') return Infinity;
    if (plan === 'business') return 100 * 1024 * 1024;
    if (plan === 'pro') return 25 * 1024 * 1024;
    return 5 * 1024 * 1024; // free
  };

  const getMaxFileSizeMB = () => {
    const maxBytes = getMaxFileSize();
    if (maxBytes === Infinity) return 'Unlimited';
    return `${maxBytes / (1024 * 1024)}MB`;
  };

  // Get allowed file types based on plan
  const getAllowedFileTypes = () => {
    if (!user) return ['pdf', 'docx', 'txt']; // Default to free plan
    const plan = user.subscriptionPlan;
    if (plan === 'free') return ['pdf', 'docx', 'txt'];
    // Pro and above get RTF and ODT
    return ['pdf', 'docx', 'txt', 'rtf', 'odt'];
  };

  const getAllowedMimeTypes = () => {
    const types = getAllowedFileTypes();
    const mimeMap: Record<string, string[]> = {
      'pdf': ['application/pdf'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'txt': ['text/plain'],
      'rtf': ['application/rtf', 'text/rtf'],
      'odt': ['application/vnd.oasis.opendocument.text'],
    };
    return types.flatMap(type => mimeMap[type] || []);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = getAllowedFileTypes();
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    const isValidType = getAllowedMimeTypes().includes(file.type) || 
                       (fileExtension && allowedTypes.includes(fileExtension));
    
    if (!isValidType) {
      const allowedList = allowedTypes.map(t => t.toUpperCase()).join(', ');
      toast.error(`Invalid file type. Allowed types: ${allowedList}`);
      return;
    }

    // Validate file size based on plan
    const maxFileSize = getMaxFileSize();
    if (file.size > maxFileSize) {
      toast.error(`File size exceeds your plan limit (${getMaxFileSizeMB()})`);
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

  const getAcceptTypes = () => {
    const allowedTypes = getAllowedFileTypes();
    const acceptMap: Record<string, string[]> = {
      'pdf': ['application/pdf'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'txt': ['text/plain'],
      'rtf': ['application/rtf', 'text/rtf'],
      'odt': ['application/vnd.oasis.opendocument.text'],
    };
    
    const accept: Record<string, string[]> = {};
    allowedTypes.forEach(type => {
      const mimeTypes = acceptMap[type] || [];
      mimeTypes.forEach(mime => {
        accept[mime] = [`.${type}`];
      });
    });
    return accept;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptTypes(),
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
          boxShadow: isUploading ? 'none' : '0 12px 40px rgba(99, 102, 241, 0.15)',
        },
      }}
    >
      {/* Animated background gradient */}
      {!isUploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDragActive
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
            opacity: isDragActive ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Sparkle effects on drag */}
      {isDragActive && !isUploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.8)',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
              }}
            />
          ))}
        </Box>
      )}

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
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <CircularProgress
                    size={80}
                    thickness={4}
                    variant="determinate"
                    value={uploadProgress}
                    sx={{
                      color: 'primary.main',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                </motion.div>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Description sx={{ fontSize: 32, color: 'primary.main' }} />
                  </motion.div>
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
                  scale: isDragActive ? [1, 1.1, 1] : 1,
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
                    position: 'relative',
                    background: isDragActive
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                    border: `2px solid ${isDragActive ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'}`,
                    boxShadow: isDragActive
                      ? '0 12px 40px rgba(99, 102, 241, 0.3)'
                      : '0 8px 32px rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                  }}
                >
                  {/* Pulsing ring effect */}
                  {isDragActive && (
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        border: '2px solid rgba(99, 102, 241, 0.6)',
                      }}
                    />
                  )}
                  <CloudUpload
                    sx={{
                      fontSize: { xs: 48, md: 64 },
                      color: 'primary.main',
                      position: 'relative',
                      zIndex: 1,
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
                  mb: 2,
                }}
              >
                {getAllowedFileTypes().map((type, index) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <Chip
                      label={type.toUpperCase()}
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 'auto',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.2)',
                          borderColor: 'primary.main',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 1,
                }}
              >
                <AutoAwesome sx={{ fontSize: 14, color: 'primary.main', opacity: 0.7 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                  }}
                >
                  AI-powered analysis
                </Typography>
                <AutoAwesome sx={{ fontSize: 14, color: 'primary.main', opacity: 0.7 }} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mt: 2,
                  display: 'block',
                }}
              >
                Maximum file size: {getMaxFileSizeMB()}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Paper>
  );
};

export default UploadZone;
