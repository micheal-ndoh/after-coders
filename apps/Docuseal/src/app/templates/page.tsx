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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'; // Assuming you'll add sonner for toasts
import { Loader2, Edit, Trash2, PlusCircle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

interface CreateTemplateForm {
  name: string;
  file: FileList;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateForm>();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/docuseal/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data.data);
    } catch (error: any) {
      toast.error('Error fetching templates', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const onCreateTemplate = async (data: CreateTemplateForm) => {
    if (!data.file || data.file.length === 0) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('file', data.file[0]);
    setCreating(true);
    try {
      const response = await fetch('/api/docuseal/templates', {
        method: 'POST',
        headers: {
          // Content-Type is set automatically by the browser for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const newTemplate = await response.json();
      // Assuming the API returns the created template object
      setTemplates((prev) => [newTemplate, ...prev]);
      toast.success('Template created successfully!');
      reset();
    } catch (error: any) {
      toast.error('Error creating template', { description: error.message });
    } finally {
      setCreating(false);
    }
  };

  const onDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    // Optimistic update
    const originalTemplates = templates;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.loading('Deleting template...', { id: 'delete-template' });

    try {
      const response = await fetch(`/api/docuseal/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast.success('Template deleted successfully!', {
        id: 'delete-template',
      });
    } catch (error: any) {
      toast.error('Error deleting template', {
        description: error.message,
        id: 'delete-template',
      });
      setTemplates(originalTemplates); // Rollback on error
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
        <h1 className="text-3xl font-bold">Templates</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onCreateTemplate)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: 'Template name is required.',
                  })}
                  disabled={creating}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="file">Document</Label>
                <Input
                  id="file"
                  type="file"
                  {...register('file', { required: 'A file is required.' })}
                  disabled={creating}
                  accept=".pdf,.docx,.xlsx,.jpeg,.png,.zip,.html"
                />
                {errors.file && (
                  <p className="text-red-500 text-sm">{errors.file.message}</p>
                )}
              </div>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <p className="text-center text-muted-foreground">No templates found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.status}</TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/templates/${template.id}/edit`}>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTemplate(template.id)}
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
