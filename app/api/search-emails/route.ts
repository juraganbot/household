import { NextRequest, NextResponse } from "next/server";
import Imap from "imap";
import { simpleParser } from "mailparser";
import { filterVerificationEmails, getFilterStats } from "@/lib/security";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  snippet: string;
}

export async function POST(request: NextRequest) {
  try {
    const { targetEmail } = await request.json();

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Target email is required" },
        { status: 400 }
      );
    }

    // Get IMAP credentials from environment
    const imapUser = process.env.IMAP_USER;
    const imapPass = process.env.IMAP_PASS;

    if (!imapUser || !imapPass) {
      return NextResponse.json(
        { error: "IMAP credentials not configured" },
        { status: 500 }
      );
    }

    // Create IMAP connection
    const imap = new Imap({
      user: imapUser,
      password: imapPass,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const messages: EmailMessage[] = [];

    // Promise wrapper for IMAP operations
    const searchEmails = (): Promise<EmailMessage[]> => {
      return new Promise((resolve, reject) => {
        imap.once("ready", () => {
          imap.openBox("INBOX", true, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Calculate date 24 hours ago
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const formattedDate = yesterday.toISOString().split('T')[0].replace(/-/g, '-');

            // Search for emails sent TO the target email in the last 24 hours
            imap.search(
              [
                ["TO", targetEmail],
                ["SINCE", formattedDate]
              ], 
              (err, results) => {
                if (err) {
                  reject(err);
                  return;
                }

                if (!results || results.length === 0) {
                  imap.end();
                  resolve([]);
                  return;
                }

                // Limit to last 50 messages
                const limitedResults = results.slice(-50);

              const fetch = imap.fetch(limitedResults, {
                bodies: "",
                struct: true,
              });

              fetch.on("message", (msg, seqno) => {
                msg.on("body", (stream) => {
                  simpleParser(stream as never, async (err, parsed) => {
                    if (err) {
                      console.error("Parse error:", err);
                      return;
                    }

                    // Prioritize HTML body, fallback to text
                    const htmlBody = parsed.html || "";
                    const textBody = parsed.text || "";
                    const body = htmlBody || textBody;
                    
                    // Create snippet from text version
                    const snippetText = textBody || parsed.textAsHtml || "";
                    const snippet = snippetText.substring(0, 150).replace(/\n/g, " ").trim();

                    messages.push({
                      id: seqno.toString(),
                      from: parsed.from?.text || "Unknown",
                      subject: parsed.subject || "(No Subject)",
                      date: parsed.date?.toISOString() || new Date().toISOString(),
                      body: body,
                      snippet: snippet + (snippetText.length > 150 ? "..." : ""),
                    });
                  });
                });
              });

              fetch.once("error", (err) => {
                reject(err);
              });

              fetch.once("end", () => {
                imap.end();
              });
            });
          });
        });

        imap.once("error", (err: Error) => {
          reject(err);
        });

        imap.once("end", () => {
          // Sort by date (newest first)
          messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          resolve(messages);
        });

        imap.connect();
      });
    };

    const results = await searchEmails();
    
    // Filter out verification emails
    const filteredResults = filterVerificationEmails(results);
    const stats = getFilterStats(results);

    // Log search to MongoDB
    try {
      await connectDB();
      await SearchHistory.create({
        email: targetEmail,
        searchedAt: new Date(),
        resultsCount: filteredResults.length,
        blockedCount: stats.filtered,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.error('Failed to log search history:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      count: filteredResults.length,
      messages: filteredResults,
      security: {
        totalScanned: stats.total,
        verificationEmailsBlocked: stats.filtered,
        safeEmailsReturned: stats.remaining,
      },
    });
  } catch (error) {
    console.error("IMAP Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search emails" },
      { status: 500 }
    );
  }
}
