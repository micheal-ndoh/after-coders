declare namespace DocuSeal {
  interface Template {
    id: string;
    name: string;
    status: "draft" | "published";
    created_at: string;
    updated_at: string;
    // Add other template properties as needed from DocuSeal API docs
  }

  interface Submission {
    id: string;
    template_id: string;
    template_name: string;
    status: "SENT" | "DECLINED" | "COMPLETED" | "OPENED";
    recipient_email: string;
    recipient_name?: string;
    signing_link: string;
    download_link?: string;
    created_at: string;
    updated_at: string;
    // Add other submission properties as needed
  }

  interface PaginatedResponse<T> {
    data: T[];
    meta: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
    };
  }
}