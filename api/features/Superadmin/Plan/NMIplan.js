var express = require("express");
var router = express.Router();
var querystring = require("querystring");
var axios = require("axios");
const moment = require('moment');
const { verifyLoginToken } = require("../../../authentication");

const Plan = require("./model");
const Company = require("../../Admin/Company/model")

//Response function
const sendResponse = (res, data, status = 200) => {
  if (status !== 200) {
    data = {
      error: data
    }
  }
  res.status(status).json({
    status,
    data,
  });
};

const sendConfig = async (data) => {
  if (data) {
    try {
      const postData = querystring.stringify(data);
      const config = {
        method: "post",
        url: "https://secure.nmi.com/api/transact.php",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: postData,
      };

      const response = await axios(config);

      if (response.status && response.status !== 200) {
        return sendResponse(
          res,
          response.message || "Error occurred",
          response.status
        );
      }

      const parsedResponse = querystring.parse(response.data);

      return parsedResponse;
    } catch (error) {
      return {
        status: 500,
        message: "Error occurred while processing the request",
        error: error.message,
      };
    }
  } else {
    return {
      status: 400,
      message: "No data provided",
    };
  }
};

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    let postData = {
      recurring: "add_plan",
      plan_payments: 0,
      plan_amount: data.PlanPrice,
      plan_name: data.PlanName,
      plan_id: data.PlanId,
      month_frequency: data.MonthFrequency,
      day_of_month: data.DayOfMonth,
      security_key: "A7K7JTbdKJRGJMk242v8rbn7PmRs87nh",
    };

    const parsedResponse = await sendConfig(postData);

    if (parsedResponse.response_code == 100) {
      sendResponse(res, "Payment plan added successfully.");
    } else {
      sendResponse(res, parsedResponse.responsetext || "Error occurred", 403);
    }
  } catch (error) {
    console.error(error); 
    sendResponse(res, "Something went wrong!", 500);
  }
});

router.put("/", async (req, res) => {
  try {
    const data = req.body;

    let postData = {
      recurring: "edit_plan",
      plan_payments: 0,
      plan_amount: data.PlanPrice,
      plan_name: data.PlanName,
      current_plan_id: data.PlanId,
      month_frequency: data.MonthFrequency,
      day_of_month: data.DayOfMonth,
      security_key: "A7K7JTbdKJRGJMk242v8rbn7PmRs87nh",
    };

    const parsedResponse = await sendConfig(postData);

    if (parsedResponse.response_code == 100) {
      sendResponse(res, "Payment plan update successfully.");
    } else {
      sendResponse(res, parsedResponse.responsetext || "Error occurred", 403);
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, "Something went wrong!", 500);
  }
});

//Add a new plan
// router.post('/add-plan', verifyLoginToken, async(req, res) => {
//   try {
//       const {user, planPayments,planAmount,planName,
//           planId,dayFrequency,billingCycle,termsConditions,
//           earlyCancellationFee,dueChargeMethod,chargeAmount,
//           allowMemberChangePlan,allowMemberCancelBilling,allowMemberPauseBilling,
//           planTermDuration,prorateDay,chargeProrateDays,planChargeType
//       } = req.body;
//       let errorMsg = null;
//       let gymOwnerId = user.userId;
//       if(user.userRole === ROLE_STAFF) gymOwnerId = user.gymId;

//       if (![ROLE_ADMIN, ROLE_STAFF].includes(user.userRole)) sendResponse(res, "Permission Denied!", HTTP_CODE_500);
//       else {
//           const checkKeysExists = await User.findOne({_id: gymOwnerId, userStatus: STATUS_ACTIVE});
//           if(!Number.isInteger(planPayments)) errorMsg = "Plan payment required!";
//           else if(!planAmount) errorMsg = "Plan Amount is required!";
//           else if(!planName) errorMsg = "Plan Name required!";
//           else if(!planId) errorMsg = "Plan Id required!";
//           else if(!prorateDay) errorMsg = "prorateDay is required!";
//           else if(!chargeProrateDays) errorMsg = "chargeProrateDays is required!";

//           if(errorMsg) sendResponse(res, errorMsg, HTTP_CODE_403);
//           else {
//               if(checkKeysExists.nmiPrivateKey) {                    
//                   let postData = {
//                       "recurring": 'add_plan',
//                       "plan_payments": planPayments,
//                       "plan_amount": planAmount,
//                       "plan_name": planName,
//                       "plan_id": planId,
//                       "day_frequency": dayFrequency ? dayFrequency : 30,
//                       "security_key": checkKeysExists.nmiPrivateKey
//                   }

