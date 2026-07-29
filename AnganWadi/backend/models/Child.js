import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameTa: { type: String },
  age: { type: Number, required: true },
  parentName: { type: String, required: true },
  parentNameTa: { type: String },
  parentUsername: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  prevHeight: Number,
  prevWeight: Number,
  status: { type: String, enum: ['normal', 'attention', 'underweight'], default: 'normal' },
  dob: String,
  gender: String,
  vaccinations: [{
    name: String,
    date: String,
    done: Boolean
  }],
  attendanceHistory: [{
    date: String,
    status: String,
    nextVisitDate: String
  }],
  nutrition: String,
  alerts: [String]
}, { timestamps: true });

export default mongoose.model('Child', childSchema);

