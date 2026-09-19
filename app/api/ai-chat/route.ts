import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import knowledge from "@/app/ai/knowledge.json";
import { SYSTEM_PROMPT } from "@/app/ai/system-prompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10000),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "بيانات الطلب غير صالحة.",
        },
        { status: 400 },
      );
    }

    const { messages } = parsed.data;

    // 2. Prepare knowledge
    const knowledgeContext = JSON.stringify(knowledge);

    // 3. Create Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: `${SYSTEM_PROMPT}

━━━━━━━━━━━━━━━━━━━━
## KNOWLEDGE BASE
━━━━━━━━━━━━━━━━━━━━

المعلومات التالية هي قاعدة المعرفة الخاصة بالمنصة.

استخدمها كمصدر أساسي عندما تكون ذات صلة بالسؤال.

لا تخترع معلومات غير موجودة فيها.

${knowledgeContext}
`,
    });

    // 4. Convert conversation to Gemini format
    const history = messages
      .slice(0, -1)
      .filter((message) => message.content.trim())
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    // Gemini requires the first history message to be from the user.
    const firstUserIndex = history.findIndex(
      (message) => message.role === "user",
    );

    const validHistory =
      firstUserIndex === -1 ? [] : history.slice(firstUserIndex);

    const lastMessage = messages[messages.length - 1];

    // 5. Start conversation
    const chat = model.startChat({
      history: validHistory,
    });

    // 6. Generate response
    const result = await chat.sendMessage(lastMessage.content);

    const response = result.response.text();

    // 7. Return response
    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء معالجة السؤال.",
      },
      { status: 500 },
    );
  }
}