//                   if (['monthly', 'quarterly', 'semiannually','annually'].includes(billingCycle)) {
//                       postData = {
//                           "recurring": 'add_plan',
//                           "plan_payments": planPayments,
//                           "plan_amount": planAmount,
//                           "plan_name": planName,
//                           "plan_id": planId,
//                           "month_frequency":dayFrequency,
//                           "day_of_month":prorateDay,
//                           "security_key": checkKeysExists.nmiPrivateKey
//                       } 
//                   }

//                   postData = querystring.stringify(postData);

//                   var config = {
//                       method: 'post',
//                       url: 'https://secure.nmi.com/api/transact.php',
//                       headers: { 
//                       'Content-Type': 'application/x-www-form-urlencoded'
//                       },
//                       data : postData
//                   };

//                   axios(config)
//                       .then(async (response) => {
//                           const parsedResponse = querystring.parse(response.data);
//                           if(parsedResponse.response_code == 100) {
//                               const gym = await GymProfile.findOne({ gymId: user.userId });
//                               const newPaymentPlan = await paymentPlans.create({
//                                   gymId: gymOwnerId,
//                                   planId,
//                                   planName,
//                                   planAmount,
//                                   planPayments,
//                                   chargeDayFrequency:dayFrequency,
//                                   billingCycle,
//                                   planTermsAndConditions: termsConditions,
//                                   earlyCancellationFee,
//                                   dueChargeMethod,
//                                   chargeAmount,
//                                   allowMemberChangePlan,
//                                   allowMemberCancelBilling,
//                                   allowMemberPauseBilling,
//                                   planTermDuration,
//                                   prorateDay,chargeProrateDays,planChargeType
//                               });

//                               const paymentPlanSaved = await newPaymentPlan.save();
//                               if (paymentPlanSaved) {
//                                   const gymOwner = gym ? gym.firstName + " " + gym.lastName : "";
//                                   const description = `${gymOwner} has added a new payment plan: ${planName}.`;
//                                   //log event
//                                   await logEvent(gymOwnerId, description);
//                                   sendResponse(res, "Payment plan added successfully.");
//                               } else sendResponse(res, "Failed to add payment plan!", BAD_REQUEST);
//                           } else sendResponse(res,parsedResponse.responsetext,HTTP_CODE_403)
//                       })
//                       .catch(function (error) {
//                           sendResponse(res,error, HTTP_CODE_500)
//                       });
//               } else return sendResponse(res, "NMI Payment gateway keys are missing. Contact support admin.", HTTP_CODE_403);
//           }
//       }
//   } catch (error) {
//       sendResponse(res, "Something went wrong!", HTTP_CODE_500)
//   }
// });

