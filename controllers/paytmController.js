const https = require("https");
const PaytmChecksum = require("paytmchecksum");
const catchAsync = require("../utils/catchAsync");
const UserController = require("./userController");
const AppError = require("../utils/appError");

exports.initiatePayment = catchAsync(async (req, res) => {
  const { userId, orderId, amount } = req.body;
  var paytmParams = {};

  paytmParams.body = {
    requestType: "Payment",
    mid: process.env.TEST_MERCHANT_ID,
    orderId: orderId,
    callbackUrl: `${process.env.BASE_URL}/paytm/callbackURL?userId=${userId}`,
    txnAmount: {
      value: amount,
      currency: "INR",
    },
    userInfo: {
      custId: userId,
    },
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.TEST_MERCHANT_KEY
  )
    .then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        /* for Staging */
        hostname: "securegw-stage.paytm.in",

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: `/theia/api/v1/initiateTransaction?mid=${process.env.TEST_MERCHANT_ID}&orderId=${orderId}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", function () {
          res.json(JSON.parse(response));
        });
      });

      post_req.write(post_data);
      post_req.end();
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

exports.callbackUrlHandler = catchAsync(async (req, res) => {
  //console.log(req.query)
  //OUTPUT SAMPLE
  //{ userId: '61b46db54ec0816002bb7670' }

  // console.log(req.body);
  //OUTPUT SAMPLE
  // {
  //     "BANKNAME": "Kotak Bank",
  //     "BANKTXNID": "18229248941",
  //     "CHECKSUMHASH": "pkondAZuhu1AcLoMl3miEH5eElyx5SAwQ8fgZyb6QHdAxdW3Z7G/OvF990kJ6uq0V1Wh66sVwXNhYoV8V0IbsKY8vDw/JrlyuaLgLkZjUg0=",
  //     "CURRENCY": "INR",
  //     "GATEWAYNAME": "NKMB",
  //     "MID": "vvDrhO48383680943249",
  //     "ORDERID": "PARCEL10480b10479",
  //     "PAYMENTMODE": "NB",
  //     "RESPCODE": "01",
  //     "RESPMSG": "Txn Success",
  //     "STATUS": "TXN_SUCCESS",
  //     "TXNAMOUNT": "100.00",
  //     "TXNDATE": "2021-12-13 16:19:00.0",
  //     "TXNID": "20211213111212800110168598803247322",
  //   }

  const { userId } = req.query;
  const amount = parseFloat(req.body.TXNAMOUNT);

  const paymentHistory = {
    STATUS: req.body.STATUS,
    TXNID: req.body.TXNID,
    TXNDATE: req.body.TXNDATE,
    TXNAMOUNT: req.body.TXNAMOUNT,
  };

  await UserController.addMoney(userId, amount, paymentHistory);

  res.status(200).redirect(process.env.APP_URL);
});