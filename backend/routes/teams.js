import express from 'express';
import { createTeam, getTeams, getTeamById, updateTeam, deleteTeam, getTeamMembers } from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.get('/:id/members', getTeamMembers);

export default router;
