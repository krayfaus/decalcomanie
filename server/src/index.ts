import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import BodyParser from 'body-parser'; // Import the body-parser package
import qs from 'qs';
const lookup = require('country-code-lookup')

dotenv.config({ path: "./.env" })

const app = express();
const PORT = process.env.PORT;
const API_URL = process.env.PAYPAL_API_URL as string;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID as string;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET as string;

app.use(BodyParser.json());

type Product = {
  id: string,
  name: string,
  price: string,
};

type Customer = {
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
};

type Shipping = {
  address1: string,
  address2: string,
  zipCode: string,
  state: string,
  country: string,
};

function getCountryCode(countryName: string): string {
  return lookup.byCountry(countryName);
}

async function acquireAccessToken() {
  try {
    const tokenResponse = await axios.post(
      `${API_URL}/v1/oauth2/token`,
      qs.stringify({ grant_type: 'client_credentials' }), // URL-encoded form data
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Set content type
        },
      }
    );

    return tokenResponse.data.access_token;
  } catch (error: any) {
    console.error('Error acquiring access token:', error.message);
    throw error;
  }
}

// Route to create a PayPal order
app.post('/api/create-order', async (req: Request, res: Response) => {
  if (req.body === undefined) {
    console.log("Undefined request body.");
    return res.status(400).json({ error: 'Missing or invalid items in the request body.' });
  }

  const { items, customer, shipping }: {
    items: Product[],
    customer: Customer,
    shipping: Shipping,
  } = req.body;

  try {
    const accessToken = await acquireAccessToken();
    const total = items.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
    const countryCode = getCountryCode(shipping.country);

    // Construct the PayPal order request payload
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total,
            breakdown: {
              "item_total": { "currency_code": "USD", "value": total },
              "shipping": { "currency_code": "USD", "value": "0" },
              "tax_total": { "currency_code": "USD", "value": "0" },
              "discount": { "currency_code": "USD", "value": "0" }
            }
          },
          items: items.map((item: any) => ({
            name: item.name,
            quantity: 1,
            sku: item.id,
            unit_amount: {
              currency_code: 'USD',
              value: item.price,
            },
          })),
        },
      ],
      payment_source: {
        "paypal": {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            user_action: "PAY_NOW",
            brand_name: "Décalcomanie",
            locale: "en-US",
            // landing_page: "GUEST_CHECKOUT",
            email_address: customer.email,
            name: {
              given_name: customer.firstName,
              surname: customer.lastName,
            },
            phone: customer.phone,
            address: {
              address_line_1: shipping.address1,
              address_line_2: shipping.address2,
              admin_area_1: shipping.state,
              postal_code: shipping.zipCode,
              country_code: countryCode,
            }
          }
        }
      }
    };

    console.log(JSON.stringify(orderPayload))

    // Make a POST request to create the PayPal order in the Sandbox environment.
    const response = await axios.post(
      `${API_URL}/v2/checkout/orders`,
      orderPayload,
      {
        headers: {
          'PayPal-Request-Id': '7b92603e-77ed-4896-8e78-5dea2050476a',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const orderId = response.data.id;
    res.json({ orderId });

  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'An error occurred while creating the PayPal order.' });

    console.log(error.response.data);
  }
});

// Capture (execute) a PayPal order payment.
app.post('/api/capture-order', async (req: Request, res: Response) => {
  const { orderId } = req.body;

  try {
    const accessToken = await acquireAccessToken();

    // Make a POST request to capture the payment for the given order ID
    const response = await axios.post(
      `${API_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Return the captured payment details to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: 'An error occurred while capturing the PayPal order.' });
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
