You are an expert full-stack developer specializing in Next.js (using App Router), authentication systems like Better-Auth, API integrations (especially with services like DocuSeal), and modern UI libraries like Tailwind CSS and Shadcn UI. Your goal is to generate complete, production-ready code for a web application based on the following specifications. Ensure the code is well-structured, follows best practices, is secure, and includes error handling, loading states, and responsive design. Use TypeScript throughout.

### Project Overview
Build a Next.js application (version 14+) with App Router that integrates with DocuSeal's API (https://docuseal.com/) for managing document templates and submissions. The app uses Better-Auth for authentication (with PostgreSQL as the database). The frontend UI/UX is built with Tailwind CSS and Shadcn UI components, supporting two themes: light and dark (toggleable via a button in the navbar).

Key features:
- **Authentication**: Use Better-Auth with PostgreSQL. Support email/password signup/login, and social logins (Google, GitHub). After login, redirect to the home page. Protect all routes except login/signup.
- **DocuSeal Integration**: Use DocuSeal's API endpoints and require API keys (stored securely, e.g., in environment variables or fetched post-auth). Implement CRUD operations for:
  - **Templates**: Create, Edit, Get (list and single), Delete.
  - **Submissions**: Create, Edit, Get (list and single), Delete.
  - **Signing Form**: Integrate the signing form embedding as per DocuSeal's docs (using their <docuseal-form> component or API).
- **API Handling**: Create server-side API routes in Next.js (/app/api/) to proxy requests to DocuSeal's endpoints for security (avoid exposing API keys on client). Use fetch or Axios for HTTP requests. Handle authentication with DocuSeal via API keys.
- **UI Structure**:
  - **Sticky Navbar**: Always visible at the top. Includes:
    - Logo (use "DocuSeal App" as text or fetch a placeholder).
    - Buttons/links: "Templates" (navigates to /templates), "Submissions" (navigates to /submissions).
    - Theme toggle (light/dark).
    - User profile dropdown (with logout).
  - **Home Page (/)**: After login, show a dashboard with quick links to Templates and Submissions. Display summary stats (e.g., number of templates/submissions fetched from DocuSeal API).
  - **Templates Page (/templates)**: List all templates fetched via GET API. Each item shows name, status, actions (Edit, Delete). Include a "Create Template" button that opens a form/modal to create via API. For editing, redirect to a page like /templates/[id]/edit, which embeds or proxies DocuSeal's editing tools (e.g., iframe to https://docuseal.com/templates/[id]/edit if allowed, or recreate similar UI using their API).
  - **Submissions Page (/submissions)**: Similar to templates. List submissions with columns like in the provided screenshot: Template name, Status (SENT, DECLINED, COMPLETED, OPENED), Recipient email/name, Actions (Copy Link, View, Download if completed). Include "Create Submission" button/modal. Use pagination if lists are long.
  - **Signing Form Integration**: On submission details or a dedicated page, embed the DocuSeal signing form using their JS embed code (as in the provided document).
- **Themes**: Use Tailwind's dark mode. Implement a theme provider (e.g., next-themes) and toggle button in navbar. Default to system preference.
- **Styling**: Use Shadcn UI components (e.g., Button, Table, Card, Modal, DropdownMenu). Make it responsive and match the clean, modern look of the screenshots (e.g., rounded tags for status, icons for actions).
- **Database**: Use PostgreSQL with Better-Auth. No additional schemas needed beyond auth, but if required for caching DocuSeal data, add simple tables.
- **Environment Variables**: Include .env.example with keys like DOCUSEAL_API_KEY, DATABASE_URL, etc.
- **Deployment**: Assume Vercel deployment (as in the diagram). Include vercel.json if needed.
- **Error Handling & Security**: Handle API errors gracefully (toasts/notifications). Use server actions for mutations. Validate inputs.
- **Additional**: Use React Hook Form for forms. Implement optimistic updates for CRUD. Add loading skeletons.

### Provided References
- Diagram: Shows Vercel hosting, Better-Auth for auth, CRUD for Template and Submission, Signing Form, all connecting to DocuSeal APIs/endpoints/API keys.
- Screenshot: Submissions list with filters (All, Pending, Completed), search, upload/create buttons, and rows with template name, status badges (SENT blue, DECLINED red, COMPLETED green, OPENED yellow), recipient, actions (Copy Link, Download, View, Sign Now).
- DocuSeal Document: Use the API examples (e.g., createSubmission), embedding code for forms, compliance info. Base API calls on their REST API (assume base URL https://api.docuseal.com).

### Output Format
- Generate the full project structure as a code tree, then provide code for key files (e.g., app/layout.tsx, app/page.tsx, app/templates/page.tsx, api routes, components).
- Use markdown code blocks for each file.
- End with setup instructions (e.g., npm install, env setup, run dev).