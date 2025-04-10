import { getSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import logger from '@/lib/utils/logger';

/**
 * Process @mentions in a comment and create notifications for mentioned users
 * 
 * @param commentContent - The content of the comment
 * @param commentId - The ID of the comment
 * @param reportId - The ID of the report containing the comment
 * @param currentUserId - The ID of the user who created the comment
 */
export async function processMentions(
  commentContent: string,
  commentId: string,
  reportId: string,
  currentUserId: string
) {
  // Extract mentions from content (simple regex for @username)
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(commentContent)) !== null) {
    mentions.push(match[1]); // Extract the username without @
  }
  
  if (mentions.length === 0) {
    return; // No mentions to process
  }
  
  logger.log('Processing mentions in comment', { 
    commentId, 
    mentions,
    currentUserId
  });
  
  try {
    // Get Supabase client
    const supabase = getSupabaseServiceRoleClient();
    
    // Look up user IDs for the mentioned usernames
    const { data: users, error: lookupError } = await supabase
      .from('users')
      .select('id, username')
      .in('username', mentions);
    
    if (lookupError || !users) {
      logger.error('Failed to look up mentioned users', { lookupError });
      return;
    }
    
    // Filter out self-mentions
    const mentionedUserIds = users
      .filter(user => user.id !== currentUserId)
      .map(user => user.id);
    
    if (mentionedUserIds.length === 0) {
      logger.log('No users to notify (only self-mentions)');
      return;
    }
    
    // Create notifications
    const notifications = mentionedUserIds.map(userId => ({
      userId,
      type: 'mention',
      contextId: commentId,
      reportId,
    }));
    
    logger.log('Creating mention notifications', { 
      notificationCount: notifications.length,
      mentionedUserIds
    });
    
    // Insert notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (insertError) {
      logger.error('Failed to insert mention notifications', { insertError });
    } else {
      logger.log('Successfully created mention notifications');
    }
  } catch (error) {
    logger.error('Error processing mentions', { 
      commentId, 
      error,
      mentions
    });
  }
}
