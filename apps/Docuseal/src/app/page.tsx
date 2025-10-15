import { auth } from "@/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Welcome to DocuSeal App</h1>
        <p className="text-lg mb-8 text-center">
          Please sign in to manage your document templates and submissions.
        </p>
        <Link href="/auth/signin">
          <Button size="lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  // Fetch summary stats from DocuSeal API (example placeholders)
  const templatesCount = 10; // Replace with actual API call
  const submissionsCount = 25; // Replace with actual API call

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templatesCount}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
            <Link href="/templates">
              <Button variant="link" className="p-0 mt-2">View Templates</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionsCount}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
            <Link href="/submissions">
              <Button variant="link" className="p-0 mt-2">View Submissions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
