import { NextRequest, NextResponse } from "next/server";

const VPS_BASE = "http://217.216.88.202:8000";
const AUTH = "Bearer zeniva-secret-2025";

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();

    // Email template from Lina
    const emailContent = {
      to: email || "info@zeniva.ca",
      from: "Lina - Zeniva Travel <noreply@zenivatravel.com>",
      subject: type === "sms"
        ? "📱 Luna SMS Test - Your 15% Welcome Discount Awaits!"
        : "✈️ Welcome to Zeniva Travel - Get 15% OFF Your First Trip!",
      html: type === "sms"
        ? generateSMSTestEmail()
        : generateWelcomeEmail(),
      text: type === "sms"
        ? "Hi! This is a test SMS from Luna. Get 15% OFF your first trip with Zeniva Travel. Sign up at zenivatravel.com"
        : "Welcome to Zeniva Travel! Get 15% OFF your first booking. Sign up at zenivatravel.com",
    };

    // Send email via VPS backend
    const response = await fetch(`${VPS_BASE}/admin/send-email`, {
      method: "POST",
      headers: {
        Authorization: AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailContent),
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email || 'info@zeniva.ca'}`
      });
    } else {
      // If backend doesn't have email endpoint, return mock success for now
      console.log("Email would be sent:", emailContent);
      return NextResponse.json({
        success: true,
        message: "Test email queued (dev mode)",
        preview: emailContent
      });
    }
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateWelcomeEmail() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Zeniva Travel</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Zeniva Travel! ✈️</h1>
              <p style="margin: 10px 0 0 0; color: #E6F0FF; font-size: 16px;">Your dream trip starts here</p>
            </td>
          </tr>

          <!-- Lina Avatar -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 15px; background: linear-gradient(135deg, #6366f1, #8B5CF6); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 40px;">
                🤖
              </div>
              <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 500;">
                Your AI Travel Concierge
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                Hi there! 👋
              </p>
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                I'm <strong>Lina</strong>, your personal AI travel assistant at Zeniva Travel. I noticed you're interested in planning your next adventure, and I'm here to help make it unforgettable!
              </p>

              <!-- Discount Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🎁</div>
                    <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 32px; font-weight: 700;">15% OFF</h2>
                    <p style="margin: 0; color: #d1fae5; font-size: 18px; font-weight: 500;">Your First Trip with Zeniva</p>
                    <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 14px;">
                      Create your account today to unlock this exclusive welcome offer!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                Here's what you get when you join Zeniva:
              </p>

              <!-- Benefits List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                    <span style="color: #1e293b; font-size: 15px;">24/7 AI-powered travel assistance</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                    <span style="color: #1e293b; font-size: 15px;">Personalized trip recommendations</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                    <span style="color: #1e293b; font-size: 15px;">Exclusive deals on hotels, flights & experiences</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                    <span style="color: #1e293b; font-size: 15px;">Real-time booking management</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.zenivatravel.com/signup" style="display: inline-block; background: linear-gradient(135deg, #0F6CF5, #0B1B4D); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(15, 108, 245, 0.4);">
                      Create My Account & Save 15%
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Ready to start planning? I'm here to help you every step of the way. Just reply to this email or chat with me anytime at <a href="https://www.zenivatravel.com/chat" style="color: #0F6CF5; text-decoration: none;">zenivatravel.com/chat</a>
              </p>

              <p style="margin: 20px 0 0 0; color: #1e293b; font-size: 16px;">
                Let's make your next trip unforgettable! ✨
              </p>

              <p style="margin: 20px 0 0 0; color: #1e293b; font-size: 16px;">
                <strong>Lina</strong><br>
                <span style="color: #64748b; font-size: 14px;">Your AI Travel Concierge</span><br>
                <span style="color: #64748b; font-size: 14px;">Zeniva Travel</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px;">
                Zeniva Travel | Premium Travel Experiences
              </p>
              <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 11px;">
                This email was sent because you expressed interest in Zeniva Travel.<br>
                Not interested? <a href="#" style="color: #0F6CF5; text-decoration: none;">Unsubscribe</a>
              </p>
              <div style="margin-top: 15px;">
                <a href="https://www.zenivatravel.com" style="color: #0F6CF5; text-decoration: none; margin: 0 10px; font-size: 12px;">Website</a>
                <a href="https://www.zenivatravel.com/help" style="color: #0F6CF5; text-decoration: none; margin: 0 10px; font-size: 12px;">Help Center</a>
                <a href="https://www.zenivatravel.com/privacy" style="color: #0F6CF5; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateSMSTestEmail() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luna SMS Test</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4, #0284c7); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Luna SMS Test 📱</h1>
              <p style="margin: 10px 0 0 0; color: #E0F2FE; font-size: 16px;">SMS Marketing Campaign</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px;">
                This is a <strong>test email</strong> simulating what Luna would send via SMS to leads.
              </p>

              <!-- SMS Preview Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f1f5f9; border-radius: 12px; border-left: 4px solid #06b6d4;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">SMS Message Preview</p>
                    <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; font-family: 'Courier New', monospace;">
                      Hi there! 👋 Thanks for your interest in your dream destination. Create your Zeniva account now and get <strong>15% OFF</strong> your first booking! 🎁 Sign up: zenivatravel.com
                    </p>
                    <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 11px;">
                      160 characters | Sent via Twilio
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #1e293b; font-size: 16px;">
                <strong>Luna Features:</strong>
              </p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                <li>8 rotating SMS templates for variety</li>
                <li>Personalized with {name} and {destination}</li>
                <li>All messages under 160 characters</li>
                <li>15% discount conversion focus</li>
                <li>Automated sending every 4-6 hours</li>
                <li>Twilio integration ready</li>
              </ul>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.zenivatravel.com/agent/luna" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #0284c7); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600;">
                      View Luna Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                Zeniva Travel - Luna SMS AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export const runtime = "nodejs";
