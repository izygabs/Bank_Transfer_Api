const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const { createAccount, Transaction } = require("./Authenticate");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/Bank_Account", {
  useNewUrlParser: true,
});

dotenv.config({ path: "./data.env" });

// const uri = "mongodb://localhost:27017/Transfer";

var accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);

var date = new Date();
var currentDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
var currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

const balanceSchema = new mongoose.Schema({
  accountNumber: Number,
  fullName: String,
  Balance: Number,
  createAt: String,
});

const Balance = mongoose.model("Balance", balanceSchema);

app.get("/home", (req, res) => {
  console.log(process.env);
  res.send("Hello mongodb");
});

app.post("/create-account", (req, res) => {
  const { error, value } = createAccount(req.body);
  if (error) {
    res.status(400).json(error);
  } else {
    try {
      const balance = new Balance({
        accountNumber: accountNumber,
        fullName: value.fullName,
        Balance: value.Balance,
        createAt: date,
      });
      balance.save().then(() => {
        res.send("Account creation was successfull");
      });
      res
        .status(200)
        .send(`Account created. Your Account number is ${accountNumber}`);
    } catch (error) {
      res.status(400).json(error);
    }
  }
});

app.post("/transfer", async (req, res) => {
  const { error, value } = Transaction(req.body);

  if (error) {
    return res.status(400).send(error);
  }

  var deposit = value.amount;

  var senderAcctNo = value.senderAccount;

  var Narration = value.Narration;

  var receiverAccount = value.receiverAccount;

  var senderBalance,
    receiverBalance = 0;

  let SenderName, ReceiverName;

  try {
    const senderAccnt = await Balance.find(
      { accountNumber: senderAcctNo },
      "Fullname Balance -_id"
    ).exec();

    const recieverAcct = await Balance.find(
      { accountNumber: receiverAccount },
      "Fullname Balance -_id"
    ).exec();

    senderAccnt.forEach((item) => {
      senderBalance = item.Balance;

      SenderName = item.fullName;
    });

    recieverAcct.forEach((item) => {
      ReceiverName = item.fullName;

      receiverBalance = item.Balance;
    });

    if (senderBalance >= deposit) {
      senderBalance -= deposit;

      receiverBalance += deposit;

      await Balance.updateOne(
        { accountNumber: senderAcctNo },
        { $set: { Balance: senderBalance } }
      );

      await Balance.updateOne(
        { accountNumber: receiverAccount },
        { $set: { Balance: receiverBalance } }
      );

      const trans = new Transaction({
        reference: referenceNo,

        senderName: SenderName,

        senderAccount: senderAcctNo,

        amount: deposit,

        receiverName: ReceiverName,

        receiverAccount: receiverAccount,

        narration: Narration,

        createAt: Date(),
      });

      trans.save().then(() => {
        console.log("Transfer done");
      });

      res.status(200).send(`Transfer done succesfully.`);
    } else {
      res.send("Insufficient Balance");
    }
  } catch (error) {
    console.error(error);
  }
});

app.get("/balance/:accountNumber", async (req, res) => {
  try {
    const perBalance = await Balance.findOne({
      accountNumber: req.body.accountNumber,
    });
    res.send(perBalance);
  } catch (error) {}
});

app.get("/balance", async (req, res) => {
  try {
    const results = await Balance.find({});
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log("Server is listening on Port" + PORT);
});
