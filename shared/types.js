// Shared types between frontend and backend
export const PLAN_LIMITS = {
    free: {
        contractsPerMonth: 2,
        features: [
            'Basic AI analysis',
            'Standard PDF reports',
            'Up to 5MB file size',
            'Basic risk detection',
            'Email support (48h response)',
            '7-day contract history'
        ]
    },
    pro: {
        contractsPerMonth: 10,
        features: [
            'Advanced AI analysis',
            'Enhanced PDF reports',
            'Up to 25MB file size',
            'Advanced risk detection',
            'Priority email support (24h response)',
            '30-day contract history',
            'Export to Word & Excel',
            'Detailed clause explanations',
            'Contract comparison tool'
        ]
    },
    business: {
        contractsPerMonth: 50,
        features: [
            'Premium AI analysis with deep insights',
            'Professional branded PDF reports',
            'Up to 100MB file size',
            'AI-powered risk scoring & recommendations',
            'Priority support (12h response)',
            'Unlimited contract history',
            'Export to Word, Excel, CSV & JSON',
            'Advanced clause analysis & suggestions',
            'Bulk contract processing',
            'Advanced analytics dashboard',
            'Custom notification settings'
        ]
    },
    enterprise: {
        contractsPerMonth: -1, // unlimited
        features: [
            'Premium AI analysis with deep insights',
            'Professional branded PDF reports',
            'Unlimited file size',
            'AI-powered risk scoring & recommendations',
            'Dedicated account manager',
            'Unlimited contract history',
            'Export to Word, Excel, CSV & JSON',
            'Advanced clause analysis & suggestions',
            'Bulk contract processing',
            'Custom contract templates',
            'API access for integrations',
            'Advanced analytics dashboard',
            'Team collaboration (unlimited members)',
            'Custom notification settings',
            'Custom integrations',
            'SLA guarantee',
            'On-premise deployment option'
        ]
    }
};
//# sourceMappingURL=types.js.map