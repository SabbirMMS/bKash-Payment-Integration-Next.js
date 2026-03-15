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
  private token: string | null = null;
  private currentMode: "sandbox" | "live" | null = null;

  private getConfig(mode: "sandbox" | "live"): BkashConfig {
    if (mode === "live") {
      return {
        appKey: process.env.BKASH_LIVE_APP_KEY || "",
        appSecret: process.env.BKASH_LIVE_APP_SECRET || "",
        username: process.env.BKASH_LIVE_USERNAME || "",
        password: process.env.BKASH_LIVE_PASSWORD || "",
        baseUrl: (process.env.BKASH_LIVE_BASE_URL || "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized").replace(/\/+$/, ""),
      };
    }
    return {
      appKey: process.env.BKASH_SANDBOX_APP_KEY || "",
      appSecret: process.env.BKASH_SANDBOX_APP_SECRET || "",
      username: process.env.BKASH_SANDBOX_USERNAME || "",
      password: process.env.BKASH_SANDBOX_PASSWORD || "",
      baseUrl: (process.env.BKASH_SANDBOX_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized").replace(/\/+$/, ""),
    };
  }

  /**
   * Generate authentication token
   */
  async generateToken(mode: "sandbox" | "live"): Promise<string> {
    const config = this.getConfig(mode);
    
    // Clear token if mode changed to ensure fresh authentication for correct environment
    if (this.currentMode !== mode) {
      this.token = null;
      this.currentMode = mode;
    }

    console.log(`Generating bKash token for [${mode.toUpperCase()}]...`);
    try {
      const response = await fetch(`${config.baseUrl}/checkout/token/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
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
        throw new Error(`Invalid JSON response from bKash: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error(`bKash Token Grant Failed [${mode}] Status:`, response.status);
        console.error(`bKash Token Grant Response:`, responseText);
        throw new Error(data.statusMessage || `Failed to generate bKash token: ${response.status}`);
      }

      console.log(`bKash Token generated successfully for [${mode}]`);
      this.token = data.id_token;
      return this.token!;
    } catch (error: any) {
      console.error(`bKash Token Error Details [${mode}]:`, error);
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
    mode: "sandbox" | "live"
  ): Promise<BkashPaymentResponse> {
    const token = await this.generateToken(mode);
    const config = this.getConfig(mode);

    console.log(`Creating bKash payment [${mode}]...`, { amount, invoiceNumber, callbackURL });

    try {
      const response = await fetch(`${config.baseUrl}/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": config.appKey,
        },
        body: JSON.stringify({
          mode: "0011",
          amount: amount,
          payerReference: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
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
        throw new Error(`Invalid JSON response from bKash: ${responseText.substring(0, 100)}`);
      }

      console.log(`bKash Create Payment Response [${mode}]:`, data);

      if (!response.ok || data.statusCode !== "0000") {
        throw new Error(data.statusMessage || `bKash Error: ${data.statusCode} - ${data.statusMessage}`);
      }

      return data;
    } catch (error: any) {
      console.error(`bKash Create Payment Error Details [${mode}]:`, error);
      throw error;
    }
  }

  /**
   * Execute Payment
   */
  async executePayment(paymentID: string, mode: "sandbox" | "live"): Promise<any> {
    const token = await this.generateToken(mode);
    const config = this.getConfig(mode);

    try {
      const response = await fetch(`${config.baseUrl}/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": config.appKey,
        },
        body: JSON.stringify({
          paymentID: paymentID,
        }),
        cache: "no-store",
      });

      return await response.json();
    } catch (error: any) {
      console.error(`bKash Execute Payment Error [${mode}]:`, error.message);
      throw error;
    }
  }

  /**
   * Query Payment
   */
  async queryPayment(paymentID: string, mode: "sandbox" | "live"): Promise<any> {
    const token = await this.generateToken(mode);
    const config = this.getConfig(mode);

    try {
      const response = await fetch(`${config.baseUrl}/checkout/payment/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": config.appKey,
        },
        body: JSON.stringify({
          paymentID: paymentID,
        }),
        cache: "no-store",
      });

      return await response.json();
    } catch (error: any) {
      console.error(`bKash Query Payment Error [${mode}]:`, error.message);
      throw error;
    }
  }
  /**
   * Handle Post Payment (Verification and Database Simulation)
   * Mimics the logic from handlePostPayment in PHP to simulate status update and payment recording.
   */
  async handlePostPayment(paymentID: string, mode: "sandbox" | "live"): Promise<{ status: boolean; message?: string; data?: any }> {
    try {
      console.log(`--- Handling Post Payment for [${paymentID}] in [${mode}] ---`);
      const response = await this.executePayment(paymentID, mode);

      if (response && response.transactionStatus === "Completed") {
        // --- SIMULATED DATABASE TRANSACTION START ---
        console.log("SIMULATION: Database Transaction Started");
        
        // 1. Update Invoice status (Simulated: SubscriptionInvoice::findOrFail($id)->update(['status' => 'paid']))
        console.log(`SIMULATION: Invoice for Payment ID [${paymentID}] status updated to [PAID]`);

        // 2. Record Payment (Simulated: DB::table('subscription_payments')->insert([...]))
        const paymentRecord = {
          payment_id: paymentID,
          amount: response.amount,
          payment_method: 'online',
          transaction_reference: response.trxID,
          payment_date: new Date().toISOString().split('T')[0],
          status: 'success',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log("SIMULATION: Payment Recorded:", paymentRecord);

        console.log("SIMULATION: Database Transaction Committed");
        // --- SIMULATED DATABASE TRANSACTION END ---

        return {
          status: true,
          data: response
        };
      }

      console.error(`bKash Post Payment Error: Payment not completed. Status: ${response.transactionStatus}`);
      return {
        status: false,
        message: response.statusMessage || 'Payment execution failed'
      };

    } catch (error: any) {
      console.error('bKash Post Payment Error:', error.message);
      return { status: false, message: 'Internal Server Error' };
    }
  }
}

export const bkashService = new BkashService();
