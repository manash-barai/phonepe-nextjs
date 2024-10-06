import axios from 'axios';
import crypto from 'crypto';

// Environment variables
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_STATUS_URL = process.env.MERCHANT_STATUS_URL;
const successUrl = process.env.CLIENT_SUCCESS_URL;
const failureUrl = process.env.CLIENT_FAIL_URL;

// Export the POST method
export async function POST(req) {
  // Extract the transaction ID from query parameters
  const merchantTransactionId = req.nextUrl.searchParams.get('id');

  if (!merchantTransactionId) {
    return new Response(JSON.stringify({ error: 'Transaction ID not provided' }), { status: 400 });
  }

  const keyIndex = 1;
  const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${MERCHANT_KEY}`;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  const options = {
    method: 'GET',
    url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': MERCHANT_ID,
    },
  };

  try {
    const response = await axios.request(options);

    // Check if the transaction was successful or failed
    if (response.data.success === true) {
      return new Response(null, { status: 302, headers: { Location: successUrl } });
    } else {
      return new Response(null, { status: 302, headers: { Location: failureUrl } });
    }
  } catch (error) {
    console.error("Error in status check:", error);
    return new Response(null, { status: 302, headers: { Location: failureUrl } });
  }
}

// Export the GET method for handling GET requests
export async function GET(req) {
  return new Response('Method not allowed', { status: 405 });
}
