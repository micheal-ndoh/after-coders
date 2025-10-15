'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Upload, Plus, User, Calendar, MoreVertical, CloudUpload, Grid3X3, AlignJustify, ExternalLink, Edit, Download, Trash2 } from 'lucide-react';
import { DashboardSkeleton } from '@/components/loading-skeletons';

export default function HomePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <span className="text-4xl">🦭</span>
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Welcome to DocuSeal App
          </h1>
          <p className="mb-8 text-muted-foreground">
            Create, manage, and track your document templates and submissions with ease.
          </p>
          <div className="space-y-4">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mock template data matching the screenshot
  const templates = [
    {
      id: 1,
      name: "rgrh",
      author: "Michael Ndoh",
      date: "14 Oct 09:51 PM",
      icon: FileText,
    },
    {
      id: 2,
      name: "StoryTime_Parental_Consent_Form",
      author: "Michael Ndoh", 
      date: "14 Oct 05:17 PM",
      icon: FileText,
    },
    {
      id: 3,
      name: "StoryBook Consent Form",
      author: "Michael Ndoh",
      date: "13 Oct 07:40 AM", 
      icon: FileText,
    },
    {
      id: 4,
      name: "Integration W-9 Test Form",
      author: "Michael Ndoh",
      date: "13 Oct 07:36 AM",
      icon: FileText,
    },
    {
      id: 5,
      name: "Laptop",
      author: "Michael Ndoh",
      date: "07 Sep 03:09 PM",
      icon: FileText,
    },
    {
      id: 6,
      name: "Sample Document",
      author: "Deus Seal",
      date: "07 Sep 03:39 PM",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Navigation and Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Navigation Boxes */}
            <div className="flex items-center space-x-1">
              {/* Document Templates Box (Active) */}
              <div className="flex items-center space-x-2 rounded-lg bg-black px-3 py-2 text-white">
                <Grid3X3 className="h-4 w-4" />
              </div>
              
              {/* Submissions Box */}
              <div className="flex items-center space-x-2 rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                <AlignJustify className="h-4 w-4" />
              </div>
            </div>
            
            {/* Document Templates Title */}
            <h1 className="text-2xl font-bold">Document Templates</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              UPLOAD
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {templates.map((template) => (
            <Card key={template.id} className="group cursor-pointer transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <template.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="flex items-center">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="mb-2 font-semibold text-foreground line-clamp-2">
                  {template.name}
                </h3>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{template.author}</span>
                </div>
                
                <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{template.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <div className="mb-8 flex justify-center">
          <Card className="w-full max-w-md border-2 border-dashed border-muted-foreground/25 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="mb-2 font-semibold">Upload a New Document</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
