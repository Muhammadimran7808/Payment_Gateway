//  1. Signup to [Braintree](https://www.braintreepayments.com/sandbox) and get merchant id, public key and private key
//  2. Inside your NodeJS project (backend), install `braintree` from npm

// javascript
// npm i braintree

//  3. Add the following env variables to your NodeJs project

javascript;
BRAINTREE_MERCHANT_ID = xxx;
BRAINTREE_PUBLIC_KEY = xxx;
BRAINTREE_PRIVATE_KEY = xxx;

//  4. Create a route for react client to make a GET request

// import
import { getToken } from "../controllers";

router.get("/braintree/token", getToken);

//  5. Create a controller function that will send token as json response

// javascript
// imports
import braintree from "braintree";
import dotenv from "dotenv";
dotenv.config();

// braintree config
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const getToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

//  6. In your React app (frontend), install `braintree-web-drop-in-react` from npm

// javascript
// npm i braintree-web-drop-in-react

//  7. Now in your react app, on whichever page/component you are, make API request to get the token from backend

// javascript
// import
import DropIn from "braintree-web-drop-in-react";

// state
const [clientToken, setClientToken] = useState("");
const [instance, setInstance] = useState("");

// request a token
useEffect(() => {
  getClientToken();
}, []);

const getClientToken = async () => {
  try {
    const { data } = await axios.get("/braintree/token");
    //   console.log(data);
    setClientToken(data.clientToken);
  } catch (err) {
    console.log(err);
  }
};

//  8. Once client token is received, show the Drop-in UI with Buy button

//     javascript
{
  !clientToken ? (
    ""
  ) : (
    <>
      <DropIn
        options={{
          authorization: clientToken,
          paypal: {
            flow: "vault",
          },
        }}
        onInstance={(instance) => setInstance(instance)}
      />
      <button onClick={handleBuy} className="btn btn-primary col-12 mt-2">
        Buy
      </button>
    </>
  );
}

//  9. Make API request to charge the amount to buyer on button click

// javascript
const handleBuy = async () => {
  try {
    const { nonce } = await instance.requestPaymentMethod();
    const { data } = await axios.post(`/braintree/payment`, {
      nonce,
      amount: 99,
    });
    alert("You paid successfully");
  } catch (err) {
    console.log(err);
  }
};

// 10. In your backend, create a route to handle payment. Create `'/braintree/payment'` API endpoint to charge the user

// javascript
router.post("/braintree/payment", processPayment);

// 11. Create a controller function that will finally charge the user and complete the buy process

// javascript
export const processPayment = async (req, res) => {
  try {
    const { nonce, amount } = req.body;

    const newTransaction = gateway.transaction.sale(
      {
        amount,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function async(error, result) {
        if (result) {
          // save transaction details in database
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

// 12. That's all. If you login to braintree dashboard, you will see the amount received.
