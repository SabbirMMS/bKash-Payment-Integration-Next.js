export interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  baseUrl: string;
}

export interface BkashPaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
  statusCode: string;
  statusMessage: string;
}

class BkashService {
  // Separate token caches for sandbox and live to prevent environment crosstalk
  private tokens: {
    sandbox: string | null;
    live: string | null;
  } = {
    sandbox: null,
    live: null,
  };

  private getConfig(mode: "sandbox" | "live"): BkashConfig {
    if (mode === "live") {
      return {
        appKey: process.env.BKASH_LIVE_APP_KEY || "",
        appSecret: process.env.BKASH_LIVE_APP_SECRET || "",
        username: process.env.BKASH_LIVE_USERNAME || "",
        password: process.env.BKASH_LIVE_PASSWORD || "",
        baseUrl: (
          process.env.BKASH_LIVE_BASE_URL ||
          "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized"
        ).replace(/\/+$/, ""),
      };
    }
    return {
      appKey: process.env.BKASH_SANDBOX_APP_KEY || "",
      appSecret: process.env.BKASH_SANDBOX_APP_SECRET || "",
      username: process.env.BKASH_SANDBOX_USERNAME || "",
      password: process.env.BKASH_SANDBOX_PASSWORD || "",
      baseUrl: (
        process.env.BKASH_SANDBOX_BASE_URL ||
        "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized"
      ).replace(/\/+$/, ""),
    };
  }

  /**
   * Generate authentication token
   */
  async generateToken(mode: "sandbox" | "live"): Promise<string> {
    const config = this.getConfig(mode);

    console.log(`[BkashService] Generating token for environment: [${mode.toUpperCase()}]`);
    
    try {
      const response = await fetch(`${config.baseUrl}/checkout/token/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          username: config.username,
          password: config.password,
        },
        body: JSON.stringify({
          app_key: config.appKey,
          app_secret: config.appSecret,
        }),
        cache: "no-store",
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `[${mode}] Invalid JSON response from bKash Token: ${responseText.substring(0, 100)}`,
        );
      }

      if (!response.ok || data.statusCode !== "0000") {
        console.error(`[BkashService] Token Grant Failed [${mode}] Status: ${response.status}`);
        console.error(`[BkashService] Token Grant Response [${mode}]:`, responseText);
        throw new Error(
          data.statusMessage ||
            `Failed to generate bKash token for ${mode} (${data.statusCode || response.status})`,
        );
      }

      console.log(`[BkashService] Token generated successfully for [${mode.toUpperCase()}]`);
      this.tokens[mode] = data.id_token;
      return data.id_token;
    } catch (error: any) {
      console.error(`[BkashService] Token Error Details [${mode}]:`, error.message);
      throw error;
    }
  }

  /**
   * Create Payment
   */
  async createPayment(
    amount: string,
    invoiceNumber: string,
    callbackURL: string,
    mode: "sandbox" | "live",
  ): Promise<BkashPaymentResponse> {
    const token = await this.generateToken(mode);
    const config = this.getConfig(mode);

    console.log(`[BkashService] Creating payment in [${mode.toUpperCase()}]...`, {
      amount,
      invoiceNumber,
      callbackURL,
    });

    try {
      const response = await fetch(`${config.baseUrl}/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": config.appKey,
        },
        body: JSON.stringify({
          mode: "0011",
          amount: amount.toString(), // Ensure string, some bKash APIs are picky
          payerReference: Math.floor(
            1000000000 + Math.random() * 9000000000,
          ).toString(),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: invoiceNumber,
          callbackURL: callbackURL,
        }),
        cache: "no-store",
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `[${mode}] Invalid JSON response from bKash Create: ${responseText.substring(0, 100)}`,
        );
      }

      console.log(`[BkashService] Create Payment Response [${mode}]:`, data);

      if (!response.ok || data.statusCode !== "0000") {
        console.error(`[BkashService] Create Payment Failed [${mode}]. Raw Response:`, responseText);
        throw new Error(
          data.statusMessage ||
            `bKash Error: ${data.statusCode || 'N/A'} - ${data.statusMessage || 'Unkown Error'}`,
        );
      }

      return data;
    } catch (error: any) {
      console.error(`[BkashService] Create Payment Error [${mode}]:`, error.message);
      throw error;
    }
  }

  /**
   * Execute Payment
   */
  async executePayment(
    paymentID: string,
    mode: "sandbox" | "live",
  ): Promise<any> {
    const token = await this.generateToken(mode);
    const config = this.getConfig(mode);

    console.log(`[BkashService] Executing payment [${paymentID}] in [${mode.toUpperCase()}]...`);

    try {
      const response = await fetch(`${config.baseUrl}/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": config.appKey,
        },
        body: JSON.stringify({
          paymentID: paymentID,
        }),
        cache: "no-store",
      });

      const responseText = await response.text();
      console.log(`[BkashService] Execute Payment Response [${mode}]:`, responseText);
      return JSON.parse(responseText);
    } catch (error: any) {
      console.error(`[BkashService] Execute Payment Error [${mode}]:`, error.message);
      throw error;
    }
  }

  /**
   * Query Payment
   */
  async queryPayment(
    paymentID: string,
    mode: "sandbox" | "live",
  ): Promise<any> {
    const token = await this.generateToken(mode);
    const config = this.getConfig(mode);

    try {
      const response = await fetch(
        `${config.baseUrl}/checkout/payment/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            Authorization: token,
            "X-APP-Key": config.appKey,
          },
          body: JSON.stringify({
            paymentID: paymentID,
          }),
          cache: "no-store",
        },
      );

      return await response.json();
    } catch (error: any) {
      console.error(`[BkashService] Query Payment Error [${mode}]:`, error.message);
      throw error;
    }
  }

  /**
   * Handle Post Payment (Verification and Database Simulation)
   */
  async handlePostPayment(
    paymentID: string,
    mode: "sandbox" | "live",
  ): Promise<{
    status: boolean;
    message?: string;
    data?: any;
    token?: string;
  }> {
    try {
      console.log(`[BkashService] --- Handling Post Payment [${paymentID}] in [${mode.toUpperCase()}] ---`);
      const response = await this.executePayment(paymentID, mode);
      
      if (response && response.transactionStatus === "Completed") {
        console.log(`[BkashService] SIMULATION: Payment Verified. trxID: ${response.trxID}`);
        
        return {
          status: true,
          data: response,
          token: this.tokens[mode] || undefined,
        };
      }

      console.error(`[BkashService] Post Payment Failed. Status: ${response?.transactionStatus || 'Unknown'}`);
      return {
        status: false,
        message: response?.statusMessage || "Payment execution failed",
      };
    } catch (error: any) {
      console.error(`[BkashService] Post Payment Critical Error [${mode}]:`, error.message);
      return {
        status: false,
        message: "Internal Server Error",
        token: this.tokens[mode] || undefined,
      };
    }
  }
}

export const bkashService = new BkashService();
