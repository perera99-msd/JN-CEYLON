import React from 'react';
import { 
  User, 
  UserCheck, 
  Shield, 
  Briefcase, 
  Award, 
  Headphones, 
  Laptop, 
  Compass 
} from 'lucide-react';

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    name: 'Executive',
    icon: UserCheck,
    bg: '#1e293b',
    color: '#ffffff',
    border: '#334155'
  },
  {
    id: 'avatar-2',
    name: 'Security',
    icon: Shield,
    bg: '#1d4ed8',
    color: '#ffffff',
    border: '#2563eb'
  },
  {
    id: 'avatar-3',
    name: 'Finance',
    icon: Briefcase,
    bg: '#047857',
    color: '#ffffff',
    border: '#059669'
  },
  {
    id: 'avatar-4',
    name: 'Manager',
    icon: Award,
    bg: '#b45309',
    color: '#ffffff',
    border: '#d97706'
  },
  {
    id: 'avatar-5',
    name: 'Technical',
    icon: Laptop,
    bg: '#4338ca',
    color: '#ffffff',
    border: '#4f46e5'
  },
  {
    id: 'avatar-6',
    name: 'Standard',
    icon: User,
    bg: '#be185d',
    color: '#ffffff',
    border: '#db2777'
  },
  {
    id: 'avatar-7',
    name: 'Support',
    icon: Headphones,
    bg: '#0f766e',
    color: '#ffffff',
    border: '#0d9488'
  },
  {
    id: 'avatar-8',
    name: 'Operations',
    icon: Compass,
    bg: '#6d28d9',
    color: '#ffffff',
    border: '#7c3aed'
  }
];

const UserAvatar = ({ avatarId = 'avatar-1', name = '', size = 40, style = {}, showRing = false, className = '' }) => {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarId) || AVATAR_PRESETS[0];
  const IconComponent = preset.icon || User;
  const iconSize = Math.max(12, Math.round(size * 0.52));

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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        outline: showRing ? '2px solid var(--palette-orange)' : 'none',
        outlineOffset: showRing ? '2px' : '0',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'all 0.15s ease',
        ...style
      }}
      title={name ? `${name} (${preset.name})` : preset.name}
    >
      <IconComponent size={iconSize} strokeWidth={2.2} />
    </div>
  );
};

export default UserAvatar;
