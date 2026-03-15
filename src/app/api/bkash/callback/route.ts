import { bkashService } from "@/services/bkashService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status");

  if (!paymentID || !status) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/status?status=error&message=Invalid callback parameters`);
  }

  if (status === "success") {
    try {
      const response = await bkashService.executePayment(paymentID);

      if (response.transactionStatus === "Completed") {
        // Here you would typically update your database
        // For now, we'll redirect to success page
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/status?status=success&trxID=${response.trxID}&amount=${response.amount}`
        );
      } else {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/status?status=failed&message=${response.statusMessage || "Execution failed"}`
        );
      }
    } catch (error: any) {
      console.error("Execute Payment Error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/status?status=error&message=${error.message || "Internal server error"}`
      );
    }
  } else {
    // Handle cancel, failure, etc.
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/status?status=${status}&message=Payment ${status}`
    );
  }
}
