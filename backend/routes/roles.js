import express from 'express';
import {
  createPermission, getPermissions, deletePermission,
  createRole, getRoles, getRoleById, updateRole, assignPermissionsToRole, deleteRole,
} from '../controllers/roleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Permissions
router.post('/permissions', createPermission);
router.get('/permissions', getPermissions);
router.delete('/permissions/:id', deletePermission);

// Roles
router.post('/', createRole);
router.get('/', getRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.put('/:id/permissions', assignPermissionsToRole);
router.delete('/:id', deleteRole);

export default router;
