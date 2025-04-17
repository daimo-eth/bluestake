import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Log the frame request for debugging (remove in production)
    console.log("Frame request:", body);

    // Prepare the response with the OG image
    return new Response(
      JSON.stringify({
        message: "Success",
        version: "vNext",
        image: "https://bluestake.vercel.app/bluestake-og.png",
        buttons: [
          {
            label: "🔹 Earn Now 🔹",
            action: "post",
          },
        ],
        // Redirect to the app when the button is clicked
        redirect: "https://bluestake.vercel.app/",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing frame request:", error);
    return new Response(
      JSON.stringify({
        message: "Error processing request",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// GET handler for debugging - shows a simple response that the frame API is working
export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Frame API endpoint is working",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
