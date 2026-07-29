import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  name: String,
  record: String,
  date: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  absentCount: { type: Number, default: 0 },
  nextVisitDate: String
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);

