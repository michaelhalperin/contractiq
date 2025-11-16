import { Box, Typography, Chip, Alert, Stack } from '@mui/material';
import {
  Warning,
  Gavel,
  Autorenew,
  Cancel,
  Payment,
} from '@mui/icons-material';
import type { RiskFlag } from '../../../shared/types';

interface RiskFlagsProps {
  risks: RiskFlag[];
}

const RiskFlags = ({ risks }: RiskFlagsProps) => {
  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'non-compete':
        return <Gavel sx={{ fontSize: 18 }} />;
      case 'auto-renewal':
        return <Autorenew sx={{ fontSize: 18 }} />;
      case 'termination':
        return <Cancel sx={{ fontSize: 18 }} />;
      case 'payment':
        return <Payment sx={{ fontSize: 18 }} />;
      default:
        return <Warning sx={{ fontSize: 18 }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'low':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  if (risks.length === 0) {
    return (
      <Alert 
        severity="success" 
        sx={{ 
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
        }}
      >
        No significant risks detected in this contract.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {risks.map((risk) => {
        const severityStyle = getSeverityColor(risk.severity);
        return (
          <Box
            key={risk.id}
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${severityStyle.border}`,
              borderLeft: `4px solid ${severityStyle.color}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  color: severityStyle.color,
                  mt: 0.5,
                }}
              >
                {getRiskIcon(risk.type)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {risk.title}
                  </Typography>
                  <Chip
                    label={risk.severity.toUpperCase()}
                    size="small"
                    sx={{
                      background: severityStyle.bg,
                      color: severityStyle.color,
                      border: `1px solid ${severityStyle.border}`,
                      fontWeight: 600,
                      height: 22,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {risk.description}
                </Typography>
              </Box>
            </Box>

            {risk.clauseText && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Relevant Clause:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  "{risk.clauseText.substring(0, 200)}{risk.clauseText.length > 200 ? '...' : ''}"
                </Typography>
              </Box>
            )}

            {risk.suggestion && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Suggestion:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                  {risk.suggestion}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default RiskFlags;
