/**
 * This file imports all Comment and Mentions tests so they can be run together.
 * Run with: npm test -- tests/unit/comments-mentions.test.ts
 */

// Import all test files
import './components/comments/CommentThread.test';
import './components/comments/MentionInput.simplified.test';
import './lib/users/getUsersInGroup.test';
import './lib/comments/processMentions.test';
import './lib/comments/deleteCommentAuth.test';

// This is just a dummy test to make Jest happy
describe('Comments & Mentions Tests', () => {
  it('should run all imported tests', () => {
    expect(true).toBe(true);
  });
});
