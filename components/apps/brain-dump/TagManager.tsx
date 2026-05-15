'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Tag } from '@/lib/brain-dump/types';
import { TagBadge } from './TagBadge';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tags: Tag[];
  onCreate: (label: string) => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

export function TagManager({ open, onOpenChange, tags, onCreate, onRename, onDelete }: Props) {
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewLabel('');
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditLabel(tag.label);
  };

  const commitEdit = () => {
    if (editingId && editLabel.trim()) {
      onRename(editingId, editLabel.trim());
    }
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Create new */}
            <div className="flex gap-2">
              <Input
                placeholder="New tag name…"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={handleCreate} disabled={!newLabel.trim()}>
                <Plus size={14} />
              </Button>
            </div>

            {/* Tag list */}
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
              {tags.sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label)).map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 group">
                  {editingId === tag.id ? (
                    <Input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      onBlur={commitEdit}
                      className="h-7 text-xs flex-1"
                    />
                  ) : (
                    <span className="flex-1 min-w-0">
                      <TagBadge tag={tag} size="sm" />
                    </span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {tag.system ? (
                      <Lock size={11} className="text-muted-foreground" />
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(tag)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                          aria-label="Rename"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteId(tag.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          aria-label="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>
              This tag will be removed from all thoughts. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
