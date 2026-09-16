import { LucideIcon } from 'lucide-react';
import React from 'react';

export interface AppConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  colorClass: string;
  render: React.FC<{ isCenter?: boolean }>;
}

export type SlotPosition = 'center' | 'left-1' | 'left-2' | 'left-3' | 'left-4' | 'right-1' | 'right-2' | 'right-3' | 'right-4' | 'bottom-1' | 'bottom-2' | 'bottom-3' | 'bottom-4';

export interface AppState {
  appId: string;
  tags: string[];
}

export type SlotMapping = Record<SlotPosition, AppState>;

