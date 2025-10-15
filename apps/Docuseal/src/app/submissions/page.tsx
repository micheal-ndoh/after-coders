'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Trash2, PlusCircle, Copy, Download, Eye, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreateSubmissionForm {
  template_id: number;
  send_email: boolean;
  submitters: {
    email: string;
    name?: string;
    role?: string;
  }[];
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<DocuSeal.Submission[]>([]);
  const [templates, setTemplates] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { register, handleSubmit, reset, control, setValue } = useForm<CreateSubmissionForm>({
    defaultValues: {
      submitters: [{ email: '', name: '', role: '' }],
      send_email: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'submitters',
  });

  const fetchSubmissions = useCallback(async () => {
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
      const data: DocuSeal.PaginatedResponse<DocuSeal.Submission> = await response.json();
      setSubmissions(data.data);
    } catch (error: unknown) {
      toast.error('Error fetching submissions', { 
        description: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchTemplatesForForm = useCallback(async () => {
    try {
      const response = await fetch('/api/docuseal/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates for form');
      }
      const data: DocuSeal.PaginatedResponse<DocuSeal.Template> = await response.json();
      setTemplates(data.data.map((t) => ({ id: t.id, name: t.name })));
    } catch (error: unknown) {
      toast.error('Error fetching templates for form', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    fetchTemplatesForForm();
  }, [fetchSubmissions, fetchTemplatesForForm]);

  const onCreateSubmission = async (data: CreateSubmissionForm) => {
    setCreating(true);
    try {
      console.log('Submitting data:', data);
      
      // Ensure the payload has the correct structure
      const payload = {
        template_id: data.template_id,
        submitters: data.submitters,
        send_email: data.send_email,
      };
      
      console.log('Payload to send:', payload);
      
      const response = await fetch('/api/docuseal/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        
        // Provide user-friendly error messages
        let errorMessage = errorData.message || errorData.error || 'Failed to create submission';
        
        if (errorData.error === 'Template does not contain fields') {
          errorMessage = 'This template has no form fields. Please add fields to the template in DocuSeal first.';
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      // DocuSeal API returns an array of submitters, not a full submission
      // We need to refetch the submissions list to get the updated data
      toast.success('Submission created successfully!');
      reset();
      await fetchSubmissions();
    } catch (error: unknown) {
      console.error('Submission error:', error);
      toast.error('Error creating submission', { 
        description: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setCreating(false);
    }
  };

  const onDeleteSubmission = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

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
    } catch (error: unknown) {
      toast.error('Error deleting submission', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        id: 'delete-submission',
      });
      setSubmissions(originalSubmissions);
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'blue' | 'green' | 'yellow' => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'blue';
      case 'declined':
        return 'destructive';
      case 'completed':
        return 'green';
      case 'expired':
        return 'yellow';
      default:
        return 'default';
    }
  };

  const onResendInvite = async (submitterId: number) => {
    toast.loading('Resending invite...', { id: `resend-${submitterId}` });
    try {
      const response = await fetch(`/api/docuseal/submitters/${submitterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_email: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend invite');
      }

      toast.success('Invite resent', { id: `resend-${submitterId}` });
    } catch (err: unknown) {
      toast.error('Error resending invite', { 
        id: `resend-${submitterId}`, 
        description: err instanceof Error ? err.message : String(err) 
      });
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
          <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                  onValueChange={(value) => {
                    setValue('template_id', Number(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={String(template.id)}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('template_id', { valueAsNumber: true })} />
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 rounded-md border p-4">
                  <h4 className="font-medium">Submitter {index + 1}</h4>
                  <div>
                    <Label htmlFor={`submitters.${index}.email`}>Email</Label>
                    <Input
                      id={`submitters.${index}.email`}
                      type="email"
                      {...register(`submitters.${index}.email`, {
                        required: true,
                      })}
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`submitters.${index}.name`}>
                      Name (Optional)
                    </Label>
                    <Input
                      id={`submitters.${index}.name`}
                      {...register(`submitters.${index}.name`)}
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`submitters.${index}.role`}>
                      Role (Optional)
                    </Label>
                    <Input
                      id={`submitters.${index}.role`}
                      {...register(`submitters.${index}.role`)}
                      disabled={creating}
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove Submitter
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ email: '', name: '', role: '' })}
              >
                Add Submitter
              </Button>

              <div className="flex items-center space-x-2">
                <input
                  id="send_email"
                  type="checkbox"
                  {...register('send_email')}
                  defaultChecked
                />
                <Label htmlFor="send_email">Send email invitation</Label>
              </div>

              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex space-x-2">
        {['ALL', 'pending', 'completed', 'declined', 'expired'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {submissions.length === 0 ? (
        <p className="text-center text-muted-foreground">No submissions found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
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
                    {submission.template.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(submission.status)}>
                      {submission.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.submitters
                      .map((s) => s.name || s.email)
                      .join(', ')}
                  </TableCell>
                  <TableCell>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {submission.submitters[0]?.embed_src && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            submission.submitters[0].embed_src || ''
                          );
                          toast.info('Signing link copied to clipboard!');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    {submission.status === 'completed' &&
                      submission.documents && submission.documents[0] && (
                        <Link
                          href={submission.documents[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="mr-2">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    {submission.submitters[0]?.embed_src && (
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
                    {submission.submitters[0] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={() => onResendInvite(submission.submitters[0].id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
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
