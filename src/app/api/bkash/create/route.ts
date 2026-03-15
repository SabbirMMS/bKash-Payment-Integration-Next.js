import { bkashService } from "@/services/bkashService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, invoiceNumber } = await req.json();

    if (!amount || !invoiceNumber) {
      return NextResponse.json({ error: "Amount and Invoice Number are required" }, { status: 400 });
    }

    // Determine the base URL for callback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackURL = `${baseUrl}/api/bkash/callback`;

    const paymentData = await bkashService.createPayment(amount, invoiceNumber, callbackURL);

    console.log(paymentData);

    return NextResponse.json(paymentData);
  } catch (error: any) {
    console.error("--- Payment Creation Error ---");
    console.error("Message:", error.message);
    if (error.stack) console.error("Stack Trace:", error.stack);
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 });
  }
}
