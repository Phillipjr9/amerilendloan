/**
 * Authorize.net payment integration
 * Handles card payment processing for loan processing fees
 */

/**
 * Authorize.net API configuration
 */
export interface AuthorizeNetConfig {
  apiLoginId: string;
  transactionKey: string;
  environment: "sandbox" | "production";
}

/**
 * Get Authorize.net configuration from environment
 */
export function getAuthorizeNetConfig(): AuthorizeNetConfig {
  return {
    apiLoginId: process.env.AUTHORIZENET_API_LOGIN_ID || "",
    transactionKey: process.env.AUTHORIZENET_TRANSACTION_KEY || "",
    environment: (process.env.AUTHORIZENET_ENVIRONMENT as "sandbox" | "production") || "production",
  };
}

/**
 * Get Authorize.net API endpoint
 */
export function getAuthorizeNetEndpoint(environment: "sandbox" | "production"): string {
  return environment === "production"
    ? "https://api.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";
}

/**
 * Create a payment transaction using Authorize.net
 * 
 * @param amount - Amount in cents
 * @param opaqueData - Tokenized payment data from Accept.js
 * @param description - Transaction description
 */
export async function createAuthorizeNetTransaction(
  amount: number,
  opaqueData: { dataDescriptor: string; dataValue: string },
  description: string
): Promise<{
  success: boolean;
  transactionId?: string;
  authCode?: string;
  cardLast4?: string;
  cardBrand?: string;
  error?: string;
}> {
  const config = getAuthorizeNetConfig();

  if (!config.apiLoginId || !config.transactionKey) {
    return {
      success: false,
      error: "Authorize.net credentials not configured",
    };
  }

  const endpoint = getAuthorizeNetEndpoint(config.environment);

  // Build Authorize.net API request
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: config.apiLoginId,
        transactionKey: config.transactionKey,
      },
      refId: `ref_${Date.now()}`,
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: (amount / 100).toFixed(2), // Convert cents to dollars
        payment: {
          opaqueData: {
            dataDescriptor: opaqueData.dataDescriptor,
            dataValue: opaqueData.dataValue,
          },
        },
        order: {
          description,
        },
      },
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Check if transaction was successful
    if (
      data.messages?.resultCode === "Ok" &&
      data.transactionResponse?.responseCode === "1"
    ) {
      const txResponse = data.transactionResponse;
      
      return {
        success: true,
        transactionId: txResponse.transId,
        authCode: txResponse.authCode,
        cardLast4: txResponse.accountNumber?.slice(-4),
        cardBrand: txResponse.accountType,
      };
    } else {
      // Transaction failed
      const errorMessage =
        data.transactionResponse?.errors?.[0]?.errorText ||
        data.messages?.message?.[0]?.text ||
        "Transaction failed";

      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    console.error("Authorize.net API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get Accept.js client configuration for frontend
 */
export function getAcceptJsConfig() {
  const config = getAuthorizeNetConfig();
  
  return {
    apiLoginId: config.apiLoginId,
    clientKey: process.env.AUTHORIZENET_CLIENT_KEY || "",
    environment: config.environment,
  };
}

/**
 * Validate Authorize.net webhook signature (for future use)
 */
export function validateAuthorizeNetWebhook(
  signature: string,
  payload: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto");
  
  const hmac = crypto.createHmac("sha512", signatureKey);
  hmac.update(payload);
  const computedSignature = hmac.digest("hex").toUpperCase();

  return signature.toUpperCase() === computedSignature;
}

/**
 * Create an Authorize.net Customer Profile to store payment method
 * Returns customer profile ID and payment profile ID
 */
export async function createCustomerProfile(
  userId: number,
  opaqueData: { dataDescriptor: string; dataValue: string },
  email: string
): Promise<{
  success: boolean;
  customerProfileId?: string;
  paymentProfileId?: string;
  cardLast4?: string;
  cardBrand?: string;
  error?: string;
}> {
  const config = getAuthorizeNetConfig();

  if (!config.apiLoginId || !config.transactionKey) {
    return {
      success: false,
      error: "Authorize.net credentials not configured",
    };
  }

  const endpoint = getAuthorizeNetEndpoint(config.environment);

  const requestBody = {
    createCustomerProfileRequest: {
      merchantAuthentication: {
        name: config.apiLoginId,
        transactionKey: config.transactionKey,
      },
      profile: {
        merchantCustomerId: `user_${userId}`,
        email: email,
        paymentProfiles: {
          customerType: "individual",
          payment: {
            opaqueData: {
              dataDescriptor: opaqueData.dataDescriptor,
              dataValue: opaqueData.dataValue,
            },
          },
        },
      },
      validationMode: config.environment === "production" ? "liveMode" : "testMode",
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.messages.resultCode === "Ok") {
      const customerProfileId = data.customerProfileId;
      const paymentProfileId = data.customerPaymentProfileIdList?.[0];

      // Retrieve card details from the newly created payment profile
      const cardDetails = await getCustomerPaymentProfile(customerProfileId, paymentProfileId);

      return {
        success: true,
        customerProfileId,
        paymentProfileId,
        cardLast4: cardDetails.cardLast4,
        cardBrand: cardDetails.cardBrand,
      };
    } else {
      return {
        success: false,
        error: data.messages.message?.[0]?.text || "Failed to create customer profile",
      };
    }
  } catch (error) {
    console.error("[Authorize.net] Error creating customer profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Charge a saved payment method using Customer Profile
 */
export async function chargeCustomerProfile(
  customerProfileId: string,
  paymentProfileId: string,
  amount: number,
  description: string
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  const config = getAuthorizeNetConfig();

  if (!config.apiLoginId || !config.transactionKey) {
    return {
      success: false,
      error: "Authorize.net credentials not configured",
    };
  }

  const endpoint = getAuthorizeNetEndpoint(config.environment);

  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: config.apiLoginId,
        transactionKey: config.transactionKey,
      },
      refId: `ref_${Date.now()}`,
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: (amount / 100).toFixed(2),
        profile: {
          customerProfileId: customerProfileId,
          paymentProfile: {
            paymentProfileId: paymentProfileId,
          },
        },
        order: {
          description: description,
        },
      },
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (
      data.transactionResponse &&
      (data.transactionResponse.responseCode === "1" || data.transactionResponse.responseCode === 1)
    ) {
      return {
        success: true,
        transactionId: data.transactionResponse.transId,
      };
    } else {
      return {
        success: false,
        error: data.transactionResponse?.errors?.[0]?.errorText || data.messages?.message?.[0]?.text || "Payment failed",
      };
    }
  } catch (error) {
    console.error("[Authorize.net] Error charging customer profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get payment method details from Customer Profile
 */
export async function getCustomerPaymentProfile(
  customerProfileId: string,
  paymentProfileId: string
): Promise<{
  success: boolean;
  cardLast4?: string;
  cardBrand?: string;
  error?: string;
}> {
  const config = getAuthorizeNetConfig();

  if (!config.apiLoginId || !config.transactionKey) {
    return {
      success: false,
      error: "Authorize.net credentials not configured",
    };
  }

  const endpoint = getAuthorizeNetEndpoint(config.environment);

  const requestBody = {
    getCustomerPaymentProfileRequest: {
      merchantAuthentication: {
        name: config.apiLoginId,
        transactionKey: config.transactionKey,
      },
      customerProfileId: customerProfileId,
      customerPaymentProfileId: paymentProfileId,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.messages.resultCode === "Ok") {
      const payment = data.paymentProfile?.payment?.creditCard;
      return {
        success: true,
        cardLast4: payment?.cardNumber?.slice(-4) || "0000",
        cardBrand: payment?.cardType || "Unknown",
      };
    } else {
      return {
        success: false,
        error: data.messages.message?.[0]?.text || "Failed to get payment profile",
      };
    }
  } catch (error) {
    console.error("[Authorize.net] Error getting payment profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
