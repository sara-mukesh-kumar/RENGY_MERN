import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['task', 'team', 'user', 'report'],
    default: 'task',
  },
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
