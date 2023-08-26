"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser")); // Import the body-parser package
const qs_1 = __importDefault(require("qs"));
const Uuid_1 = require("./Uuid");
const lookup = require('country-code-lookup');
dotenv_1.default.config({ path: "./.env" });
const app = (0, express_1.default)();
const PORT = process.env.PORT;
const API_URL = process.env.PAYPAL_API_URL;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
app.use(body_parser_1.default.json());
/// Allow CORS for testing.
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
function getCountryCode(countryName) {
    const data = lookup.byCountry(countryName);
    if (data) {
        return data.iso2;
    }
    return null;
}
function acquireAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tokenResponse = yield axios_1.default.post(`${API_URL}/v1/oauth2/token`, qs_1.default.stringify({ grant_type: 'client_credentials' }), // URL-encoded form data
            {
                auth: {
                    username: PAYPAL_CLIENT_ID,
                    password: PAYPAL_CLIENT_SECRET,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Set content type
                },
            });
            return tokenResponse.data.access_token;
        }
        catch (error) {
            console.error('Error acquiring access token:', error.message);
            throw error;
        }
    });
}
// Route to create a PayPal order
app.post('/api/create-order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body === undefined) {
        console.log("Undefined request body.");
        return res.status(400).json({ error: 'Missing or invalid items in the request body.' });
    }
    const { items, customer, shipping } = req.body;
    try {
        const accessToken = yield acquireAccessToken();
        const total = items.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
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
                    items: items.map((item) => ({
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
        const response = yield axios_1.default.post(`${API_URL}/v2/checkout/orders`, orderPayload, {
            headers: {
                'Content-Type': 'application/json',
                'PayPal-Request-Id': (0, Uuid_1.getUuid)(),
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const orderId = response.data.id;
        console.log("> Created order:", orderId);
        res.json({ order: orderId });
    }
    catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: 'An error occurred while creating the PayPal order.' });
    }
}));
// Capture (execute) a PayPal order payment.
app.post('/api/capture-order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order } = req.body;
    try {
        const accessToken = yield acquireAccessToken();
        // Make a GET request to confirm the payment for the given order.
        const response = yield axios_1.default.get(`${API_URL}/v2/checkout/orders/${order}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        // Return the captured payment details to the client
        res.json(response.data);
    }
    catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({ error: 'An error occurred while capturing the PayPal order.' });
    }
}));
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at port ${PORT}.`);
});
