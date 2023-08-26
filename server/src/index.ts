import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import BodyParser from 'body-parser'; // Import the body-parser package
import qs from 'qs';
import { getUuid } from './Uuid';
const lookup = require('country-code-lookup')

dotenv.config({ path: "./.env" })

const app = express();
const PORT = process.env.PORT;
const API_URL = process.env.PAYPAL_API_URL as string;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID as string;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET as string;

app.use(BodyParser.json());

/// Allow CORS for testing.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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
  city: string,
  state: string,
  country: string,
};

function getCountryCode(countryName: string): string | null {
  const data = lookup.byCountry(countryName);
  if (data) {
    return data.iso2;
  }

  return null;
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
    const total = items.reduce((total: number, item) => total + Number(item.price), 0).toFixed(2);
    const countryCode = getCountryCode(shipping.country);
    const phoneNumber = customer.phone.replace(/\+|[^+\d]/g, '');

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

          shipping: {
            name: {
              full_name: [customer.firstName, customer.lastName].join(' '),
            },
            address: {
              address_line_1: shipping.address1,
              address_line_2: shipping.address2,
              admin_area_1: shipping.state,
              admin_area_2: shipping.city,
              postal_code: shipping.zipCode,
              country_code: countryCode,
            }
          }
        },
      ],
      payment_source: {
        "paypal": {
          experience_context: {
            shipping_preference: "SET_PROVIDED_ADDRESS",
            landing_page: "GUEST_CHECKOUT",
            brand_name: "Décalcomanie",
            locale: "en-US",
          },
          email_address: customer.email,
          name: {
            given_name: customer.firstName,
            surname: customer.lastName,
          },
          phone: {
            phone_type: "MOBILE",
            phone_number: {
              national_number: phoneNumber,
            },
          },
          address: {
            address_line_1: shipping.address1,
            address_line_2: shipping.address2,
            postal_code: shipping.zipCode,
            admin_area_1: shipping.state,
            admin_area_2: shipping.city,
            country_code: countryCode,
          }
        }
      }
    };

    // Make a POST request to create the PayPal order in the Sandbox environment.
    const response = await axios.post(
      `${API_URL}/v2/checkout/orders`,
      orderPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'PayPal-Request-Id': getUuid(),
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const orderId = response.data.id;
    console.log("> Created order:", orderId);

    res.json({ order: orderId });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'An error occurred while creating the PayPal order.' });
  }
});

// Capture (execute) a PayPal order payment.
app.post('/api/capture-order', async (req: Request, res: Response) => {
  const { order }: { order: string } = req.body;

  try {
    const accessToken = await acquireAccessToken();

    // Make a GET request to confirm the payment for the given order.
    const response = await axios.get(
      `${API_URL}/v2/checkout/orders/${order}`,
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
  console.log(`⚡️[server]: Server is running at port ${PORT}.`);
});
