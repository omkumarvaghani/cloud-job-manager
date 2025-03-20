var express = require("express");
var router = express.Router();
const NmiWebhooks = require("./modal");
const PlanPurchase = require("../../Admin/PlanPurchase/model");
const RecurringTransaction = require("../RecurringTransaction/modal");
var crypto = require("crypto");

function webhookIsVerified(webhookBody, signingKey, nonce, sig) {
  const calculatedSig = crypto
    .createHmac("sha256", signingKey)
    .update(`${nonce}.${webhookBody}`)
    .digest("hex");
  return sig === calculatedSig;
}

// API for nmi webhooks
router.post("/", async (req, res) => {
  try {
    const signingKey = process.env.NMI_SIGNING_KEY;
    const webhookBody = JSON.stringify(req.body);
    const sigHeader = req.headers["webhook-signature"];
    if (!sigHeader || sigHeader.length < 1) {
      throw new Error("Invalid webhook - signature header missing");
    }

    const sigMatches = sigHeader.match(/t=(.*),s=(.*)/);
    if (!sigMatches || sigMatches.length !== 3) {
      throw new Error("Unrecognized webhook signature format");
    }

    const nonce = sigMatches[1];
    const signature = sigMatches[2];

    if (!webhookIsVerified(webhookBody, signingKey, nonce, signature)) {
      throw new Error(
        "Invalid webhook - invalid signature, cannot verify sender"
      );
    }

    const webhook = req.body;
    if (webhook.event_type === "recurring.subscription.add") {
      const payment = await NmiWebhooks.create({
        plan_id: webhook.event_body.plan.id,
        subscription_id: webhook.event_body.subscription_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        subscription_type: webhook.event_body.subscription_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.plan.amount,
        description: "Recurring charging added",
      });
      await payment.save();
    } else if (webhook.event_type === "recurring.subscription.update") {
      const payment = await NmiWebhooks.create({
        plan_id: webhook.event_body.plan.plan_id,
        subscription_id: webhook.event_body.subscription_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        subscription_type: webhook.event_body.subscription_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.plan.amount,
        description: "Recurring charging subscription update",
      });
      await payment.save();
    } else if (webhook.event_type === "recurring.subscription.delete") {
      const payment = await NmiWebhooks.create({
        plan_id: webhook.event_body.plan.plan_id,
        subscription_id: webhook.event_body.subscription_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        subscription_type: webhook.event_body.subscription_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.plan.amount,
        description: "Recurring charging subscription delete",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.plan.add") {
      const payment = await NmiWebhooks.create({
        merchant: webhook.event_body.merchant.name,
        plan_id: webhook.event_body.plan.id,
        description: "Recurring charging plan add",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.plan.update") {
      const payment = await NmiWebhooks.create({
        merchant: webhook.event_body.merchant.name,
        plan_id: webhook.event_body.plan.id,
        description: "Recurring charging plan update",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.plan.delete") {
      const payment = await NmiWebhooks.create({
        merchant: webhook.event_body.merchant.name,
        plan_id: webhook.event_body.plan.id,
        description: "Recurring charging plan delete",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.auth.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction auth failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.auth.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction auth success",
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.auth.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction auth unknown",
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.check.status.latereturn") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "transaction.check.status.latereturn",
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.check.status.return") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "transaction.check.status.return",
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.check.status.settle") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "transaction.check.status.settle",
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.capture.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction capture success",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.capture.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction capture failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.capture.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction capture unknown",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.credit.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction credit success",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.credit.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction credit failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.credit.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction credit unknown",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "settlement.batch.complete") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_ids,
        merchant: webhook.event_body.merchant.name,
        transaction_type: webhook.event_body.processor.type,
        processor_id: webhook.event_body.processor.id,
        amount: webhook.event_body.amount,
        description: "Recurring charging settlement batch complete",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "settlement.batch.failure") {
      const payment = await NmiWebhooks.create({
        merchant: webhook.event_body.merchant.name,
        processor_id: webhook.event_body.processor.id,
        description: "Recurring charging settlement batch failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.sale.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "transaction sale failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.sale.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "transaction sale success",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.sale.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "transaction sale unknown",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.void.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction void success",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.void.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction void failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.void.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction void unknown",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.refund.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction refund success",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.refund.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction refund failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.refund.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction refund unknown",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.validate.success") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction validate success",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.validate.failure") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction validate failure",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.validate.unknown") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging transaction validate unknown",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "chargeback.batch.complete") {
      const payment = await NmiWebhooks.create({
        transaction_id: webhook.event_body.transaction_id,
        merchant: webhook.event_body.merchant.name,
        email: webhook.event_body.billing_address.email,
        transaction_type: webhook.event_body.transaction_type,
        processor_id: webhook.event_body.processor_id,
        amount: webhook.event_body.action.amount,
        action_type: webhook.event_body.action.action_type,
        response_text: webhook.event_body.action.response_text,
        response_code: webhook.event_body.action.response_code,
        description: "Recurring charging chargeback batch complete",
      });
      //Save payment details of the user in payment collection
      await payment.save();
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

router.post("/nmi", async (req, res) => {
  try {
    const signingKey = process.env.NMI_SIGNING_KEY;
    const webhookBody = req.body;
    const sigHeader = req.get("Webhook-Signature");

    if (webhookBody.event_type === "transaction.sale.success") {
    }

    if (webhookBody.event_type === "recurring.subscription.update") {
   
    }

    if (!sigHeader || sigHeader.length < 1) {
      res.status(400).send("invalid webhook - signature header missing");
      return;
    }

    const match = sigHeader.match(/t=(.*),s=(.*)/);
    if (!match) {
      res.status(400).send("unrecognized webhook signature format");
      return;
    }

    const nonce = match[1];
    const signature = match[2];

    if (
      !webhookIsVerified(
        JSON.stringify(webhookBody),
        signingKey,
        nonce,
        signature
      )
    ) {
      res
        .status(400)
        .send("invalid webhook - invalid signature, cannot verify sender");
      return;
    }

    // Webhook is now verified to have been sent by us, continue processing
    const parsedWebhook = webhookBody;
    if (parsedWebhook.event_type === "recurring.subscription.update") {
    } else if (
      parsedWebhook?.event_type === "transaction.sale.success" &&
      parsedWebhook?.event_body?.action?.source === "recurring"
    ) {

      const Purchased = await PlanPurchase.findOne({
        SubscriptionId: parsedWebhook.event_body?.order_id,
      });

      if (Purchased) {
        const payment = await RecurringTransaction.create({
          CompanyId: Purchased.CompanyId,
          Merchant: parsedWebhook.event_body.merchant.name,
          PlanId: Purchased.PlanId,
          SubscriptionId: Purchased.SubscriptionId,
          TransactionId: parsedWebhook.event_body.transaction_id,
          PlanPurchaseId: Purchased.PlanPurchaseId,
          Email: parsedWebhook.event_body.billing_address.email,
          Description: "Recurring charging",
          Amount: parsedWebhook.event_body?.action?.amount,
          Status: parsedWebhook.event_body.condition,
          ResponseText: parsedWebhook.event_body.action.response_text,
          RecurringTransactionesponseCode:
            parsedWebhook.event_body.action.response_code,
          AuthCode: parsedWebhook.event_body.authorization_code,
          ActionType: parsedWebhook.event_body.action.action_type,
          TransactionType: parsedWebhook.event_body.action.transaction_type,
          TransactionDate: parsedWebhook.event_body.action.date,
          ProcessorId: parsedWebhook.event_body.processor_id,
        });

        //Save payment details of the user in payment collection
        await payment.save();
      }
    } else if (
      parsedWebhook?.event_type === "transaction.sale.failure" &&
      parsedWebhook?.event_body?.action?.source === "recurring"
    ) {
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.log("Error:", error);
  }
});

module.exports = router;
