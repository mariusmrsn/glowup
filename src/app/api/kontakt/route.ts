import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminNotification } from "@/server/actions/notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json() as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }

    // In-app notification is created first — always works, regardless of Resend
    await createAdminNotification({
      type: "contact_request",
      title: `Neue Anfrage: ${subject.trim()}`,
      body: `Von ${name.trim()} (${email.trim()})`,
      metadata: { name, email, subject, message },
    }).catch(() => {/* best-effort */});

    // E-Mail via Resend — optional, only if API key is configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_DEIN_API_KEY_HIER") {
      const { error } = await resend.emails.send({
        from: "GlowUp <onboarding@resend.dev>",
        to: ["mariusmuresan229@gmail.com"],
        replyTo: email.trim(),
        subject: `[GlowUp Anfrage] ${subject.trim()}`,
        text: `Name: ${name.trim()}\nE-Mail: ${email.trim()}\nAnliegen: ${subject.trim()}\n\n${message.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#6366f1;margin-bottom:4px">GlowUp – Neue Anfrage</h2>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0"/>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#64748b;width:100px">Name</td><td style="padding:6px 0;font-weight:600">${name.trim()}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">E-Mail</td><td style="padding:6px 0"><a href="mailto:${email.trim()}" style="color:#6366f1">${email.trim()}</a></td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Anliegen</td><td style="padding:6px 0;font-weight:600">${subject.trim()}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0"/>
            <p style="font-size:14px;color:#1e293b;line-height:1.7;white-space:pre-wrap">${message.trim()}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
            <p style="font-size:12px;color:#94a3b8">Gesendet über das Kontaktformular auf glowup.app</p>
          </div>
        `,
      });
      if (error) console.error("Resend error:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Kontakt route error:", err);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
