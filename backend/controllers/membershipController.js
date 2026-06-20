import TeamMembership from '../models/TeamMembership.js';
import User from '../models/User.js';

export const addUserToTeam = async (req, res, next) => {
  try {
    const { userId, roleIds = [] } = req.body;
    const { teamId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await TeamMembership.findOne({ user: userId, team: teamId });
    if (existing) return res.status(400).json({ success: false, message: 'User already in team' });

    const membership = await TeamMembership.create({ user: userId, team: teamId, roles: roleIds });
    await membership.populate([
      { path: 'user', select: 'name email' },
      { path: 'roles', populate: { path: 'permissions' } },
    ]);
    res.status(201).json({ success: true, membership });
  } catch (err) {
    next(err);
  }
};

export const removeUserFromTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    const deleted = await TeamMembership.findOneAndDelete({ user: userId, team: teamId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Membership not found' });
    res.json({ success: true, message: 'User removed from team' });
  } catch (err) {
    next(err);
  }
};

export const assignRoleToUserInTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    const { roleIds } = req.body;

    const membership = await TeamMembership.findOneAndUpdate(
      { user: userId, team: teamId },
      { roles: roleIds },
      { new: true }
    ).populate([
      { path: 'user', select: 'name email' },
      { path: 'roles', populate: { path: 'permissions' } },
    ]);

    if (!membership) return res.status(404).json({ success: false, message: 'User is not in this team' });
    res.json({ success: true, membership });
  } catch (err) {
    next(err);
  }
};

export const getUserPermissionsInTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    const membership = await TeamMembership.findOne({ user: userId, team: teamId })
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .populate('user', 'name email');

    if (!membership) {
      return res.json({ success: true, permissions: [], roles: [], message: 'User is not a member of this team' });
    }

    // Deduplicate permissions across all roles
    const permissionsMap = new Map();
    for (const role of membership.roles) {
      for (const perm of role.permissions) {
        permissionsMap.set(perm._id.toString(), perm);
      }
    }
    const permissions = Array.from(permissionsMap.values());

    res.json({
      success: true,
      user: membership.user,
      roles: membership.roles,
      permissions,
      teamId,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserTeams = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const memberships = await TeamMembership.find({ user: userId })
      .populate('team')
      .populate({ path: 'roles', populate: { path: 'permissions' } });
    res.json({ success: true, memberships });
  } catch (err) {
    next(err);
  }
};
