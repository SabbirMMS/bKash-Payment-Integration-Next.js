import { bkashService } from "@/services/bkashService";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status");
  const cookieStore = await cookies();
  const mode = (cookieStore.get("bkash_mode")?.value || "sandbox") as "sandbox" | "live";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!paymentID || !status) {
    return NextResponse.redirect(`${baseUrl}/status?status=error&message=Invalid callback parameters`);
  }

  if (status === "success") {
    try {
      const result = await bkashService.handlePostPayment(paymentID, mode);

      if (result.status && result.data) {
        const tokenParam = result.token ? `&token=${encodeURIComponent(result.token)}` : "";
        return NextResponse.redirect(
          `${baseUrl}/status?status=success&trxID=${result.data.trxID}&amount=${result.data.amount}&paymentID=${paymentID}${tokenParam}`
        );
      } else {
        const tokenParam = result.token ? `&token=${encodeURIComponent(result.token)}` : "";
        return NextResponse.redirect(
          `${baseUrl}/status?status=failed&message=${result.message || "Execution failed"}&paymentID=${paymentID}${tokenParam}`
        );
      }
    } catch (error: any) {
      console.error("Execute Payment Error:", error);
      return NextResponse.redirect(
        `${baseUrl}/status?status=error&message=${error.message || "Internal server error"}`
      );
    }
  } else {
    return NextResponse.redirect(
      `${baseUrl}/status?status=${status}&message=Payment ${status}`
    );
  }
}
