import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },

  courseName: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    default: "enrolled"
  },

  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Enrollment", enrollmentSchema);
