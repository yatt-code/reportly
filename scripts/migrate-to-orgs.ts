/**
 * Migration Script for Organization & Workspace Layer
 * 
 * This script migrates existing data to the new multi-tenant architecture:
 * 1. Creates a default organization for each user
 * 2. Creates a default workspace for each user
 * 3. Updates user documents with organizationId and workspaceIds
 * 4. Updates reports with workspaceId and organizationId
 * 5. Updates comments with workspaceId and organizationId
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Report from '../src/models/Report';
import CommentModel from '../src/models/Comment';
import { Organization } from '../src/models/Organization';
import { Workspace } from '../src/models/Workspace';

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Main migration function
async function migrateToOrgs() {
  console.log('Starting migration to Organizations & Workspaces...');
  
  try {
    // Connect to the database
    await connectDB();
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    for (const user of users) {
      console.log(`Processing user: ${user.username} (${user._id})`);
      
      // 1. Create default organization
      const organization = new Organization({
        name: `${user.username}'s Organization`,
        ownerId: user._id.toString(),
      });
      await organization.save();
      console.log(`Created organization: ${organization.name} (${organization._id})`);
      
      // 2. Create default workspace
      const workspace = new Workspace({
        name: 'My Workspace',
        organizationId: organization._id.toString(),
        type: 'team',
        memberIds: [user._id.toString()],
      });
      await workspace.save();
      console.log(`Created workspace: ${workspace.name} (${workspace._id})`);
      
      // 3. Update user with organization and workspace IDs
      user.organizationId = organization._id.toString();
      user.workspaceIds = [workspace._id.toString()];
      user.activeWorkspaceId = workspace._id.toString();
      await user.save();
      console.log(`Updated user with organization and workspace IDs`);
      
      // 4. Update reports
      const reports = await Report.find({ userId: user._id.toString() });
      console.log(`Found ${reports.length} reports to update for user ${user.username}`);
      
      for (const report of reports) {
        report.workspaceId = workspace._id.toString();
        report.organizationId = organization._id.toString();
        await report.save();
      }
      console.log(`Updated ${reports.length} reports with workspace and organization IDs`);
      
      // 5. Update comments
      const comments = await CommentModel.find({ userId: user._id.toString() });
      console.log(`Found ${comments.length} comments to update for user ${user.username}`);
      
      for (const comment of comments) {
        comment.workspaceId = workspace._id.toString();
        comment.organizationId = organization._id.toString();
        await comment.save();
      }
      console.log(`Updated ${comments.length} comments with workspace and organization IDs`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateToOrgs().catch(console.error);
