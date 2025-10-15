"use client";

import React, { useRef, useState, useEffect } from 'react';

// optional dynamic imports for react-pdf and react-rnd
let MaybeDocument: unknown = null;
let MaybePage: unknown = null;
let MaybeRnd: unknown = null;

async function loadOptionalPdfLibs() {
  if (MaybeDocument && MaybePage && MaybeRnd) return;
  try {
    const rp = await import('react-pdf');
    MaybeDocument = rp.Document;
    MaybePage = rp.Page;
    const pdfjs = rp.pdfjs as unknown;
    const rr = await import('react-rnd');
  MaybeRnd = (rr as unknown as { default?: unknown; Rnd?: unknown }).default ?? (rr as unknown as { default?: unknown; Rnd?: unknown }).Rnd ?? null;
    const pdfjsObj = pdfjs as { version?: string; GlobalWorkerOptions?: { workerSrc?: string } } | undefined;
    const pdfjsVersion = pdfjsObj?.version ?? '5.4.296';
    if (pdfjsObj) {
      pdfjsObj.GlobalWorkerOptions = pdfjsObj.GlobalWorkerOptions ?? {};
      // Use .mjs worker entry (recommended) to match modern pdfjs-dist packaging
      pdfjsObj.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    }
  } catch {
    // libs not available — we'll fallback to iframe + overlay
    MaybeDocument = null;
    MaybePage = null;
    MaybeRnd = null;
  }
}

type Field = {
  id: string;
  name: string;
  type: string;
  page?: number;
  x?: number; // percentage 0-1
  y?: number; // percentage 0-1
  w?: number; // percentage 0-1
  h?: number; // percentage 0-1
};

interface Props {
  src?: string;
  zoom?: number;
  fields: Field[];
  onChangeFields: (f: Field[]) => void;
  currentIndex?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onZoom?: (z: number) => void;
}

