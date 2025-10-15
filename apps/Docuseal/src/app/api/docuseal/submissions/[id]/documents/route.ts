import { NextResponse } from "next/server";
import { auth } from "@/auth";

const DOCUSEAL_API_BASE_URL = "https://api.docuseal.com";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const docusealResponse = await fetch(
      `${DOCUSEAL_API_BASE_URL}/submissions/${id}/documents`,
      {
        headers: {
          "X-Auth-Token": process.env.DOCUSEAL_API_KEY ?? '',
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
  } catch (error: unknown) {
    console.error(`Error fetching submission documents ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message ?? String(error) },
      { status: 500 }
    );
  }
}
