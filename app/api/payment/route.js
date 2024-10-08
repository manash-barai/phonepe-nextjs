import Payment from '@/models/payment';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_BASE_URL = process.env.MERCHANT_BASE_URL;
const redirectUrl = "http://localhost:3000/api/status";


export async function POST(req) {
  const { name, mobileNumber, amount } = await req.json(); // Use req.json() to parse the request body
  const orderId = uuidv4();

  // Prepare payment payload
  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100,
    merchantTransactionId: orderId,
    redirectUrl: `${redirectUrl}/?id=${orderId}`,
    redirectMode: 'POST',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
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
      'X-VERIFY': checksum
    },
    data: {
      request: payload
    }
  };

  try {
    const response = await axios.request(options);
    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
    const payment=new Payment({ name,number:mobileNumber, amount})
    const savePayment=await payment.save()
    return new Response(JSON.stringify({ msg: "OK", url: `${redirectUrl}&paymentId=payment._id`}), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error("Error in payment initiation", error);
    return new Response(JSON.stringify({ error: 'Failed to initiate payment' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
