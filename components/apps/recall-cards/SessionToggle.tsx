'use client';

import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { UserPrefs } from '@/lib/recall-cards/types';

interface Props {
  prefs: UserPrefs;
  onPrefsChange: (prefs: UserPrefs) => void;
}

export function SessionToggle({ prefs, onPrefsChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Session options</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="resume-toggle" className="text-sm">
                Resume on refresh
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Pick up where you left off if you close or refresh the page.
              </p>
            </div>
            <Switch
              id="resume-toggle"
              checked={prefs.resumeSessionOnRefresh}
              onCheckedChange={(checked) =>
                onPrefsChange({ ...prefs, resumeSessionOnRefresh: checked })
              }
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
