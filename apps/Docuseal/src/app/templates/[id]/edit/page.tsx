'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PdfEditor from '@/components/pdf-editor';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  documents?: Array<{
    uuid?: string;
    id?: number;
    url?: string;
    filename?: string;
    name?: string;
  }>;
  preferences?: {
    custom_fields?: Array<{ name: string; type?: string }>;
    [key: string]: unknown;
  };
  submitters?: Array<{ uuid?: string; name?: string; role?: string }>;
}

// EditForm removed — form handled by dedicated controls and programmatic APIs

interface FetchedTemplate extends Template {
  fields?: Array<{ name?: string; type?: string }>;
}

export default function EditTemplatePage() {
  const params = useParams() as { id: string };
  const id = params?.id;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  // saving state will be used later by the editor; remove until needed to avoid unused-var lint
  const [saving, setSaving] = useState(false);
  const [customFields, setCustomFields] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  // submitForm persists custom fields to DocuSeal
  const submitForm = async () => {
    if (!id) return;
    try {
      const payload = {
        preferences: {
          ...(template?.preferences ?? {}),
          custom_fields: customFields.map((f) => ({
            name: f.name,
            type: f.type,
          })),
        },
      };
      const res = await fetch(`/api/docuseal/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text();
        toast.error('Save failed: ' + body);
        return;
      }
      toast.success('Template saved');
      await fetchTemplate();
    } finally {
      // no-op
    }
  };
  const [zoom, setZoom] = useState(0.95);

  const fetchTemplate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/docuseal/templates/${id}`);
      if (!res.ok) throw new Error('Failed to load template');
      const data = await res.json();
      setTemplate(data);
      // hydrate custom fields from preferences if present
      const prefs = (data as Template).preferences;
      if (prefs && Array.isArray(prefs.custom_fields)) {
        setCustomFields(
          (prefs.custom_fields as Array<{ name: string; type?: string }>).map(
            (f, i) => ({ id: String(i), name: f.name, type: f.type || 'text' })
          )
        );
      } else {
        const fetched = data as FetchedTemplate;
        if (Array.isArray(fetched.fields)) {
          setCustomFields(
            (fetched.fields || []).map((f, i) => ({
              id: String(i),
              name: f.name || `field-${i}`,
              type: f.type || 'text',
            }))
          );
        } else {
          setCustomFields([]);
        }
      }
    } catch {
      toast.error('Error loading template');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  // onSave removed — metadata and file updates are handled via dedicated controls in the UI (Replace Document and programmatic saves)

  // legacy form handler removed; toolbar submitForm persists fields and metadata

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  if (!template) return <p className="p-4">Template not found.</p>;

  return (
    <div className="container mx-auto py-8">
      <span className="sr-only" aria-live="polite">
        {saving ? 'Saving' : 'Idle'}
      </span>
      {/* Top toolbar (Save / Send / Zoom / Page nav) */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Template: {template.name}</h1>
          <div className="text-sm text-muted-foreground">ID: {template.id}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              submitForm();
            }}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => {
              submitForm(); /* TODO: implement send flow */
            }}
            className="border px-3 py-1 rounded"
          >
            Send
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        {/* Left: thumbnails */}
        <aside className="col-span-2">
          <div className="space-y-4">
            <div className="p-2">
              <h3 className="font-medium">Documents</h3>
            </div>
            <div className="flex flex-col gap-3">
              {Array.isArray(template.documents) &&
                template.documents.map((d, idx) => (
                  <div
                    key={d.uuid || d.id}
                    className={`p-2 ${
                      selectedDocIndex === idx ? 'bg-indigo-50 rounded' : ''
                    }`}
                  >
                    <button
                      onClick={() => setSelectedDocIndex(idx)}
                      className="flex items-center gap-2 w-full text-left"
                    >
                      <div className="w-16 h-20 bg-gray-100 flex items-center justify-center text-xs overflow-hidden">
                        {d.url ? (
                          // lazy-load thumbnail component
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          <img
                            src={`${d.url}#page=1`}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs">No preview</div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {d.filename || d.name || 'document'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {d.filename || d.name}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              <div className="mt-3">
                <label className="inline-flex">
                  <input
                    id="replace-file-input"
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.currentTarget.files?.[0];
                      if (!f) return;
                      const fd = new FormData();
                      fd.append('file', f);
                      setSaving(true);
                      try {
                        const res = await fetch(
                          `/api/docuseal/templates/${id}`,
                          { method: 'PUT', body: fd }
                        );
                        if (!res.ok) {
                          const body = await res.text();
                          toast.error('Upload failed: ' + body);
                          return;
                        }
                        toast.success('Document replaced');
                        await fetchTemplate();
                      } finally {
                        setSaving(false);
                      }
                    }}
                  />
                  <span className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white border rounded cursor-pointer">
                    Replace Document
                  </span>
                </label>
              </div>
              <div>
                <a
                  href={`https://docuseal.com/templates/${id}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-sm text-indigo-600 underline"
                >
                  Open official editor
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: preview */}
        <main className="col-span-7">
          <div className="border rounded h-[700px] overflow-hidden">
            <PdfEditor
              src={template.documents?.[selectedDocIndex]?.url}
              zoom={zoom}
              fields={customFields.map((f) => ({
                id: f.id,
                name: f.name,
                type: f.type,
                x: 0.1,
                y: 0.1,
                w: 0.2,
                h: 0.12,
              }))}
              onChangeFields={(
                f: Array<{ id: string; name: string; type: string }>
              ) =>
                setCustomFields(
                  f.map((ff) => ({ id: ff.id, name: ff.name, type: ff.type }))
                )
              }
              currentIndex={selectedDocIndex}
              total={template.documents?.length}
              onPrev={() => setSelectedDocIndex((i) => Math.max(0, i - 1))}
              onNext={() =>
                setSelectedDocIndex((i) =>
                  Math.min((template.documents?.length ?? 1) - 1, i + 1)
                )
              }
              onZoom={(z: number) => setZoom(z)}
            />
          </div>
        </main>

        {/* Right: editor sidebar */}
        <aside className="col-span-3">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Roles</h3>
            <ul className="mt-2 space-y-2">
              {Array.isArray(template.submitters) ? (
                template.submitters.map((s) => (
                  <li key={s.uuid || s.name} className="text-sm">
                    {s.name || s.role}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No roles</li>
              )}
            </ul>

            <hr className="my-4" />

            <h3 className="font-semibold">Fields</h3>
            <div className="mt-2 space-y-2">
              {customFields.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {f.type}
                    </div>
                  </div>
                  <button
                    className="text-red-500"
                    onClick={() =>
                      setCustomFields((prev) =>
                        prev.filter((p) => p.id !== f.id)
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="mt-2">
                <input
                  placeholder="Field name"
                  id="new-field-name"
                  className="w-full mb-2 p-2 border rounded"
                />
                <select
                  id="new-field-type"
                  className="w-full p-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="date">Date</option>
                  <option value="signature">Signature</option>
                </select>
                <button
                  className="mt-2 w-full bg-indigo-600 text-white p-2 rounded"
                  onClick={() => {
                    const input = document.getElementById(
                      'new-field-name'
                    ) as HTMLInputElement | null;
                    const sel = document.getElementById(
                      'new-field-type'
                    ) as HTMLSelectElement | null;
                    if (!input || !input.value) {
                      toast.error('Field name required');
                      return;
                    }
                    setCustomFields((prev) => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        name: input.value,
                        type: sel?.value || 'text',
                      },
                    ]);
                    if (input) input.value = '';
                  }}
                >
                  Add field
                </button>
              </div>

              <button
                className="mt-4 w-full border p-2 rounded"
                onClick={async () => {
                  // persist custom fields into template.preferences.custom_fields via PUT
                  setSaving(true);
                  try {
                    const payload = {
                      preferences: {
                        ...(template?.preferences ?? {}),
                        custom_fields: customFields.map((f) => ({
                          name: f.name,
                          type: f.type,
                        })),
                      },
                    };
                    const res = await fetch(`/api/docuseal/templates/${id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      const body = await res.text();
                      toast.error('Save failed: ' + body);
                      return;
                    }
                    toast.success('Fields saved to template preferences');
                    await fetchTemplate();
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Save fields
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* PdfEditor is now rendered in the center preview area */}
    </div>
  );
}
