import { Schema, models, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    number: { type: String },
    userId:String,
    name:stringify,
    amount:Number,
    paymentId: { type: String },
    paymentStatus: {
      type: [String], 
      enum: ['pending', 'success'], 
      default: ['pending'], 
    }
  },
  { timestamps: true }
);

const Payment = models.payment || model('payment', paymentSchema);
export default Payment;
