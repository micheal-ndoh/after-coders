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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Trash2, PlusCircle, Copy, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Assuming you'll add a Badge component

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
  const { register, handleSubmit, reset } = useForm<CreateSubmissionForm>();

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
        return 'blue';
      case 'DECLINED':
        return 'destructive';
      case 'COMPLETED':
        return 'green';
      case 'OPENED':
        return 'yellow';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Submissions</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Submission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Submission</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onCreateSubmission)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="template_id">Template</Label>
                <Select
                  onValueChange={(value) =>
                    register('template_id').onChange({
                      target: { name: 'template_id', value },
                    })
                  }
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
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...register('recipient_email', { required: true })}
                  disabled={creating}
                />
              </div>
              <div>
                <Label htmlFor="recipient_name">
                  Recipient Name (Optional)
                </Label>
                <Input
                  id="recipient_name"
                  {...register('recipient_name')}
                  disabled={creating}
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <Label htmlFor="status-filter">Filter by Status:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="OPENED">Opened</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {submissions.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No submissions found.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.template_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.recipient_name || submission.recipient_email}
                  </TableCell>
                  <TableCell>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {submission.signing_link && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            submission.signing_link
                          );
                          toast.info('Signing link copied to clipboard!');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    {submission.status === 'COMPLETED' &&
                      submission.download_link && (
                        <Link
                          href={submission.download_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="mr-2">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    {submission.signing_link && (
                      <Link
                        href={`/submissions/${submission.id}/sign`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="mr-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteSubmission(submission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
