import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#8b5cf6',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;
