import { saveReport } from '@/app/report/actions/saveReport';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import { generateSummary } from '@/lib/ai/passive/generateSummary';
import { categorizeReport } from '@/lib/ai/passive/categorizeReport';
import logger from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true)); // Assume DB connects successfully

// Define mock functions first
const mockSave = jest.fn();
const mockFindByIdAndUpdate = jest.fn();

// Mock the Report model methods, using the already defined mocks
jest.mock('@/models/Report', () => {
  // Mock the constructor and instance methods like save
  const MockReport = jest.fn().mockImplementation(payload => ({
    ...payload,
    _id: 'newMockId123', // Simulate generated ID
    save: mockSave,
  }));
  // Mock static methods like findByIdAndUpdate
  MockReport.findByIdAndUpdate = mockFindByIdAndUpdate;
  return MockReport;
});


jest.mock('@/lib/ai/passive/generateSummary', () => ({
  generateSummary: jest.fn(),
}));
jest.mock('@/lib/ai/passive/categorizeReport', () => ({
  categorizeReport: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('saveReport Server Action', () => {
  const baseReportData = {
    title: 'Test Report',
    content: 'This is test content.',
    userId: 'user123',
    groupId: 'group456',
  };
  const mockSummaryResult = { summary: 'Test summary.', meta: { modelUsed: 'summary-model' } };
  const mockCategoryResult = { tags: ['test', 'feature'], meta: { modelUsed: 'category-model' } };
  const mockSavedReport = {
      ...baseReportData,
      _id: 'mockId789',
      ai_summary: mockSummaryResult.summary,
      ai_tags: mockCategoryResult.tags,
      aiMeta: expect.any(Object), // We'll check specific meta fields if needed
      createdAt: new Date(),
      updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Default successful mock implementations
    generateSummary.mockResolvedValue(mockSummaryResult);
    categorizeReport.mockResolvedValue(mockCategoryResult);
    mockSave.mockResolvedValue({ ...baseReportData, _id: 'newMockId123', ...mockSavedReport }); // Simulate save result
    mockFindByIdAndUpdate.mockResolvedValue(mockSavedReport); // Simulate update result
  });

  it('should create a new report successfully with AI processing', async () => {
    const reportData = { ...baseReportData }; // No reportId means create
    mockSave.mockResolvedValueOnce({ // Ensure save mock returns something sensible for create
        ...reportData,
        _id: 'newCreatedId',
        ai_summary: mockSummaryResult.summary,
        ai_tags: mockCategoryResult.tags,
        aiMeta: expect.any(Object),
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const result = await saveReport(reportData);

    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report._id).toBe('newCreatedId');
    expect(result.report.ai_summary).toBe(mockSummaryResult.summary);
    expect(result.report.ai_tags).toEqual(mockCategoryResult.tags);
    expect(result.error).toBeUndefined();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(generateSummary).toHaveBeenCalledWith(reportData.content);
    expect(categorizeReport).toHaveBeenCalledWith(reportData.content, mockSummaryResult.summary);
    expect(Report).toHaveBeenCalledWith(expect.objectContaining({ // Check constructor payload
        title: reportData.title,
        content: reportData.content,
        ai_summary: mockSummaryResult.summary,
        ai_tags: mockCategoryResult.tags,
    }));
    expect(mockSave).toHaveBeenCalledTimes(1); // Check instance save was called
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/report/newCreatedId');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Starting saveReport action (operation: create)'));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('New report created successfully'));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('saveReport action completed successfully'));
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should update an existing report successfully with AI processing', async () => {
    const reportData = { ...baseReportData, reportId: 'existingId123' };
    mockFindByIdAndUpdate.mockResolvedValueOnce({ // Ensure update mock returns something sensible
        ...reportData,
        _id: reportData.reportId,
        ai_summary: mockSummaryResult.summary,
        ai_tags: mockCategoryResult.tags,
        aiMeta: expect.any(Object),
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const result = await saveReport(reportData);

    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report._id).toBe('existingId123');
    expect(result.report.ai_summary).toBe(mockSummaryResult.summary);
    expect(result.report.ai_tags).toEqual(mockCategoryResult.tags);
    expect(result.error).toBeUndefined();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(generateSummary).toHaveBeenCalledWith(reportData.content);
    expect(categorizeReport).toHaveBeenCalledWith(reportData.content, mockSummaryResult.summary);
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      reportData.reportId,
      { $set: expect.objectContaining({ title: reportData.title, ai_summary: mockSummaryResult.summary, ai_tags: mockCategoryResult.tags }) },
      { new: true, runValidators: true }
    );
    expect(Report).not.toHaveBeenCalled(); // Constructor shouldn't be called for update
    expect(mockSave).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/report/existingId123');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Starting saveReport action (operation: update)'));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Report updated successfully'));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('saveReport action completed successfully'));
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should return error if required fields are missing', async () => {
    const reportData = { ...baseReportData, title: '' }; // Missing title
    const result = await saveReport(reportData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Missing required fields.');
    expect(result.report).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith('saveReport validation failed: Missing required fields.', reportData);
    expect(connectDB).not.toHaveBeenCalled();
  });

  it('should proceed with saving even if generateSummary fails', async () => {
    const reportData = { ...baseReportData };
    const summaryError = new Error('Summary AI failed');
    generateSummary.mockRejectedValue(summaryError);
    // categorizeReport should still be called and succeed
    categorizeReport.mockResolvedValue(mockCategoryResult);
    mockSave.mockResolvedValueOnce({ // Save should still happen, but without summary
        ...reportData,
        _id: 'newIdNoSummary',
        ai_summary: '', // Expect empty summary
        ai_tags: mockCategoryResult.tags,
        aiMeta: expect.any(Object),
    });


    const result = await saveReport(reportData);

    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report.ai_summary).toBe(''); // Summary should be empty
    expect(result.report.ai_tags).toEqual(mockCategoryResult.tags); // Tags should be present
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('AI summary generation failed'), summaryError);
    expect(generateSummary).toHaveBeenCalledTimes(1);
    expect(categorizeReport).toHaveBeenCalledWith(reportData.content, ''); // Called with empty summary
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalled();
  });

   it('should proceed with saving even if categorizeReport fails', async () => {
    const reportData = { ...baseReportData };
    const categoryError = new Error('Category AI failed');
    // generateSummary succeeds
    generateSummary.mockResolvedValue(mockSummaryResult);
    categorizeReport.mockRejectedValue(categoryError);
    mockSave.mockResolvedValueOnce({ // Save should still happen, but without tags
        ...reportData,
        _id: 'newIdNoTags',
        ai_summary: mockSummaryResult.summary, // Expect summary
        ai_tags: [], // Expect empty tags
        aiMeta: expect.any(Object),
    });

    const result = await saveReport(reportData);

    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report.ai_summary).toBe(mockSummaryResult.summary);
    expect(result.report.ai_tags).toEqual([]); // Tags should be empty
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('AI categorization failed'), categoryError);
    expect(generateSummary).toHaveBeenCalledTimes(1);
    expect(categorizeReport).toHaveBeenCalledWith(reportData.content, mockSummaryResult.summary);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('should return error if report not found during update', async () => {
    const reportData = { ...baseReportData, reportId: 'notFoundId' };
    mockFindByIdAndUpdate.mockResolvedValue(null); // Simulate report not found

    const result = await saveReport(reportData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Report not found for update.');
    expect(result.report).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(`Report update failed: Report not found (ID: ${reportData.reportId}).`);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should return error if database save fails', async () => {
    const reportData = { ...baseReportData }; // Create new
    const dbError = new Error('DB save failed');
    mockSave.mockRejectedValue(dbError); // Simulate save error

    const result = await saveReport(reportData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to save report due to a server error.');
    expect(result.report).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error during saveReport action'), dbError);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

   it('should return validation error if database validation fails', async () => {
    const reportData = { ...baseReportData }; // Create new
    const validationError = new Error('Validation failed: Title too short');
    validationError.name = 'ValidationError';
    mockSave.mockRejectedValue(validationError); // Simulate validation error

    const result = await saveReport(reportData);

    expect(result.success).toBe(false);
    expect(result.error).toBe(`Validation failed: ${validationError.message}`);
    expect(result.report).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error during saveReport action'), validationError);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

});