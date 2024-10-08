import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  orderId: { type: String, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;
