import { NextResponse } from "next/server";
import { auth } from "@/auth";

const DOCUSEAL_API_BASE_URL = "https://api.docuseal.com/v1";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const docusealResponse = await fetch(
      `${DOCUSEAL_API_BASE_URL}/templates?page=${page}&per_page=${limit}`,
      {
        headers: {
          "X-Auth-Token": process.env.DOCUSEAL_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!docusealResponse.ok) {
      const errorData = await docusealResponse.json();
      return NextResponse.json(errorData, {
        status: docusealResponse.status,
      });
    }

    const data = await docusealResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching DocuSeal templates:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const docusealResponse = await fetch(`${DOCUSEAL_API_BASE_URL}/templates`, {
      method: "POST",
      headers: {
        "X-Auth-Token": process.env.DOCUSEAL_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!docusealResponse.ok) {
      const errorData = await docusealResponse.json();
      return NextResponse.json(errorData, {
        status: docusealResponse.status,
      });
    }

    const data = await docusealResponse.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating DocuSeal template:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}