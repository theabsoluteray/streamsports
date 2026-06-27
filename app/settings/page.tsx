'use client';

import { Settings, Sun, Moon, Monitor, Trash2, RotateCcw } from 'lucide-react';
import { useThemeStore, useSettingsStore, useFavoritesStore, useHistoryStore, useNotificationsStore } from '@/lib/store';
import { STREAM_PROVIDERS } from '@/lib/api/streams';
import { SPORTS_CONFIG } from '@/lib/sports-config';
import { cn } from '@/lib/utils';
import type { Theme } from '@/lib/types';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-5.5 rounded-full transition-colors duration-200',
        checked ? 'bg-brand-600' : 'bg-[var(--bg-overlay)]'
      )}
      style={{ height: '1.375rem' }}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0'
        )}
        style={{ width: '1.125rem', height: '1.125rem' }}
      />
    </button>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider mb-0 pb-3 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const THEME_OPTIONS: { id: Theme; label: string; icon: React.ElementType }[] = [
  { id: 'dark',   label: 'Dark',   icon: Moon    },
  { id: 'light',  label: 'Light',  icon: Sun     },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { preferredProvider, defaultSport, notificationsEnabled, reducedMotion, setSetting, resetSettings } = useSettingsStore();
  const { clearFavorites, favorites } = useFavoritesStore();
  const { clearHistory, history } = useHistoryStore();
  const { clearNotifications, notifications } = useNotificationsStore();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Settings size={24} style={{ color: 'var(--text-secondary)' }} />
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
      </div>
      <p className="text-sm font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
        Customize your preferences and manage data
      </p>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <div className="pt-4">
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors',
                  theme === id
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <SettingRow
          label="Reduced Motion"
          description="Minimize animations for accessibility"
        >
          <Toggle
            checked={reducedMotion}
            onChange={(v) => setSetting('reducedMotion', v)}
          />
        </SettingRow>
      </SettingSection>

      {/* Streaming */}
      <SettingSection title="Streaming">
        <SettingRow label="Default Stream Provider" description="Preferred streaming source">
          <select
            value={preferredProvider}
            onChange={(e) => setSetting('preferredProvider', e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 border outline-none focus:border-brand-500"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            {STREAM_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.quality})</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow label="Default Sport" description="Sport to show on the homepage">
          <select
            value={defaultSport}
            onChange={(e) => setSetting('defaultSport', e.target.value as typeof defaultSport)}
            className="text-sm rounded-lg px-3 py-1.5 border outline-none focus:border-brand-500"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Sports</option>
            {SPORTS_CONFIG.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </SettingRow>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications">
        <SettingRow
          label="Match Notifications"
          description="Get notified when your saved matches go live"
        >
          <Toggle
            checked={notificationsEnabled}
            onChange={(v) => {
              setSetting('notificationsEnabled', v);
              if (v && 'Notification' in window) {
                Notification.requestPermission();
              }
            }}
          />
        </SettingRow>
      </SettingSection>

      {/* Data & Privacy */}
      <SettingSection title="Data & Privacy">
        <SettingRow label="Watch History" description={`${history.length} entries stored locally`}>
          <button
            onClick={clearHistory}
            disabled={history.length === 0}
            className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear
          </button>
        </SettingRow>
        <SettingRow label="Favorites" description={`${favorites.length} items saved`}>
          <button
            onClick={clearFavorites}
            disabled={favorites.length === 0}
            className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear
          </button>
        </SettingRow>
        <SettingRow label="Notifications" description={`${notifications.length} stored`}>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear
          </button>
        </SettingRow>
      </SettingSection>

      {/* Reset */}
      <div className="card p-5">
        <button
          onClick={() => { if (confirm('Reset all settings to default?')) resetSettings(); }}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <RotateCcw size={15} />
          Reset all settings to default
        </button>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
        All data is stored locally on your device. StreamSport does not collect personal information.
      </p>
    </div>
  );
}
