const express = require("express");
const { validateAccessToken } = require("./middleware/auth0.middleware");
const { requiredScopes } = require("express-oauth2-jwt-bearer");
const { getManagementToken } = require("./auth0-management");

const ordersRouter = express.Router();
const orders = [];

ordersRouter.post(
  "/",
  validateAccessToken,
  requiredScopes(["create:orders"]),
  async (req, res) => {

    const managementToken = await getManagementToken();
    
    console.log(managementToken);
    const userId = req.auth.payload.sub;

    console.log("USER ID:", userId);

    const order = {
      pizza: req.body.pizza,
      user: req.auth.payload.sub,
    };
    
    const userResponse = await fetch(
  `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
  {
    headers: {
      Authorization: `Bearer ${managementToken}`,
    },
  }
);

const user = await userResponse.json();
const previousOrders = user.user_metadata?.orders || [];

const updatedOrders = [...previousOrders, req.body.pizza];

console.log("AUTH0 USER:");
console.log(user);

await fetch(
  `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${managementToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_metadata: {
        orders: updatedOrders,
      },
    }),
  }
);

    console.log("Updated user_metadata!");
    orders.push(order);

    console.log("===== NEW ORDER =====");
    console.log(order);

    res.status(200).json({
      message: "Order received!",
      pizza: req.body.pizza,

    });
  }

);

ordersRouter.get(
  "/",
  validateAccessToken,
  (req, res) => {
    const userOrders = orders.filter(
      order => order.user === req.auth.payload.sub
    );

    res.json(userOrders);
  }
);
module.exports = { ordersRouter };