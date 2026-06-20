import Team from '../models/Team.js';
import TeamMembership from '../models/TeamMembership.js';

export const createTeam = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const team = await Team.create({ name, description, color, createdBy: req.user._id });
    // Auto-add creator as member
    await TeamMembership.create({ user: req.user._id, team: team._id, roles: [] });
    res.status(201).json({ success: true, team });
  } catch (err) {
    next(err);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const skip = (page - 1) * limit;
    const [teams, total] = await Promise.all([
      Team.find(query).populate('createdBy', 'name email').skip(skip).limit(Number(limit)).sort('-createdAt'),
      Team.countDocuments(query),
    ]);
    // Enrich with member count
    const enriched = await Promise.all(teams.map(async (t) => {
      const count = await TeamMembership.countDocuments({ team: t._id });
      return { ...t.toObject(), memberCount: count };
    }));
    res.json({ success: true, teams: enriched, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('createdBy', 'name email');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const memberCount = await TeamMembership.countDocuments({ team: team._id });
    res.json({ success: true, team: { ...team.toObject(), memberCount } });
  } catch (err) {
    next(err);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (err) {
    next(err);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    await TeamMembership.deleteMany({ team: req.params.id });
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    next(err);
  }
};

export const getTeamMembers = async (req, res, next) => {
  try {
    const members = await TeamMembership.find({ team: req.params.id })
      .populate('user', 'name email createdAt')
      .populate({ path: 'roles', populate: { path: 'permissions' } });
    res.json({ success: true, members });
  } catch (err) {
    next(err);
  }
};
