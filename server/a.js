
"use strict";

require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://127.0.0.1:5500"
}));

app.use(express.json());

const hasRazorpayCredentials =
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== "YOUR_TEST_KEY_ID" &&
    process.env.RAZORPAY_KEY_SECRET !== "YOUR_TEST_KEY_SECRET";

const razorpay = hasRazorpayCredentials
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    : null;

if (!razorpay) {
    console.warn("Razorpay credentials missing. Online payments are disabled.");
}

const pendingOrders = new Map();

app.get("/", (req, res) => {
    res.json({
        message: "ShopEase 4.0 Payment Server is running",
        mode: "Test"
    });
});


app.post("/api/payment/create-order", async (req, res) => {
        if (!razorpay) {
        return res.status(503).json({
            success: false,
            message: "Razorpay test credentials are not configured."
        });
    }
    try {
        const amount = Number(req.body.amount);

        if (
            !Number.isSafeInteger(amount) ||
            amount < 1 ||
            amount > 500000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount."
            });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `SE_${Date.now()}`
        });

        pendingOrders.set(order.id, {
            amount: order.amount,
            currency: order.currency
        });

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create order error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create payment order."
        });
    }
});

app.post("/api/payment/verify", async (req, res) => {
        if (!razorpay) {
        return res.status(503).json({
            success: false,
            message: "Razorpay test credentials are not configured."
        });
    }
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details."
            });
        }

        const savedOrder = pendingOrders.get(razorpay_order_id);

        if (!savedOrder) {
            return res.status(400).json({
                success: false,
                message: "Unknown or expired payment order."
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expected = Buffer.from(generatedSignature, "hex");
        const received = Buffer.from(razorpay_signature, "hex");

        if (
            expected.length !== received.length ||
            !crypto.timingSafeEqual(expected, received)
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed."
            });
        }

        const payment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            payment.order_id !== razorpay_order_id ||
            payment.amount !== savedOrder.amount ||
            payment.currency !== savedOrder.currency ||
            payment.status !== "captured"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment is not captured or does not match."
            });
        }

        pendingOrders.delete(razorpay_order_id);

        res.json({
            success: true,
            verified: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            message: "Payment verified successfully."
        });

    } catch (error) {
        console.error("Verification error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to verify payment."
        });
    }
});

app.listen(PORT, () => {
    console.log(`ShopEase payment server running at http://localhost:${PORT}`);
});
