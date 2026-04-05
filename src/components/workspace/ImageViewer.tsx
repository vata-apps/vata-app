import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFilesBySource } from '$hooks/useFiles';
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { stat } from '@tauri-apps/plugin-fs';
import { copyFileToTree } from '$lib/file-utils';
import { createFile, addFileToSource } from '$db-tree/files';
import { queryKeys } from '$lib/query-keys';
import { getCurrentTreePath } from '$/db/connection';

interface ImageViewerProps {
  sourceId: string;
}

export function ImageViewer({ sourceId }: ImageViewerProps): JSX.Element {
  const { data: files, isLoading } = useFilesBySource(sourceId);
  const queryClient = useQueryClient();
  const treePath = getCurrentTreePath();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const { mutate: attachFiles, isPending: isAttaching } = useMutation({
    mutationFn: async () => {
      if (!treePath) throw new Error('No tree path');
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: 'Images',
            extensions: ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'pdf'],
          },
        ],
      });
      if (!selected) return;
      const paths = Array.isArray(selected) ? selected : [selected];
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        tiff: 'image/tiff',
        tif: 'image/tiff',
        pdf: 'application/pdf',
      };
      for (const filePath of paths) {
        const { relativePath, filename } = await copyFileToTree(filePath, treePath);
        const ext = filename.split('.').pop()?.toLowerCase() ?? '';
        const fileInfo = await stat(`${treePath}/${relativePath}`);
        const fileId = await createFile({
          originalFilename: filename,
          relativePath,
          mimeType: mimeMap[ext] ?? 'application/octet-stream',
          fileSize: fileInfo.size,
        });
        await addFileToSource({ sourceId, fileId });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.files(sourceId) });
    },
  });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.1, Math.min(5, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      if (rafRef.current !== null) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setPan({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
        }}
      >
        Loading files...
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          padding: '2rem',
        }}
      >
        <p style={{ color: '#888', marginBottom: '1rem' }}>No files attached to this source.</p>
        <button
          onClick={() => attachFiles()}
          disabled={isAttaching}
          style={{
            padding: '0.5rem 1rem',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {isAttaching ? 'Attaching...' : 'Attach Files'}
        </button>
      </div>
    );
  }

  const currentFile = files[currentIndex];
  const imageSrc =
    currentFile && treePath ? convertFileSrc(`${treePath}/${currentFile.relativePath}`) : '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
      <div
        style={{
          padding: '0.5rem',
          background: '#2a2a2a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.1, z - 0.25))}
            style={{
              color: '#fff',
              background: '#444',
              border: 'none',
              borderRadius: '3px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            -
          </button>
          <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
            style={{
              color: '#fff',
              background: '#444',
              border: 'none',
              borderRadius: '3px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            style={{
              color: '#fff',
              background: '#444',
              border: 'none',
              borderRadius: '3px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            Fit
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            style={{
              color: currentIndex === 0 ? '#666' : '#fff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            &laquo;
          </button>
          <span style={{ color: '#fff', fontSize: '0.75rem' }}>
            {currentIndex + 1} / {files.length}
          </span>
          <button
            onClick={() => setCurrentIndex((i) => Math.min(files.length - 1, i + 1))}
            disabled={currentIndex === files.length - 1}
            style={{
              color: currentIndex === files.length - 1 ? '#666' : '#fff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            &raquo;
          </button>
        </div>

        <button
          onClick={() => attachFiles()}
          disabled={isAttaching}
          style={{
            color: '#fff',
            background: '#444',
            border: 'none',
            borderRadius: '3px',
            padding: '0.2rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          + Add
        </button>
      </div>

      <div
        style={{ flex: 1, overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageSrc}
          alt={currentFile?.originalFilename ?? ''}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            maxWidth: 'none',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
