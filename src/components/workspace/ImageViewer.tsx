import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFilesBySource } from '$hooks/useFiles';
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { stat, remove } from '@tauri-apps/plugin-fs';
import { copyFileToTree } from '$lib/file-utils';
import { generateThumbnail } from '$lib/thumbnails';
import { createFile, addFileToSource, updateFile, deleteFile } from '$db-tree/files';
import { queryKeys } from '$lib/query-keys';
import { getCurrentTreePath } from '$/db/connection';
import { Button } from '$components/ui/button';

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
            extensions: ['jpg', 'jpeg', 'png', 'tiff', 'tif'],
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
      };
      for (const filePath of paths) {
        const { relativePath, filename } = await copyFileToTree(filePath, treePath);
        const copiedPath = `${treePath}/${relativePath}`;
        let fileId: string | null = null;
        try {
          const ext = filename.split('.').pop()?.toLowerCase() ?? '';
          const fileInfo = await stat(copiedPath);
          const mimeType = mimeMap[ext] ?? 'application/octet-stream';
          fileId = await createFile({
            originalFilename: filename,
            relativePath,
            mimeType,
            fileSize: fileInfo.size,
          });
          const thumbnailPath = await generateThumbnail(treePath, relativePath, mimeType);
          if (thumbnailPath) {
            await updateFile(fileId, { thumbnailPath });
          }
          await addFileToSource({ sourceId, fileId });
        } catch (err) {
          // Roll back side effects for this file: DB row and copied asset.
          if (fileId) {
            try {
              await deleteFile(fileId);
            } catch {
              // Swallow cleanup errors; surface the original failure.
            }
          }
          try {
            await remove(copiedPath);
          } catch {
            // Swallow cleanup errors; surface the original failure.
          }
          throw err;
        }
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
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading files...
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-muted p-8">
        <p className="mb-4 text-muted-foreground">No files attached to this source.</p>
        <Button onClick={() => attachFiles()} disabled={isAttaching} size="sm">
          {isAttaching ? 'Attaching...' : 'Attach Files'}
        </Button>
      </div>
    );
  }

  const currentFile = files[currentIndex];
  const imageSrc =
    currentFile && treePath ? convertFileSrc(`${treePath}/${currentFile.relativePath}`) : '';

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex items-center justify-between bg-card p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.1, z - 0.25))}
          >
            -
          </Button>
          <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
          >
            +
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            Fit
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Previous file"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            &laquo;
          </Button>
          <span className="text-xs text-foreground">
            {currentIndex + 1} / {files.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Next file"
            onClick={() => setCurrentIndex((i) => Math.min(files.length - 1, i + 1))}
            disabled={currentIndex === files.length - 1}
          >
            &raquo;
          </Button>
        </div>

        <Button variant="secondary" size="sm" onClick={() => attachFiles()} disabled={isAttaching}>
          + Add
        </Button>
      </div>

      <div
        className={`flex-1 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageSrc}
          alt={currentFile?.originalFilename ?? ''}
          className="max-w-none select-none pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
