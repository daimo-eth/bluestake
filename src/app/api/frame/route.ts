import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type FrameButton = {
  label: string;
  action: string;
  target?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Log the frame request for debugging (remove in production)
    console.log("Frame request:", body);

    // Check if this is an embedded frame request
    const isEmbedded = body?.untrustedData?.isEmbedded || false;
    const embedUrl = body?.untrustedData?.url || "";

    // Get the button index if available
    const buttonIndex = body?.untrustedData?.buttonIndex || 1;

    // Handle embedded interactions differently if needed
    if (isEmbedded) {
      // For embed interactions, you can customize behavior based on the source
      console.log("Embedded frame interaction from:", embedUrl);
      console.log("Button pressed:", buttonIndex);
    }

    // Response can be customized based on which button was pressed
    const responseButtons: FrameButton[] = [
      {
        label: "🔹 Earn Now 🔹",
        action: "post",
      },
    ];

    // You could add different buttons or modify the behavior based on buttonIndex
    if (buttonIndex === 2) {
      // This is just an example - you can modify based on your use case
      responseButtons.push({
        label: "Learn More",
        action: "link",
        target: "https://bluestake.vercel.app/learn",
      });
    }

    // Generate the HTML response with proper meta tags
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://bluestake.vercel.app/bluestake-og.png" />
          <meta property="fc:frame:button:1" content="🔹 Earn Now 🔹" />
          <meta property="fc:frame:button:1:action" content="post" />
          ${
            buttonIndex === 2
              ? `
            <meta property="fc:frame:button:2" content="Learn More" />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="https://bluestake.vercel.app/learn" />
          `
              : ""
          }
          <meta property="og:image" content="https://bluestake.vercel.app/bluestake-og.png" />
          <meta property="og:title" content="Bluestake" />
          <meta property="og:description" content="Earn yield on your USDC" />
        </head>
        <body>
          <h1>Bluestake Frame</h1>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
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
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://bluestake.vercel.app/bluestake-og.png" />
        <meta property="fc:frame:button:1" content="🔹 Earn Now 🔹" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="og:image" content="https://bluestake.vercel.app/bluestake-og.png" />
        <meta property="og:title" content="Bluestake" />
        <meta property="og:description" content="Earn yield on your USDC" />
      </head>
      <body>
        <h1>Bluestake Frame</h1>
      </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
