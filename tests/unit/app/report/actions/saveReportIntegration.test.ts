import { saveReport } from '@/app/report/actions/saveReport';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true));
jest.mock('@/models/Report');
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('@/lib/ai/passive/generateSummary', () => ({
  generateSummary: jest.fn().mockResolvedValue({
    summary: 'Test summary',
    meta: { modelUsed: 'test-model' },
  }),
}));
jest.mock('@/lib/ai/passive/categorizeReport', () => ({
  categorizeReport: jest.fn().mockResolvedValue({
    tags: ['test', 'report'],
    meta: { modelUsed: 'test-model' },
  }),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));
jest.mock('@/lib/achievements/checkAchievements', () => ({
  checkAchievements: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/lib/achievements/userStats', () => ({
  getUserReportCount: jest.fn().mockResolvedValue(1),
  getUserReportStreak: jest.fn().mockResolvedValue(1),
}));
jest.mock('@/lib/achievements/getAchievementDetails', () => ({
  getAchievementDetails: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/lib/xp', () => ({
  addXp: jest.fn().mockResolvedValue({
    newXp: 100,
    newLevel: 1,
    levelUp: false,
    unlockedAchievements: [],
  }),
}));

describe('saveReport Integration Test', () => {
  // Mock data
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { role: 'developer' },
  };
  
  const mockReportData = {
    title: 'Test Report',
    content: '<p>Test content</p>',
    groupId: 'test-group-id',
  };
  
  const mockReportId = 'test-report-id';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });
  
  it('should create a new report and store it in the database', async () => {
    // Arrange
    const mockSave = jest.fn().mockResolvedValue({
      _id: mockReportId,
      ...mockReportData,
      userId: mockUser.id,
      ai_summary: 'Test summary',
      ai_tags: ['test', 'report'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    (Report as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));
    
    // Act
    const result = await saveReport(mockReportData);
    
    // Assert
    expect(connectDB).toHaveBeenCalled();
    expect(Report).toHaveBeenCalledWith(expect.objectContaining({
      title: mockReportData.title,
      content: mockReportData.content,
      userId: mockUser.id,
      groupId: mockReportData.groupId,
    }));
    expect(mockSave).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith(`/report/${mockReportId}`);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report._id).toBe(mockReportId);
  });
  
  it('should update an existing report in the database', async () => {
    // Arrange
    const updateReportData = {
      reportId: mockReportId,
      title: 'Updated Test Report',
      content: '<p>Updated test content</p>',
    };
    
    const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({
      _id: mockReportId,
      ...updateReportData,
      userId: mockUser.id,
      groupId: 'test-group-id',
      ai_summary: 'Test summary',
      ai_tags: ['test', 'report'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    (Report.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;
    
    // Act
    const result = await saveReport(updateReportData);
    
    // Assert
    expect(connectDB).toHaveBeenCalled();
    expect(Report.findByIdAndUpdate).toHaveBeenCalledWith(
      mockReportId,
      expect.objectContaining({
        $set: expect.objectContaining({
          title: updateReportData.title,
          content: updateReportData.content,
        }),
      }),
      expect.anything()
    );
    expect(revalidatePath).toHaveBeenCalledWith(`/report/${mockReportId}`);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report._id).toBe(mockReportId);
  });
  
  it('should handle validation errors', async () => {
    // Arrange
    const invalidReportData = {
      // Missing required title
      content: '<p>Test content</p>',
      groupId: 'test-group-id',
    };
    
    // Act
    const result = await saveReport(invalidReportData as any);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(connectDB).not.toHaveBeenCalled();
    expect(Report).not.toHaveBeenCalled();
  });
  
  it('should handle database errors', async () => {
    // Arrange
    const mockDbError = new Error('Database error');
    (connectDB as jest.Mock).mockRejectedValueOnce(mockDbError);
    
    // Act
    const result = await saveReport(mockReportData);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(Report).not.toHaveBeenCalled();
  });
});
