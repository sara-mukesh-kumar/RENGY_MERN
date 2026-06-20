import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Permission from './models/Permission.js';
import Role from './models/Role.js';
import Team from './models/Team.js';
import TeamMembership from './models/TeamMembership.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

// Clear
await Promise.all([User.deleteMany(), Permission.deleteMany(), Role.deleteMany(), Team.deleteMany(), TeamMembership.deleteMany()]);

// Permissions
const perms = await Permission.insertMany([
  { name: 'CREATE_TASK', description: 'Create new tasks', category: 'task' },
  { name: 'EDIT_TASK', description: 'Edit existing tasks', category: 'task' },
  { name: 'DELETE_TASK', description: 'Delete tasks', category: 'task' },
  { name: 'VIEW_TASK', description: 'View tasks', category: 'task' },
  { name: 'MANAGE_MEMBERS', description: 'Add or remove team members', category: 'team' },
  { name: 'VIEW_REPORTS', description: 'View team reports', category: 'report' },
  { name: 'MANAGE_ROLES', description: 'Assign roles to members', category: 'team' },
  { name: 'VIEW_ONLY', description: 'Read-only access', category: 'task' },
]);

const permMap = Object.fromEntries(perms.map(p => [p.name, p._id]));

// Roles
const roles = await Role.insertMany([
  {
    name: 'Admin',
    description: 'Full access to all features',
    color: '#ef4444',
    permissions: [permMap.CREATE_TASK, permMap.EDIT_TASK, permMap.DELETE_TASK, permMap.VIEW_TASK, permMap.MANAGE_MEMBERS, permMap.VIEW_REPORTS, permMap.MANAGE_ROLES],
  },
  {
    name: 'Manager',
    description: 'Manage tasks and view reports',
    color: '#f59e0b',
    permissions: [permMap.CREATE_TASK, permMap.EDIT_TASK, permMap.VIEW_TASK, permMap.VIEW_REPORTS, permMap.MANAGE_MEMBERS],
  },
  {
    name: 'Developer',
    description: 'Create and edit tasks',
    color: '#3b82f6',
    permissions: [permMap.CREATE_TASK, permMap.EDIT_TASK, permMap.VIEW_TASK],
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    color: '#6b7280',
    permissions: [permMap.VIEW_TASK, permMap.VIEW_ONLY],
  },
]);

const roleMap = Object.fromEntries(roles.map(r => [r.name, r._id]));

// Users
const users = await User.insertMany([
  { name: 'Alice Admin', email: 'alice@demo.com', password: 'password123' },
  { name: 'Bob Manager', email: 'bob@demo.com', password: 'password123' },
  { name: 'Carol Dev', email: 'carol@demo.com', password: 'password123' },
  { name: 'Dave Viewer', email: 'dave@demo.com', password: 'password123' },
]);

const [alice, bob, carol, dave] = users;

// Teams
const teams = await Team.insertMany([
  { name: 'Team Alpha', description: 'Frontend development team', color: '#8b5cf6', createdBy: alice._id },
  { name: 'Team Beta', description: 'Backend API team', color: '#06b6d4', createdBy: bob._id },
]);

const [alpha, beta] = teams;

// Memberships (User -> Team -> Roles)
await TeamMembership.insertMany([
  { user: alice._id, team: alpha._id, roles: [roleMap.Admin] },
  { user: alice._id, team: beta._id, roles: [roleMap.Viewer] },       // Alice is Admin in Alpha, Viewer in Beta
  { user: bob._id, team: alpha._id, roles: [roleMap.Manager] },
  { user: bob._id, team: beta._id, roles: [roleMap.Admin] },
  { user: carol._id, team: alpha._id, roles: [roleMap.Developer] },
  { user: carol._id, team: beta._id, roles: [roleMap.Developer, roleMap.Manager] },
  { user: dave._id, team: alpha._id, roles: [roleMap.Viewer] },
]);

console.log('✅ Seed data inserted!');
console.log('Demo login: alice@demo.com / password123');
await mongoose.disconnect();
