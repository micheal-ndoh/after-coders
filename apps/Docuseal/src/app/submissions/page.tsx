'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Trash2, PlusCircle, Copy, Download, Eye, Send, Search, Filter, Mail, User, Calendar, LayoutGrid, Menu, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SubmissionsSkeleton } from '@/components/loading-skeletons';

interface Submission {
  id: string;
  template_id: string;
  template_name: string;
  status: 'SENT' | 'DECLINED' | 'COMPLETED' | 'OPENED';
  recipient_email: string;
  recipient_name?: string;
  signing_link: string;
  download_link?: string;
  created_at: string;
  updated_at: string;
}

interface CreateSubmissionForm {
  template_id: string;
  recipient_email: string;
  recipient_name?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm<CreateSubmissionForm>();

  useEffect(() => {
    fetchSubmissions();
    fetchTemplatesForForm();
  }, [filterStatus]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/docuseal/submissions?status=${
          filterStatus === 'ALL' ? '' : filterStatus
        }`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.data);
    } catch (error: any) {
      toast.error('Error fetching submissions', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplatesForForm = async () => {
    try {
      const response = await fetch('/api/docuseal/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates for form');
      }
      const data = await response.json();
      setTemplates(data.data.map((t: any) => ({ id: t.id, name: t.name })));
    } catch (error: any) {
      toast.error('Error fetching templates for form', {
        description: error.message,
      });
    }
  };

  const onCreateSubmission = async (data: CreateSubmissionForm) => {
    setCreating(true);
    try {
      const response = await fetch('/api/docuseal/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create submission');
      }

      const newSubmission = await response.json();
      setSubmissions((prev) => [...prev, newSubmission]);
      toast.success('Submission created successfully!');
      reset();
    } catch (error: any) {
      toast.error('Error creating submission', { description: error.message });
    } finally {
      setCreating(false);
    }
  };

  const onDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    // Optimistic update
    const originalSubmissions = submissions;
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    toast.loading('Deleting submission...', { id: 'delete-submission' });

    try {
      const response = await fetch(`/api/docuseal/submissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      toast.success('Submission deleted successfully!', {
        id: 'delete-submission',
      });
    } catch (error: any) {
      toast.error('Error deleting submission', {
        description: error.message,
        id: 'delete-submission',
      });
      setSubmissions(originalSubmissions); // Rollback on error
    }
  };

  const getStatusBadgeVariant = (status: Submission['status']) => {
    switch (status) {
      case 'SENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'OPENED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Filter submissions based on search and status
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = 
      submission.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (submission.recipient_name && submission.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || submission.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <SubmissionsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation and Header */}
      <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Navigation Boxes */}
              <div className="flex items-center space-x-1">
                {/* Document Templates Box */}
                <Link href="/">
                  <div className="flex items-center space-x-2 rounded-lg px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                </Link>
                
                {/* Submissions Box (Active) */}
                <div className="flex items-center space-x-2 rounded-lg px-3 py-2 bg-black text-white dark:bg-white dark:text-black">
                  <Menu className="h-4 w-4" />
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold">Submissions</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                UPLOAD
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-muted-foreground">
                Track and manage document submissions and signatures.
              </p>
            </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Submission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Submission</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateSubmission)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="template_id">Template</Label>
                  <Select
                    onValueChange={(value: string) => setValue('template_id', value)}
                    defaultValue={templates[0]?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_email">Recipient Email</Label>
                  <Input
                    id="recipient_email"
                    type="email"
                    placeholder="Enter recipient email..."
                    {...register('recipient_email', { required: true })}
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">
                    Recipient Name (Optional)
                  </Label>
                  <Input
                    id="recipient_name"
                    placeholder="Enter recipient name..."
                    {...register('recipient_name')}
                    disabled={creating}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                  </DialogTrigger>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Submission
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="OPENED">Opened</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {submissions.length === 0
                ? "Get started by creating your first submission."
                : "Try adjusting your search or filter criteria."}
            </p>
            {submissions.length === 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Submission
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Submission</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmit(onCreateSubmission)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="template_id">Template</Label>
                      <Select
                        onValueChange={(value: string) => setValue('template_id', value)}
                        defaultValue={templates[0]?.id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_email">Recipient Email</Label>
                      <Input
                        id="recipient_email"
                        type="email"
                        placeholder="Enter recipient email..."
                        {...register('recipient_email', { required: true })}
                        disabled={creating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_name">
                        Recipient Name (Optional)
                      </Label>
                      <Input
                        id="recipient_name"
                        placeholder="Enter recipient name..."
                        {...register('recipient_name')}
                        disabled={creating}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                      </DialogTrigger>
                      <Button type="submit" disabled={creating}>
                        {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Submission
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Template</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[25%]">Recipient</TableHead>
                  <TableHead className="w-[15%]">Created</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/50">
                          <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">{submission.template_name}</div>
                          <div className="text-sm text-muted-foreground">ID: {submission.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(submission.status)}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          {submission.recipient_name ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Mail className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {submission.recipient_name || 'No name'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {submission.recipient_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(submission.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-1">
                        {submission.signing_link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                submission.signing_link
                              );
                              toast.success('Signing link copied to clipboard!');
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy signing link</span>
                          </Button>
                        )}
                        {submission.status === 'COMPLETED' &&
                          submission.download_link && (
                            <Link
                              href={submission.download_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download document</span>
                              </Button>
                            </Link>
                          )}
                        {submission.signing_link && (
                          <Link
                            href={`/submissions/${submission.id}/sign`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View signing form</span>
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                          onClick={() => onDeleteSubmission(submission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete submission</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