export default function PdfEditor({ src, zoom = 1, fields, onChangeFields, currentIndex, total, onPrev, onNext, onZoom }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth] = useState<number>(800);
  const [parentRect, setParentRect] = useState<{ width: number; height: number } | null>(null);
  const [pageRect, setPageRect] = useState<{ width: number; height: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [libsLoaded, setLibsLoaded] = useState(false);

  const onDocumentLoadSuccess = (_doc: unknown) => {
    // placeholder — we measure page using pageRef when the Page component renders
    setTimeout(() => {
      const rect = pageRef.current?.getBoundingClientRect();
      if (rect) setPageRect({ width: rect.width, height: rect.height });
    }, 50);
  };

  const onPageRender = () => {
    // after Page renders, measure its size
    const rect = pageRef.current?.getBoundingClientRect();
    if (rect) setPageRect({ width: rect.width, height: rect.height });
  };

  // measure container to compute pixel conversions for overlays
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      if (rect) setParentRect({ width: rect.width, height: rect.height });
      // also measure page wrapper, if present
      const prect = pageRef.current?.getBoundingClientRect();
      if (prect) setPageRect({ width: prect.width, height: prect.height });
    });
    ro.observe(el);
    // initial measure
    const rect = el.getBoundingClientRect();
    if (rect) setParentRect({ width: rect.width, height: rect.height });
    return () => ro.disconnect();
  }, [src, currentIndex, zoom]);

  useEffect(() => {
    // attempt to load optional libs; if they exist set libsLoaded
    loadOptionalPdfLibs().then(() => {
      setLibsLoaded(Boolean(MaybeDocument && MaybePage && MaybeRnd));
    });
  }, []);

  // addField removed from UI per request; field creation is handled elsewhere

  const updateField = React.useCallback((id: string, patch: Partial<Field>) => {
    onChangeFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, [fields, onChangeFields]);

  const activeField = fields.find((f) => f.id === activeId) ?? null;
  const [inspectorValues, setInspectorValues] = useState<{ name?: string; type?: string } | null>(null);

  useEffect(() => {
    if (activeField) setInspectorValues({ name: activeField.name, type: activeField.type });
    else setInspectorValues(null);
  }, [activeField]);

  const saveInspector = () => {
    if (!activeField || !inspectorValues) return;
    updateField(activeField.id, { name: inspectorValues.name ?? activeField.name, type: inspectorValues.type ?? activeField.type });
  };

  // Keyboard handling: arrow keys to nudge, Delete to remove, Escape to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeField) return;
      const step = e.shiftKey ? 16 : 4; // larger step with shift
      if (e.key === 'Escape') {
        setActiveId(null);
        setInspectorValues(null);
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onChangeFields(fields.filter((f) => f.id !== activeField.id));
        setActiveId(null);
        return;
      }
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      if (e.key === 'ArrowRight') dx = step;
      if (e.key === 'ArrowUp') dy = -step;
      if (e.key === 'ArrowDown') dy = step;
      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const bounds = pageRect ?? parentRect ?? { width: pageWidth, height: 1000 };
        // compute pixel deltas
        const newXpx = (activeField.x ?? 0) * bounds.width + dx;
        const newYpx = (activeField.y ?? 0) * bounds.height + dy;
        updateField(activeField.id, { x: newXpx / bounds.width, y: newYpx / bounds.height });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeField, fields, pageRect, parentRect, pageWidth, onChangeFields, updateField]);

  // Toolbar: delete active field
  const toolbar = (
    <div className="absolute left-2 top-2 z-40 inline-flex gap-2">
      <button className="px-2 py-1 text-sm border rounded bg-white" onClick={() => { if (activeField) { onChangeFields(fields.filter((f) => f.id !== activeField.id)); setActiveId(null); } }}>Delete</button>
    </div>
  );

  return (
    <div className="border rounded bg-white">
      <div className="relative h-[720px] flex items-center justify-center">
        {toolbar}
  <div ref={containerRef} className="relative bg-gray-50 overflow-auto" style={{ width: '100%', height: '100%' }}>
          {src ? (
            libsLoaded && MaybeDocument && MaybePage && MaybeRnd ? (
              // Render using dynamically loaded react-pdf and react-rnd
              (() => {
                const DocComp = MaybeDocument as unknown as React.ComponentType<Record<string, unknown>>;
                const PageComp = MaybePage as unknown as React.ComponentType<Record<string, unknown>>;
                const measuredWidth = parentRect?.width ? Math.max(200, Math.floor(parentRect.width)) : pageWidth;
                return (
                  <div className="w-full flex justify-center">
                    <DocComp file={src} onLoadSuccess={onDocumentLoadSuccess}>
                      <div ref={pageRef} onLoad={onPageRender}>
                        <PageComp pageNumber={(currentIndex ?? 0) + 1} scale={zoom} width={measuredWidth} onLoadSuccess={onPageRender as unknown as () => void} />
                      </div>
                    </DocComp>
                  </div>
                );
              })()
            ) : (
              // fallback to iframe while optional libs are not present
              <iframe src={src} className="w-full h-full" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No document</div>
          )}

          {/* Overlay container — use react-rnd for each field on current page */}
          <div className="absolute inset-0 pointer-events-none">
            {fields
              .filter((f) => (f.page ?? 1) === ((currentIndex ?? 0) + 1))
              .map((f) => {
                const bounds = pageRect ?? parentRect ?? { width: pageWidth, height: 1000 };
                const xPx = (f.x ?? 0) * bounds.width;
                const yPx = (f.y ?? 0) * bounds.height;
                const wPx = (f.w ?? 0.2) * bounds.width;
                const hPx = (f.h ?? 0.12) * bounds.height;
                if (libsLoaded && MaybeRnd) {
                  const RndComp = MaybeRnd as unknown as React.ComponentType<Record<string, unknown>>;
                  const onDragStop = (_e: unknown, d: { x: number; y: number }) => {
                    updateField(f.id, { x: d.x / bounds.width, y: d.y / bounds.height });
                  };
                  const onResizeStop = (_e: unknown, _direction: unknown, ref: HTMLElement, _delta: unknown, position: { x: number; y: number }) => {
                    const w = ref.offsetWidth / bounds.width;
                    const h = ref.offsetHeight / bounds.height;
                    updateField(f.id, { x: position.x / bounds.width, y: position.y / bounds.height, w, h });
                  };
                  return (
                    <RndComp
                      key={f.id}
                      size={{ width: wPx, height: hPx }}
                      position={{ x: xPx, y: yPx }}
                      bounds="parent"
                      onDragStop={onDragStop}
                      onResizeStop={onResizeStop}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setActiveId(f.id); }}
                      style={{ border: activeId === f.id ? '2px solid #6366f1' : '2px dashed #f59e0b', background: 'rgba(253, 230, 138, 0.25)', pointerEvents: 'auto' }}
                    >
                      <div className="p-1 text-xs">
                        <div className="font-medium truncate">{f.name}</div>
                        <div className="text-[10px]">{f.type}</div>
                      </div>
                    </RndComp>
                  );
                }

                // fallback: static positioned div overlay (no drag/resize)
                return (
                  <div
                    key={f.id}
                    onClick={(e) => { e.stopPropagation(); setActiveId(f.id); }}
                    style={{ position: 'absolute', left: xPx, top: yPx, width: wPx, height: hPx, border: activeId === f.id ? '2px solid #6366f1' : '2px dashed #f59e0b', background: 'rgba(253, 230, 138, 0.25)', pointerEvents: 'auto' }}
                  >
                    <div className="p-1 text-xs">
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="text-[10px]">{f.type}</div>
                    </div>
                  </div>
                );
              })}
          </div>
          {/* Inspector */}
          {inspectorValues ? (
            <div className="absolute right-2 top-8 w-56 bg-white border rounded shadow p-3 z-50">
              <div className="text-sm font-medium mb-2">Field inspector</div>
              <label className="text-xs">Name</label>
              <input className="w-full border px-2 py-1 text-sm mb-2" value={inspectorValues.name ?? ''} onChange={(e) => setInspectorValues({ ...inspectorValues, name: e.target.value })} />
              <label className="text-xs">Type</label>
              <select className="w-full border px-2 py-1 text-sm mb-3" value={inspectorValues.type ?? 'text'} onChange={(e) => setInspectorValues({ ...inspectorValues, type: e.target.value })}>
                <option value="text">Text</option>
                <option value="signature">Signature</option>
                <option value="date">Date</option>
              </select>
              <div className="flex justify-end gap-2">
                <button className="text-sm px-2 py-1" onClick={() => { setActiveId(null); setInspectorValues(null); }}>Close</button>
                <button className="bg-indigo-600 text-white text-sm px-2 py-1 rounded" onClick={() => { saveInspector(); setActiveId(null); setInspectorValues(null); }}>Save</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
