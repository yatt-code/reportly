#!/bin/bash

# Run all Comment and Mentions tests
echo "Running all Comment and Mentions tests..."
echo "----------------------------------------"

# Comment Thread tests
echo "\n🧪 Running CommentThread tests..."
npm test -- tests/unit/components/comments/CommentThread.test.tsx

# MentionInput tests
echo "\n🧪 Running MentionInput tests..."
npm test -- tests/unit/components/comments/MentionInput.simplified.test.tsx

# Users in Group tests
echo "\n🧪 Running getUsersInGroup tests..."
npm test -- tests/unit/lib/users/getUsersInGroup.test.ts

# Process Mentions tests
echo "\n🧪 Running processMentions tests..."
npm test -- tests/unit/lib/comments/processMentions.test.ts

# Delete Comment Auth tests
echo "\n🧪 Running deleteCommentAuth tests..."
npm test -- tests/unit/lib/comments/deleteCommentAuth.test.ts

echo "\n✅ All Comment and Mentions tests completed!"
