import { Box, Typography, Chip, Stack } from '@mui/material';
import type { ClauseExplanation } from '../../../shared/types';

interface ContractTimelineProps {
  clauses: ClauseExplanation[];
}

const ContractTimeline = ({ clauses }: ContractTimelineProps) => {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'important':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  return (
    <Stack spacing={2}>
      {clauses.map((clause, index) => {
        const importanceStyle = getImportanceColor(clause.importance);
        return (
          <Box
            key={index}
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${importanceStyle.border}`,
              borderLeft: `4px solid ${importanceStyle.color}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', flex: 1, minWidth: 0 }}>
                {clause.clauseTitle}
              </Typography>
              <Chip
                label={clause.importance.toUpperCase()}
                size="small"
                sx={{
                  background: importanceStyle.bg,
                  color: importanceStyle.color,
                  border: `1px solid ${importanceStyle.border}`,
                  fontWeight: 600,
                  height: 22,
                  fontSize: '0.7rem',
                }}
              />
            </Box>

            {clause.clauseText && (
              <Box
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Clause Text:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  "{clause.clauseText.substring(0, 200)}{clause.clauseText.length > 200 ? '...' : ''}"
                </Typography>
              </Box>
            )}

            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
              {clause.explanation}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
};

export default ContractTimeline;
