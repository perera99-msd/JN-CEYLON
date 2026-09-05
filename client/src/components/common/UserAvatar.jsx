import React from 'react';
import { User as UserIcon } from 'lucide-react';

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    name: 'Charcoal',
    bg: '#1e293b',
    color: '#ffffff',
    border: '#334155'
  },
  {
    id: 'avatar-2',
    name: 'Cobalt',
    bg: '#1d4ed8',
    color: '#ffffff',
    border: '#2563eb'
  },
  {
    id: 'avatar-3',
    name: 'Emerald',
    bg: '#047857',
    color: '#ffffff',
    border: '#059669'
  },
  {
    id: 'avatar-4',
    name: 'Amber',
    bg: '#b45309',
    color: '#ffffff',
    border: '#d97706'
  },
  {
    id: 'avatar-5',
    name: 'Indigo',
    bg: '#4338ca',
    color: '#ffffff',
    border: '#4f46e5'
  },
  {
    id: 'avatar-6',
    name: 'Rose',
    bg: '#be185d',
    color: '#ffffff',
    border: '#db2777'
  },
  {
    id: 'avatar-7',
    name: 'Teal',
    bg: '#0f766e',
    color: '#ffffff',
    border: '#0d9488'
  },
  {
    id: 'avatar-8',
    name: 'Violet',
    bg: '#6d28d9',
    color: '#ffffff',
    border: '#7c3aed'
  }
];

export const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'JN';
  const clean = name.trim();
  if (!clean) return 'JN';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return clean.slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const UserAvatar = ({ avatarId = 'avatar-1', name = '', size = 40, style = {}, showRing = false, className = '' }) => {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarId) || AVATAR_PRESETS[0];
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.round(size * 0.40));

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        backgroundColor: preset.bg,
        color: preset.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        letterSpacing: '-0.02em',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        outline: showRing ? '2px solid var(--palette-orange)' : 'none',
        outlineOffset: showRing ? '2px' : '0',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'all 0.15s ease',
        ...style
      }}
      title={name ? `${name} (${preset.name})` : preset.name}
    >
      {initials || <UserIcon size={Math.round(size * 0.5)} />}
    </div>
  );
};

export default UserAvatar;
