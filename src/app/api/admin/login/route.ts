import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string };

  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: "Cấu hình server chưa đúng." }, { status: 500 });
  }

  if (email === validEmail && password === validPassword) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác." }, { status: 401 });
}
