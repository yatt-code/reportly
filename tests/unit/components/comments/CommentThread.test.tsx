import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentThread from '@/components/comments/CommentThread';
import type { CommentData } from '@/lib/schemas/commentSchemas';

// Mock the CommentItem component to simplify testing
jest.mock('@/components/comments/CommentItem', () => {
  return function MockCommentItem({ comment, depth }: { comment: CommentData; depth: number }) {
    return (
      <div data-testid={`comment-${comment._id}`} data-depth={depth}>
        {comment.content}
      </div>
    );
  };
});

describe('CommentThread', () => {
  // Mock comment data with parent-child relationships
  const mockComments: CommentData[] = [
    {
      _id: 'comment1',
      reportId: 'report1',
      userId: 'user1',
      content: 'Top level comment 1',
      parentId: null,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      _id: 'comment2',
      reportId: 'report1',
      userId: 'user2',
      content: 'Reply to comment 1',
      parentId: 'comment1',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      _id: 'comment3',
      reportId: 'report1',
      userId: 'user3',
      content: 'Nested reply to comment 2',
      parentId: 'comment2',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
    },
    {
      _id: 'comment4',
      reportId: 'report1',
      userId: 'user1',
      content: 'Another top level comment',
      parentId: null,
      createdAt: new Date('2023-01-04'),
      updatedAt: new Date('2023-01-04'),
    },
  ];

  const mockHandlers = {
    onDelete: jest.fn(),
    onReplySuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render top-level comments correctly', () => {
    render(
      <CommentThread
        comments={mockComments}
        onDelete={mockHandlers.onDelete}
        onReplySuccess={mockHandlers.onReplySuccess}
      />
    );

    // Check that top-level comments are rendered
    const comment1 = screen.getByTestId('comment-comment1');
    const comment4 = screen.getByTestId('comment-comment4');
    
    expect(comment1).toBeInTheDocument();
    expect(comment1).toHaveTextContent('Top level comment 1');
    expect(comment1.getAttribute('data-depth')).toBe('0');
    
    expect(comment4).toBeInTheDocument();
    expect(comment4).toHaveTextContent('Another top level comment');
    expect(comment4.getAttribute('data-depth')).toBe('0');
  });

  it('should render nested comments with correct depth', () => {
    render(
      <CommentThread
        comments={mockComments}
        onDelete={mockHandlers.onDelete}
        onReplySuccess={mockHandlers.onReplySuccess}
      />
    );

    // Check that nested comments are rendered with correct depth
    const comment2 = screen.getByTestId('comment-comment2');
    const comment3 = screen.getByTestId('comment-comment3');
    
    expect(comment2).toBeInTheDocument();
    expect(comment2).toHaveTextContent('Reply to comment 1');
    expect(comment2.getAttribute('data-depth')).toBe('1');
    
    expect(comment3).toBeInTheDocument();
    expect(comment3).toHaveTextContent('Nested reply to comment 2');
    expect(comment3.getAttribute('data-depth')).toBe('2');
  });

  it('should render only comments for the specified parentId', () => {
    render(
      <CommentThread
        comments={mockComments}
        parentId="comment1"
        onDelete={mockHandlers.onDelete}
        onReplySuccess={mockHandlers.onReplySuccess}
      />
    );

    // Should only render direct children of comment1
    expect(screen.getByTestId('comment-comment2')).toBeInTheDocument();
    
    // Should not render top-level comments or other nested comments
    expect(screen.queryByTestId('comment-comment1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('comment-comment4')).not.toBeInTheDocument();
  });

  it('should render nothing when there are no comments for the specified parentId', () => {
    const { container } = render(
      <CommentThread
        comments={mockComments}
        parentId="nonexistent"
        onDelete={mockHandlers.onDelete}
        onReplySuccess={mockHandlers.onReplySuccess}
      />
    );

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should pass the correct props to child components', () => {
    render(
      <CommentThread
        comments={mockComments}
        onDelete={mockHandlers.onDelete}
        onReplySuccess={mockHandlers.onReplySuccess}
      />
    );

    // Check that all comments are rendered
    expect(screen.getAllByTestId(/^comment-/)).toHaveLength(4);
    
    // Check depth attributes
    const comments = screen.getAllByTestId(/^comment-/);
    const depths = comments.map(comment => comment.getAttribute('data-depth'));
    
    // Should have depths [0, 1, 2, 0] for the mock comments
    expect(depths).toEqual(['0', '1', '2', '0']);
  });
});
