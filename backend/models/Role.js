import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  color: {
    type: String,
    default: '#6366f1',
  },
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
export default Role;
