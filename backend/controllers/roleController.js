import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

// ── Permissions ──────────────────────────────────────────────

export const createPermission = async (req, res, next) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json({ success: true, permission });
  } catch (err) {
    next(err);
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find().sort('category name');
    res.json({ success: true, permissions });
  } catch (err) {
    next(err);
  }
};

export const deletePermission = async (req, res, next) => {
  try {
    await Permission.findByIdAndDelete(req.params.id);
    // Remove from all roles
    await Role.updateMany({}, { $pull: { permissions: req.params.id } });
    res.json({ success: true, message: 'Permission deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Roles ─────────────────────────────────────────────────────

export const createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({ success: true, role });
  } catch (err) {
    next(err);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().populate('permissions').sort('name');
    res.json({ success: true, roles });
  } catch (err) {
    next(err);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, role });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('permissions');
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, role });
  } catch (err) {
    next(err);
  }
};

export const assignPermissionsToRole = async (req, res, next) => {
  try {
    const { permissionIds } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { permissions: permissionIds },
      { new: true }
    ).populate('permissions');
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, role });
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
};
