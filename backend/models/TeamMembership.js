import mongoose from 'mongoose';

// This is the core RBAC mapping: User -> Team -> Role(s)
const teamMembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  }],
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// A user can only be a member once per team
teamMembershipSchema.index({ user: 1, team: 1 }, { unique: true });

const TeamMembership = mongoose.model('TeamMembership', teamMembershipSchema);
export default TeamMembership;
