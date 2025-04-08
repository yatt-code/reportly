// Define interfaces for our data structures

export interface MockReport {
    id: string;
    title: string;
    status: 'Draft' | 'Complete';
    createdAt: Date;
    sentimentTags: string[]; // e.g., ['issue', 'update', 'task']
}

export interface MockActivityStats {
    dailyStreak: number;
    reportsThisWeek: number;
}

export interface MockHeatmapData {
    date: string; // YYYY-MM-DD
    count: number; // Number of reports on that day
}

// --- Mock Data Generation Functions ---

let reportIdCounter = 0;
const generateMockReport = (index: number): MockReport => {
    reportIdCounter++;
    const now = new Date();
    const pastDate = new Date(now.setDate(now.getDate() - index * 2)); // Reports every couple of days
    const statuses: Array<'Draft' | 'Complete'> = ['Draft', 'Complete'];
    const tags = [
        ['update', 'feature'],
        ['issue', 'bugfix'],
        ['task', 'planning'],
        ['documentation'],
        ['meeting', 'summary'],
    ];

    return {
        id: `report-${reportIdCounter.toString().padStart(3, '0')}`,
        title: `Report ${reportIdCounter}: ${['Project Phoenix Update', 'Bug Investigation QZ-12', 'Planning Session Notes', 'API Documentation Draft', 'Client Meeting Summary'][reportIdCounter % 5]}`,
        status: statuses[reportIdCounter % statuses.length],
        createdAt: pastDate,
        sentimentTags: tags[reportIdCounter % tags.length],
    };
};

export const getMockReports = (count: number = 5): MockReport[] => {
    reportIdCounter = 0; // Reset counter for consistent generation if called multiple times
    return Array.from({ length: count }, (_, i) => generateMockReport(i));
};

export const getMockActivityStats = (): MockActivityStats => {
    return {
        dailyStreak: 3, // Example streak
        reportsThisWeek: 5, // Example count
    };
};

export const getMockWeeklyHeatmapData = (): MockHeatmapData[] => {
    const today = new Date();
    const heatmapData: MockHeatmapData[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        heatmapData.push({
            date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            count: Math.floor(Math.random() * 5), // Random count 0-4
        });
    }
    return heatmapData;
};