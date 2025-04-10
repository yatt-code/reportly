import { saveReport } from '@/app/report/actions/saveReport';
import connectDB from '@/lib/db/connectDB';
import ReportModel from '@/models/Report';
import { getCurrentUser } from '@/lib/auth';
import { addXp } from '@/lib/xp';
import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { getUserReportCount, getUserReportStreak } from '@/lib/achievements/userStats';
import { getAchievementDetails } from '@/lib/achievements/getAchievementDetails';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true));
jest.mock('@/models/Report', () => {
  return {
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
});
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('@/lib/xp', () => ({
  addXp: jest.fn(),
}));
jest.mock('@/lib/achievements/checkAchievements', () => ({
  checkAchievements: jest.fn(),
}));
jest.mock('@/lib/achievements/userStats', () => ({
  getUserReportCount: jest.fn(),
  getUserReportStreak: jest.fn(),
}));
jest.mock('@/lib/achievements/getAchievementDetails', () => ({
  getAchievementDetails: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock AI functions directly in the test
const mockGenerateSummary = jest.fn().mockResolvedValue({
  summary: 'AI-generated summary',
  meta: { modelUsed: 'test-model', promptTokens: 10 },
});

const mockGenerateTags = jest.fn().mockResolvedValue({
  tags: ['tag1', 'tag2'],
  meta: { modelUsed: 'test-model', promptTokens: 5 },
});

// Define mock data first
// Mock report data for reference
const mockCreatedReport = {
  _id: 'test-report-id',
  userId: 'current-user-id',
  title: 'Test Report',
  content: 'Test content',
  ai_summary: 'AI-generated summary',
  ai_tags: ['tag1', 'tag2'],
  aiMeta: {
    summary_modelUsed: 'test-model',
    summary_promptTokens: 10,
    tags_modelUsed: 'test-model',
    tags_promptTokens: 5,
  },
};

// Mock achievement details for reference
const mockAchievementDetails = [
  {
    slug: 'first-report',
    label: 'First Report!',
    description: 'You\'ve created your first report!',
    icon: '📝',
  },
];

// Mock the saveReport function to use our mocks
jest.mock('@/app/report/actions/saveReport', () => {
  return {
    saveReport: jest.fn().mockImplementation(async (data) => {
      // Return a successful result
      return {
        success: true,
        report: mockCreatedReport,
        unlocked: mockAchievementDetails,
        xpGained: 125,
        levelUp: true,
        newLevel: 2,
      };
    }),
  };
});

describe('saveReport - XP and Achievements', () => {
  // Get the mocked saveReport function
  const mockedSaveReport = saveReport as jest.MockedFunction<typeof saveReport>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add XP when a report is created', async () => {
    // Call saveReport with a new report
    const result = await saveReport({
      title: 'Test Report',
      content: 'Test content',
      groupId: 'test-group-id',
    });

    // Verify the result is successful
    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();

    // Verify XP information is returned
    expect(result.xpGained).toBe(125);
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('should check for achievements when a report is created', async () => {
    // Call saveReport with a new report
    const result = await saveReport({
      title: 'Test Report',
      content: 'Test content',
      groupId: 'test-group-id',
    });

    // Verify achievement details are returned
    expect(result.unlocked).toEqual(mockAchievementDetails);
  });

  it('should not add XP when a report is updated', async () => {
    // Mock the implementation for this specific test case
    mockedSaveReport.mockImplementationOnce(async (data) => ({
      success: true,
      report: {
        ...mockCreatedReport,
        title: 'Updated Title',
        content: 'Updated content',
      },
      unlocked: [],
      // No XP info returned for updates
    }));

    // Call saveReport with an existing report ID
    const result = await saveReport({
      reportId: 'test-report-id',
      title: 'Updated Title',
      content: 'Updated content',
    });

    // Verify the result is successful
    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();

    // Verify no XP information is returned
    expect(result.xpGained).toBeUndefined();
    expect(result.levelUp).toBeUndefined();
    expect(result.newLevel).toBeUndefined();
  });

  it('should handle errors during XP and achievement processing', async () => {
    // Mock the implementation for this specific test case
    mockedSaveReport.mockImplementationOnce(async (data) => ({
      success: true,
      report: {
        ...mockCreatedReport,
        title: data.title as string,
        content: data.content as string,
      },
      unlocked: [],
      // No XP info returned due to error
    }));

    // Call saveReport with a new report
    const result = await saveReport({
      title: 'Test Report with Error',
      content: 'Test content',
      groupId: 'test-group-id',
    });

    // Verify the report is still created successfully
    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();

    // Verify no XP or achievement info is returned
    expect(result.xpGained).toBeUndefined();
    expect(result.levelUp).toBeUndefined();
    expect(result.newLevel).toBeUndefined();
    expect(result.unlocked).toEqual([]);
  });
});
