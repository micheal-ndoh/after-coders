import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = 'nodejs';

const DOCUSEAL_API_BASE_URL = "https://api.docuseal.com/v1";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = params.id;
  try {
    const res = await fetch(`${DOCUSEAL_API_BASE_URL}/templates/${id}`, {
      headers: {
        "X-Auth-Token": process.env.DOCUSEAL_API_KEY ?? "",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching DocuSeal template ${id}:`, message);
    return NextResponse.json({ message: "Internal Server Error", error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = params.id;
  try {
    // Accept either JSON body or multipart/form-data for file update
    const contentType = request.headers.get("content-type") || "";
    let res: Response;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const forwardForm = new FormData();
      const name = formData.get("name");
      const file = formData.get("file");
      if (name) forwardForm.append("name", String(name));
      if (file) forwardForm.append("file", file as Blob);

      res = await fetch(`${DOCUSEAL_API_BASE_URL}/templates/${id}`, {
        method: "PUT",
        headers: { "X-Auth-Token": process.env.DOCUSEAL_API_KEY ?? "" },
        body: forwardForm,
      });
    } else {
      const body = await request.json();
      res = await fetch(`${DOCUSEAL_API_BASE_URL}/templates/${id}`, {
        method: "PUT",
        headers: {
          "X-Auth-Token": process.env.DOCUSEAL_API_KEY ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error updating DocuSeal template ${id}:`, message);
    return NextResponse.json({ message: "Internal Server Error", error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = params.id;
  try {
    const res = await fetch(`${DOCUSEAL_API_BASE_URL}/templates/${id}`, {
      method: "DELETE",
      headers: { "X-Auth-Token": process.env.DOCUSEAL_API_KEY ?? "" },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    return NextResponse.json({ message: "Template deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error deleting DocuSeal template ${id}:`, message);
    return NextResponse.json({ message: "Internal Server Error", error: message }, { status: 500 });
  }
}