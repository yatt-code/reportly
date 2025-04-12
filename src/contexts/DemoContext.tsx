'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, usePathname } from 'next/navigation';
import logger from '@/lib/utils/logger';

// Define the shape of a demo report
interface DemoReport {
  _id: string;
  title: string;
  content: string;
  userId: string;
  workspaceId: string;
  organizationId: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  sentimentTags: string[];
  ai_tags?: string[];
  ai_summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the shape of a demo comment
interface DemoComment {
  _id: string;
  reportId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  userDisplayName: string;
  userAvatarUrl?: string;
}

// Define the shape of the demo user
interface DemoUser {
  id: string;
  email: string;
  role: string;
  displayName: string;
  avatarUrl?: string;
}

// Define the shape of the demo context
interface DemoContextType {
  isDemoMode: boolean;
  demoUser: DemoUser;
  demoReports: DemoReport[];
  demoComments: DemoComment[];
  addDemoReport: (report: Partial<DemoReport>) => DemoReport;
  updateDemoReport: (reportId: string, updates: Partial<DemoReport>) => DemoReport | null;
  deleteDemoReport: (reportId: string) => boolean;
  getDemoReport: (reportId: string) => DemoReport | null;
  addDemoComment: (comment: Partial<DemoComment>) => DemoComment;
  getDemoComments: (reportId: string) => DemoComment[];
  deleteDemoComment: (commentId: string) => boolean;
  clearDemoData: () => void;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

// Create the context with a default value
const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Demo mode provider props
interface DemoProviderProps {
  children: ReactNode;
}

// Sample demo data
const DEMO_USER: DemoUser = {
  id: 'demo-user-123',
  email: 'demo@reportly.app',
  role: 'developer',
  displayName: 'Demo User',
  avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
};

// Generate some initial demo reports
const generateInitialDemoReports = (): DemoReport[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      _id: uuidv4(),
      title: 'Welcome to Reportly Demo',
      content: '<h1>Welcome to Reportly!</h1><p>This is a demo report to help you get started with Reportly. Feel free to edit this report or create new ones.</p><p>All changes you make in demo mode are stored only in your browser and will be lost when you close the browser or clear your cache.</p>',
      userId: DEMO_USER.id,
      workspaceId: 'demo-workspace-123',
      organizationId: 'demo-org-123',
      status: 'published',
      tags: ['welcome', 'demo'],
      sentimentTags: ['positive', 'informational'],
      ai_tags: ['welcome', 'introduction', 'demo'],
      ai_summary: 'A welcome report introducing the demo mode of Reportly.',
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
    {
      _id: uuidv4(),
      title: 'Weekly Progress Report',
      content: '<h1>Weekly Progress Report</h1><h2>Accomplishments</h2><ul><li>Completed feature X implementation</li><li>Fixed 3 critical bugs</li><li>Improved test coverage by 15%</li></ul><h2>Challenges</h2><p>Integration with third-party API is taking longer than expected due to documentation issues.</p><h2>Next Steps</h2><ul><li>Complete API integration</li><li>Start work on feature Y</li><li>Prepare for next sprint planning</li></ul>',
      userId: DEMO_USER.id,
      workspaceId: 'demo-workspace-123',
      organizationId: 'demo-org-123',
      status: 'published',
      tags: ['weekly', 'progress'],
      sentimentTags: ['neutral', 'informational'],
      ai_tags: ['progress', 'report', 'weekly'],
      ai_summary: 'Weekly progress report detailing accomplishments, challenges, and next steps.',
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      _id: uuidv4(),
      title: 'Project Kickoff Notes',
      content: '<h1>Project Kickoff Meeting</h1><h2>Project Overview</h2><p>The new customer portal project aims to improve user experience and add self-service capabilities.</p><h2>Timeline</h2><ul><li>Phase 1: Requirements gathering (2 weeks)</li><li>Phase 2: Design and prototyping (3 weeks)</li><li>Phase 3: Development (8 weeks)</li><li>Phase 4: Testing and deployment (3 weeks)</li></ul><h2>Team Members</h2><ul><li>Project Manager: Jane Smith</li><li>Lead Developer: John Doe</li><li>Designer: Alice Johnson</li><li>QA Lead: Bob Brown</li></ul>',
      userId: DEMO_USER.id,
      workspaceId: 'demo-workspace-123',
      organizationId: 'demo-org-123',
      status: 'draft',
      tags: ['project', 'kickoff', 'meeting'],
      sentimentTags: ['positive', 'planning'],
      ai_tags: ['project', 'kickoff', 'planning'],
      ai_summary: 'Notes from the project kickoff meeting including overview, timeline, and team members.',
      createdAt: now,
      updatedAt: now,
    }
  ];
};

// Generate some initial demo comments
const generateInitialDemoComments = (reports: DemoReport[]): DemoComment[] => {
  const comments: DemoComment[] = [];
  const now = new Date();
  const hourAgo = new Date(now);
  hourAgo.setHours(hourAgo.getHours() - 1);
  const dayAgo = new Date(now);
  dayAgo.setDate(dayAgo.getDate() - 1);

  // Only add comments to the first report (Welcome report)
  if (reports.length > 0) {
    const welcomeReportId = reports[0]._id;

    // Add a parent comment
    const parentComment: DemoComment = {
      _id: uuidv4(),
      reportId: welcomeReportId,
      userId: 'demo-user-456',
      content: 'Great introduction to Reportly! This demo mode is really helpful for new users.',
      createdAt: dayAgo,
      updatedAt: dayAgo,
      userDisplayName: 'Demo Colleague',
      userAvatarUrl: 'https://ui-avatars.com/api/?name=Demo+Colleague&background=4CAF50&color=fff',
    };
    comments.push(parentComment);

    // Add a reply to the parent comment
    comments.push({
      _id: uuidv4(),
      reportId: welcomeReportId,
      userId: DEMO_USER.id,
      content: 'Thanks for the feedback! Feel free to explore all the features in demo mode.',
      parentId: parentComment._id,
      createdAt: hourAgo,
      updatedAt: hourAgo,
      userDisplayName: DEMO_USER.displayName,
      userAvatarUrl: DEMO_USER.avatarUrl,
    });
  }

  return comments;
};

/**
 * Provider component for demo mode functionality.
 * Manages demo state and provides mock data for the demo mode.
 */
export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  // Initialize state from localStorage if available
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoReports, setDemoReports] = useState<DemoReport[]>([]);
  const [demoComments, setDemoComments] = useState<DemoComment[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize demo data from localStorage on mount
  useEffect(() => {
    const storedDemoMode = localStorage.getItem('reportly_demo_mode');
    const storedDemoReports = localStorage.getItem('reportly_demo_reports');
    const storedDemoComments = localStorage.getItem('reportly_demo_comments');

    if (storedDemoMode === 'true') {
      setIsDemoMode(true);

      if (storedDemoReports) {
        try {
          setDemoReports(JSON.parse(storedDemoReports));
        } catch (error) {
          logger.error('[DemoContext] Error parsing stored demo reports:', error);
          const initialReports = generateInitialDemoReports();
          setDemoReports(initialReports);
        }
      } else {
        const initialReports = generateInitialDemoReports();
        setDemoReports(initialReports);
      }

      if (storedDemoComments) {
        try {
          setDemoComments(JSON.parse(storedDemoComments));
        } catch (error) {
          logger.error('[DemoContext] Error parsing stored demo comments:', error);
          const initialReports = generateInitialDemoReports();
          setDemoComments(generateInitialDemoComments(initialReports));
        }
      } else {
        const initialReports = demoReports.length > 0 ? demoReports : generateInitialDemoReports();
        setDemoComments(generateInitialDemoComments(initialReports));
      }
    }
  }, []);

  // Update localStorage when demo state changes
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem('reportly_demo_mode', 'true');
      localStorage.setItem('reportly_demo_reports', JSON.stringify(demoReports));
      localStorage.setItem('reportly_demo_comments', JSON.stringify(demoComments));
    } else {
      localStorage.removeItem('reportly_demo_mode');
      localStorage.removeItem('reportly_demo_reports');
      localStorage.removeItem('reportly_demo_comments');
    }
  }, [isDemoMode, demoReports, demoComments]);

  // Add a new demo report
  const addDemoReport = (report: Partial<DemoReport>): DemoReport => {
    const now = new Date();
    const newReport: DemoReport = {
      _id: uuidv4(),
      title: report.title || 'Untitled Report',
      content: report.content || '',
      userId: DEMO_USER.id,
      workspaceId: 'demo-workspace-123',
      organizationId: 'demo-org-123',
      status: report.status || 'draft',
      tags: report.tags || [],
      sentimentTags: report.sentimentTags || [],
      ai_tags: report.ai_tags || [],
      ai_summary: report.ai_summary || '',
      createdAt: now,
      updatedAt: now,
    };

    setDemoReports(prevReports => [newReport, ...prevReports]);
    return newReport;
  };

  // Update an existing demo report
  const updateDemoReport = (reportId: string, updates: Partial<DemoReport>): DemoReport | null => {
    let updatedReport: DemoReport | null = null;

    setDemoReports(prevReports => {
      const reportIndex = prevReports.findIndex(r => r._id === reportId);
      if (reportIndex === -1) return prevReports;

      const updatedReports = [...prevReports];
      updatedReports[reportIndex] = {
        ...updatedReports[reportIndex],
        ...updates,
        updatedAt: new Date(),
      };

      updatedReport = updatedReports[reportIndex];
      return updatedReports;
    });

    return updatedReport;
  };

  // Delete a demo report
  const deleteDemoReport = (reportId: string): boolean => {
    let deleted = false;

    setDemoReports(prevReports => {
      const reportIndex = prevReports.findIndex(r => r._id === reportId);
      if (reportIndex === -1) return prevReports;

      deleted = true;
      const updatedReports = [...prevReports];
      updatedReports.splice(reportIndex, 1);
      return updatedReports;
    });

    // Also delete any comments associated with this report
    if (deleted) {
      setDemoComments(prevComments =>
        prevComments.filter(comment => comment.reportId !== reportId)
      );
    }

    return deleted;
  };

  // Get a specific demo report
  const getDemoReport = (reportId: string): DemoReport | null => {
    return demoReports.find(r => r._id === reportId) || null;
  };

  // Add a new demo comment
  const addDemoComment = (comment: Partial<DemoComment>): DemoComment => {
    const now = new Date();
    const newComment: DemoComment = {
      _id: uuidv4(),
      reportId: comment.reportId || '',
      userId: DEMO_USER.id,
      content: comment.content || '',
      parentId: comment.parentId,
      createdAt: now,
      updatedAt: now,
      userDisplayName: DEMO_USER.displayName,
      userAvatarUrl: DEMO_USER.avatarUrl,
    };

    setDemoComments(prevComments => [...prevComments, newComment]);
    return newComment;
  };

  // Get comments for a specific report
  const getDemoComments = (reportId: string): DemoComment[] => {
    return demoComments.filter(c => c.reportId === reportId);
  };

  // Delete a demo comment
  const deleteDemoComment = (commentId: string): boolean => {
    let deleted = false;

    setDemoComments(prevComments => {
      const commentIndex = prevComments.findIndex(c => c._id === commentId);
      if (commentIndex === -1) return prevComments;

      deleted = true;
      const updatedComments = [...prevComments];
      updatedComments.splice(commentIndex, 1);
      return updatedComments;
    });

    return deleted;
  };

  // Clear all demo data
  const clearDemoData = () => {
    setDemoReports([]);
    setDemoComments([]);
    localStorage.removeItem('reportly_demo_reports');
    localStorage.removeItem('reportly_demo_comments');
  };

  // Enter demo mode
  const enterDemoMode = () => {
    setIsDemoMode(true);

    // Set a cookie for demo mode (for server components)
    document.cookie = 'reportly_demo_mode=true; path=/; max-age=86400'; // 24 hours

    // Initialize with default data if empty
    if (demoReports.length === 0) {
      const initialReports = generateInitialDemoReports();
      setDemoReports(initialReports);
      setDemoComments(generateInitialDemoComments(initialReports));
    }

    // Redirect to dashboard if not already there
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  // Exit demo mode
  const exitDemoMode = () => {
    setIsDemoMode(false);

    // Remove the demo mode cookie
    document.cookie = 'reportly_demo_mode=; path=/; max-age=0';

    router.push('/');
  };

  // Context value
  const value: DemoContextType = {
    isDemoMode,
    demoUser: DEMO_USER,
    demoReports,
    demoComments,
    addDemoReport,
    updateDemoReport,
    deleteDemoReport,
    getDemoReport,
    addDemoComment,
    getDemoComments,
    deleteDemoComment,
    clearDemoData,
    enterDemoMode,
    exitDemoMode,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

/**
 * Hook to use the demo context.
 * Throws an error if used outside of a DemoProvider.
 */
export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
