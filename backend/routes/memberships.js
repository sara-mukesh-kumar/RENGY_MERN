import express from 'express';
import {
  addUserToTeam, removeUserFromTeam, assignRoleToUserInTeam,
  getUserPermissionsInTeam, getUserTeams,
} from '../controllers/membershipController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/teams/:teamId/members', addUserToTeam);
router.delete('/teams/:teamId/members/:userId', removeUserFromTeam);
router.put('/teams/:teamId/members/:userId/roles', assignRoleToUserInTeam);
router.get('/teams/:teamId/members/:userId/permissions', getUserPermissionsInTeam);
router.get('/users/:userId/teams', getUserTeams);

export default router;