//Add new subscription to existing plan
router.post("/add-subscription", verifyLoginToken, async(req, res) => {
  try {
      const { company,planId} = req.body;
      let errorMsg = null;

      const subscriptionDate = moment();
      const transactionDate = moment().format("YYYYMMDDHHmmss");

      if(!company.companyId) return sendResponse(res, "Company not found!", 403);

      if(!planId) errorMsg = "Plan id required!";

      if(errorMsg) sendResponse(res, errorMsg, 403);
      else {
          const gymId = await Company.findById(company.companyId);

          const gymNmisecretKey = await NmiKey.findOne({_id: gymId.parentId, userStatus: STATUS_ACTIVE});
          if(gymNmisecretKey.nmiPrivateKey) {
              const planDetail = await paymentPlans.findOne({planId});
              if(planDetail) {
              //member details
              const memberDetails = await MemberProfile.findOne({userId: user.userId});
              const memberName = memberDetails ? memberDetails.firstName + " " + memberDetails.lastName : "";
              let eventDescription = "";
              
              const billingDates = calculateBillingDates(subscriptionDate,planDetail.prorateDay,planDetail.billingCycle);

              if(planDetail.chargeProrateDays === 'yes') {
                  if(['monthly', 'quarterly', 'semiannually', 'annually'].includes(planDetail?.billingCycle)) {
                      // let chargeDayFrequency = planDetail.chargeDayFrequency;
                      // if(planDetail.billingCycle === 'monthly') chargeDayFrequency = 30;
                      // else if(planDetail.billingCycle === 'quarterly') chargeDayFrequency = 90;
                      // else if(planDetail.billingCycle === 'semiannually') chargeDayFrequency = 180;
                      // else if(planDetail.billingCycle === 'annually') chargeDayFrequency = 365;

                      // let ProrateAmount = billingDates.daysUntilProrateDay/chargeDayFrequency * planDetail.planAmount
                      // ProrateAmount = ProrateAmount.toFixed(2);

                      const dailyCost = planDetail?.planAmount / billingDates?.daysBetweenSubscriptionAndBilling;
                      let ProrateAmount = dailyCost * billingDates?.daysUntilProrateDay;
                      if(billingDates?.chargeFullAmount) ProrateAmount = parseFloat(planDetail?.planAmount);
                      ProrateAmount = ProrateAmount.toFixed(2);

                      let ChargeCustomer = {
                          'type': 'sale',
                          'customer_vault_id':gymId.nmiCustomerId,
                          'amount':ProrateAmount,
                          'order_description':`Prorated amount charged against payment plan ${planDetail.planName}`,
                          'security_key': gymNmisecretKey.nmiPrivateKey
                      }

                      ChargeCustomer = querystring.stringify(ChargeCustomer);

                      const chargeSuccessful = await chargeCustomer(ChargeCustomer);

                      if(!chargeSuccessful) {
                          //log payment event
                          eventDescription = `${memberName} payment failed while attempting to purchase the ${planDetail.planName} plan.`;
                          await logEvent(gymId.parentId, eventDescription, user.userId, "member");
                          return sendResponse(res, "Payment failed!", HTTP_CODE_403);
                      } else {
                          const transaction = await Transaction.create({
                              gymId: gymId.parentId,
                              paymentplanId: planDetail._id,
                              memberId: user.userId,
                              transactionId: chargeSuccessful?.transactionid,
                              description: `Prorated amount charged against payment plan ${planDetail.planName}`,
                              amount: ProrateAmount,
                              status:chargeSuccessful?.condition,
                              responseText: chargeSuccessful?.responsetext,
                              responseCode: chargeSuccessful?.response_code,
                              authCode: chargeSuccessful?.authcode,
                              ccNumber: chargeSuccessful?.cc_number,
                              ccType: chargeSuccessful?.cc_type,
                              transactionDate: chargeSuccessful?.date ? chargeSuccessful?.date : transactionDate,
                              actionType: chargeSuccessful?.type
                          });

                          //log payment event
                          if (chargeSuccessful.response_code == 100) {
                              //log payment event
                              eventDescription = `${memberName} have been charged a prorated amount of $${ProrateAmount} for the ${planDetail.planName} plan.`;
                              await logEvent(gymId.parentId, eventDescription, user.userId, "member");
                          } else {
                              //log payment event
                              eventDescription = `${memberName} transaction was declined while purchasing the ${planDetail.planName} plan.`;
                              await logEvent(gymId.parentId, eventDescription, user.userId, "member");
                          }

                          //Save transaction details in transaction collection
                          await transaction.save();
                      }

                      if(chargeSuccessful.response_code == 200) {
                          return sendResponse(res, "Transaction Failed!", HTTP_CODE_403);
                      }
                  }
              }

              // sendResponse(res,billingDates);return   
              let postData = {
                  'recurring': 'add_subscription',
                  'plan_id': planId,
                  'start_date': billingDates.nextBillingDate,
                  'customer_vault_id':gymId.nmiCustomerId,
                  // 'payment_token': paymentToken,
                  "security_key": gymNmisecretKey.nmiPrivateKey
              }

              postData = querystring.stringify(postData);

              var config = {
                  method: 'post',
                  url: 'https://secure.nmi.com/api/transact.php',
                  headers: { 
                      'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  data : postData
              };

              axios(config)
                      .then(async (response) => {
                          const parsedResponse = querystring.parse(response.data);
                          if(parsedResponse.response_code == 100) {
                              let data = {
                                  'recurring': 'update_subscription',
                                  'subscription_id': parsedResponse.transactionid,
                                  'orderid' : parsedResponse.transactionid,
                                  "security_key": gymNmisecretKey.nmiPrivateKey
                              }

                              //Update subscription
                              await updateSubscription(data);

                              const paymentPlanId = await paymentPlans.findOne({gymId: gymId.parentId, planId});
                              await User.findByIdAndUpdate(
                                  {
                                  _id: user.userId,
                                  },
                                  {
                                      nmiplanId: paymentPlanId._id,
                                      nmiSubscriptionId: parsedResponse.transactionid,
                                      paymentStatus: true,
                                      nmiSubscriptionStatus: "active"
                                      // nmiCustomerId: customerResult.customer_vault_id
                                  }
                              );

                              //log event info
                              eventDescription = `${memberName} successfully subscribed to the ${planDetail.planName} plan.`;
                              await logEvent(gymId.parentId, eventDescription, user.userId, "member");
                      
                              sendResponse(res, "Subscription added successfully.");
                          } else sendResponse(res,parsedResponse.responsetext,HTTP_CODE_403)
                      })
                      .catch(function (error) {
                          sendResponse(res,error, HTTP_CODE_500)
                      });
              } else return sendResponse(res, "Plan not found!", HTTP_CODE_403)
          } else return sendResponse(res, "NMI Payment gateway keys are missing. Contact support admin.", HTTP_CODE_403)
      }
  } catch (error) {
      sendResponse(res, "Something went wrong!", HTTP_CODE_500);
  }
});

module.exports = router;
