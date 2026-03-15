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
  success(statusCallback: any): unknown;
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
  private config: BkashConfig;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // Note: Mirroring the provided PHP snippet's logic:
    // IsTest (True) -> Live URL, IsTest (False) -> Sandbox URL
    const isTest = process.env.BKASH_TEST_MODE === "true";

    this.config = {
      appKey: process.env.BKASH_APP_KEY || "",
      appSecret: process.env.BKASH_APP_SECRET || "",
      username: process.env.BKASH_USERNAME || "",
      password: process.env.BKASH_PASSWORD || "",
      baseUrl: (isTest
        ? process.env.BKASH_CHECKOUT_URL_LIVE ||
          "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized"
        : process.env.BKASH_CHECKOUT_URL_SANDBOX ||
          "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized"
      ).replace(/\/+$/, ""),
    };

    console.log("--- bKash SDK Initialized ---");
    console.log(
      "Mode:",
      isTest ? "LIVE (via Test Mode=true config)" : "SANDBOX",
    );
    console.log("Base URL:", this.config.baseUrl);

    // Verify credentials early
    const missing = Object.entries(this.config)
      .filter(([key, value]) => !value && key !== "baseUrl")
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error("bKash missing credentials:", missing.join(", "));
    }
  }

  /**
   * Generate authentication token
   */
  async generateToken(): Promise<string> {
    console.log("Generating bKash token...");
    try {
      const response = await fetch(
        `${this.config.baseUrl}/checkout/token/grant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            username: this.config.username,
            password: this.config.password,
          },
          body: JSON.stringify({
            app_key: this.config.appKey,
            app_secret: this.config.appSecret,
          }),
          cache: "no-store",
        },
      );

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `Invalid JSON response from bKash: ${responseText.substring(0, 100)}`,
        );
      }

      if (!response.ok) {
        console.error("bKash Token Grant Failed Status:", response.status);
        console.error("bKash Token Grant Response:", responseText);
        throw new Error(
          data.statusMessage ||
            `Failed to generate bKash token: ${response.status}`,
        );
      }

      console.log("bKash Token generated successfully");
      this.token = data.id_token;
      return this.token!;
    } catch (error: any) {
      console.error("bKash Token Error Details:", error);
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
  ): Promise<BkashPaymentResponse> {
    const token = await this.generateToken();

    console.log("Creating bKash payment...", {
      amount,
      invoiceNumber,
      callbackURL,
    });

    try {
      const response = await fetch(`${this.config.baseUrl}/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": this.config.appKey,
        },
        body: JSON.stringify({
          mode: "0011",
          amount: amount,
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
          `Invalid JSON response from bKash: ${responseText.substring(0, 100)}`,
        );
      }

      console.log("bKash Create Payment Response:", data);

      if (!response.ok || data.statusCode !== "0000") {
        throw new Error(
          data.statusMessage ||
            `bKash Error: ${data.statusCode} - ${data.statusMessage}`,
        );
      }

      return data;
    } catch (error: any) {
      console.error("bKash Create Payment Error Details:", error);
      throw error;
    }
  }

  /**
   * Execute Payment
   */
  async executePayment(paymentID: string): Promise<any> {
    const token = await this.generateToken();

    try {
      const response = await fetch(`${this.config.baseUrl}/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Authorization: token,
          "X-APP-Key": this.config.appKey,
        },
        body: JSON.stringify({
          paymentID: paymentID,
        }),
        cache: "no-store",
      });

      return await response.json();
    } catch (error: any) {
      console.error("bKash Execute Payment Error:", error.message);
      throw error;
    }
  }

  /**
   * Query Payment
   */
  async queryPayment(paymentID: string): Promise<any> {
    const token = await this.generateToken();

    try {
      const response = await fetch(
        `${this.config.baseUrl}/checkout/payment/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            Authorization: token,
            "X-APP-Key": this.config.appKey,
          },
          body: JSON.stringify({
            paymentID: paymentID,
          }),
          cache: "no-store",
        },
      );

      return await response.json();
    } catch (error: any) {
      console.error("bKash Query Payment Error:", error.message);
      throw error;
    }
  }
}

export const bkashService = new BkashService();
