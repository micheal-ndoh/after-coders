import { NextResponse } from "next/server";
import { auth } from "@/auth";

const DOCUSEAL_API_BASE_URL = "https://api.docuseal.com/v1";

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
      `${DOCUSEAL_API_BASE_URL}/templates/${id}`,
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
    console.error(`Error fetching DocuSeal template ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const docusealResponse = await fetch(
      `${DOCUSEAL_API_BASE_URL}/templates/${id}`,
      {
        method: "PUT",
        headers: {
          "X-Auth-Token": process.env.DOCUSEAL_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
    console.error(`Error updating DocuSeal template ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      `${DOCUSEAL_API_BASE_URL}/templates/${id}`,
      {
        method: "DELETE",
        headers: {
          "X-Auth-Token": process.env.DOCUSEAL_API_KEY!,
        },
      }
    );

    if (!docusealResponse.ok) {
      const errorData = await docusealResponse.json();
      return NextResponse.json(errorData, {
        status: docusealResponse.status,
      });
    }

    return NextResponse.json(
      { message: "Template deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting DocuSeal template ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}