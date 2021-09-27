require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

//Middleware
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: false }));

app.get("/payments", (req, res) => {
  res.render("standard");
  res.end();
});

app.post("/payments/order", (req, res) => {
  console.log("create orderid request to razor pay", req.body);

  var options = {
    amount: 50000, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  instance.orders.create(options, function (err, order) {
    if (err) {
      console.log(err);
    } else {
      console.log(order);
      res.send({ orderId: order.id });
    }
    // console.log(order);
    // res.send({ orderId: order.id });
  });
});

app.post("/api/payment/verify", (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;
  var crypto = require("crypto");
  var expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  console.log("sig received ", req.body.response.razorpay_signature);

  console.log("sig generated ", expectedSignature);

  var response = { signatureIsValid: "false" };

  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
});

app.listen(PORT, () => {
  console.log(`listining to port ${PORT}`);
});
