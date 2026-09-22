import { Globe, Brain, FileText, Monitor, SquareTerminal, Terminal, Zap, Settings, Library, ListTodo, Edit3 } from 'lucide-react';
import { AppConfig } from '../types';
import { ArchitectureApp, ChromeApp, GeminiApp, NotesApp, DesktopMirrorApp, GooseApp, HermesApp, ServicesApp, OpenRouterApp, QuickLibraryApp, TodoListApp, PersonalNotepadApp } from './GridApps';

export const APPS_CONFIG: Record<string, AppConfig> = {
  architecture: { 
    id: 'architecture', 
    title: 'DYSLEXIA DESKTOP ARCHITECTURE', 
    icon: Settings, 
    colorClass: 'text-slate-400', 
    render: ArchitectureApp 
  },
  chrome: { 
    id: 'chrome', 
    title: 'CHROME BROWSER', 
    icon: Globe, 
    colorClass: 'text-blue-400', 
    render: ChromeApp 
  },
  gemini: { 
    id: 'gemini', 
    title: 'GEMINI RESEARCH', 
    icon: Brain, 
    colorClass: 'text-pink-400', 
    render: GeminiApp 
  },
  notes: { 
    id: 'notes', 
    title: 'QUICK NOTES', 
    icon: FileText, 
    colorClass: 'text-yellow-200', 
    render: NotesApp 
  },
  desktopMirror: { 
    id: 'desktopMirror', 
    title: 'LIVE DESKTOP MIRROR', 
    icon: Monitor, 
    colorClass: 'text-slate-400', 
    render: DesktopMirrorApp 
  },
  goose: { 
    id: 'goose', 
    title: 'GOOSE AI', 
    icon: SquareTerminal, 
    colorClass: 'text-indigo-400', 
    render: GooseApp 
  },
  services: { 
    id: 'services', 
    title: 'LOCAL SERVICES & DOCKER', 
    icon: Terminal, 
    colorClass: 'text-green-400', 
    render: ServicesApp 
  },
  hermes: { 
    id: 'hermes', 
    title: 'LOCAL SERVICES & DOCKER', 
    icon: Terminal, 
    colorClass: 'text-green-400', 
    render: ServicesApp 
  },
  openrouter: { 
    id: 'openrouter', 
    title: 'OPENROUTER & MODELS', 
    icon: Zap, 
    colorClass: 'text-orange-400', 
    render: OpenRouterApp 
  },
  quickLibrary: {
    id: 'quickLibrary',
    title: 'QUICK LIBRARY',
    icon: Library,
    colorClass: 'text-yellow-500',
    render: QuickLibraryApp
  },
  todoList: {
    id: 'todoList',
    title: 'SYSTEM TO-DO',
    icon: ListTodo,
    colorClass: 'text-yellow-400',
    render: TodoListApp
  },
  personalNotepad: {
    id: 'personalNotepad',
    title: 'PERSONAL NOTEPAD',
    icon: Edit3,
    colorClass: 'text-[#888]',
    render: PersonalNotepadApp
  }
};
