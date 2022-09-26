const express = require("express");
const app = express();
const axios = require("axios");
const stripe = require("stripe")(
  "sk_test_51Jw3UpHciXopN8Ipcui9599OVN7aq5j3nfSOuduYTjYalOAZ5Fo3DENEAL2iPheVx9mnDm12LvZPim6lWuzm71FA00aJpcXFRi"
);

app.use(express.static("public"));
app.use(express.json());

app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("<h2>This works!!</h2>");
  console.log("works");
});

app.post("/signin", async (req, res) => {
  const { name, email } = req.body;

  const customer = await stripe.customers.create({
    name,
    email,
  });
  res.send(customer);
});

app.post("/one-time", async (req, res) => {
  const { id, payment_method_types } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 120000,
    customer: id ? id : "cus_MLuN5iohX0ghep",
    currency: "gbp",
    payment_method_types: payment_method_types,
    setup_future_usage: "off_session",
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/custom-amount", async (req, res) => {
  const { id, payment_method_types, amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    customer: id ? id : "cus_MLuN5iohX0ghep",
    currency: "gbp",
    payment_method_types: payment_method_types,
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/billing", async (req, res) => {
  const { id, payment_method_types } = req.body;

  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: payment_method_types,
    customer: id ? id : "cus_MLuN5iohX0ghep",
  });

  res.send({
    clientSecret: setupIntent.client_secret,
  });
});

app.post("/subscriptions", async (req, res) => {
  const { id, payment_method, price_amount, period } = req.body;

  const today = new Date();
  const dt = today.setMonth(today.getMonth() + period);
  const d = new Date(dt);
  const subs_end =
    d.toDateString() +
    " " +
    d.getHours() +
    ":" +
    (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
  console.log(subs_end);
  const subscription = await stripe.subscriptions.create({
    customer: id,
    cancel_at: new Date(subs_end).getTime() / 1000,
    items: [
      {
        price_data: {
          currency: "gbp",
          product: "prod_MNQTrOresYM7pH",
          recurring: {
            interval: "month",
          },
          unit_amount: price_amount,
        },
        quantity: 1,
      },
    ],
    default_payment_method: payment_method,
    off_session: true,
  });

  res.send(subscription);
});

app.listen(4242, () => {
  console.log("Node server listening on port 4242!!");
});
