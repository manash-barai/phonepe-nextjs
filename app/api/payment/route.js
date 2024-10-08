import { connectToDB } from '@/lib/mongoDb';
import Payment from '@/models/payment';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_BASE_URL = process.env.MERCHANT_BASE_URL;
const redirectUrl = "http://localhost:3000/api/status";

export async function POST(req) {
  await connectToDB(); // Ensure that your MongoDB connection is established

  try {
    const { name, mobileNumber, amount } = await req.json(); // Parse the request body
    const orderId = uuidv4();

    // Prepare payment payload
    const paymentPayload = {
      merchantId: MERCHANT_ID,
      merchantUserId: name,
      mobileNumber: mobileNumber,
      amount: amount * 100, // Convert to the smallest unit (e.g., paise)
      merchantTransactionId: orderId,
      redirectUrl: `${redirectUrl}/?id=${orderId}`,
      redirectMode: 'POST',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const keyIndex = 1;
    const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const options = {
      method: 'POST',
      url: MERCHANT_BASE_URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: payload,
      },
    };

    // Send the payment request to the merchant API
    const response = await axios.request(options);
    const redirectInfo = response.data.data.instrumentResponse.redirectInfo.url;

    // Save payment details to the database
    const payment = new Payment({
      name,
      mobileNumber,
      amount,
      orderId,
    });

    const savedPayment = await payment.save();

    // Return the response with the redirect URL and payment ID
    return new Response(JSON.stringify({
      msg: "OK",
      url: `${redirectInfo}&paymentId=${savedPayment._id}`,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Error in payment initiation:", error);
    return new Response(JSON.stringify({ error: 'Failed to initiate payment' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
