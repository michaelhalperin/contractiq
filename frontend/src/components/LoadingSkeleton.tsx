import { Box, Skeleton, Card, CardContent, Stack } from '@mui/material';

export const ContractCardSkeleton = () => {
  return (
    <Card
      sx={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const ContractDetailSkeleton = () => {
  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>

        {/* Quick Info Bar */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" width={150} height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Box>

        {/* Main Content Grid */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export const DashboardSkeleton = () => {
  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width="30%" height={48} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width={200} height={100} sx={{ borderRadius: 2 }} />
          ))}
        </Box>

        {/* Contract Cards Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ContractCardSkeleton key={i} />
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export const ProfileSkeleton = () => {
  return (
    <Box>
      <Stack spacing={3}>
        {/* Profile Header */}
        <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Form Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {[1, 2].map((i) => (
            <Card key={i} sx={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)' }}>
              <CardContent>
                <Skeleton variant="text" width="50%" height={28} sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

