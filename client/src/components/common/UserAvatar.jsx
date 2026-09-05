import React from 'react';
import { 
  Crown, 
  Shield, 
  Briefcase, 
  Star, 
  Headphones, 
  Sparkles, 
  Code2, 
  TrendingUp,
  User as UserIcon
} from 'lucide-react';

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    name: 'Executive',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    shadow: 'rgba(249, 115, 22, 0.35)',
    border: '#ea580c'
  },
  {
    id: 'avatar-2',
    name: 'Admin Guardian',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    shadow: 'rgba(59, 130, 246, 0.35)',
    border: '#2563eb'
  },
  {
    id: 'avatar-3',
    name: 'Finance & Ledger',
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: 'rgba(16, 185, 129, 0.35)',
    border: '#059669'
  },
  {
    id: 'avatar-4',
    name: 'VIP Star',
    icon: Star,
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    shadow: 'rgba(168, 85, 247, 0.35)',
    border: '#9333ea'
  },
  {
    id: 'avatar-5',
    name: 'Operations & Support',
    icon: Headphones,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    shadow: 'rgba(6, 182, 212, 0.35)',
    border: '#0891b2'
  },
  {
    id: 'avatar-6',
    name: 'Creative Spark',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    shadow: 'rgba(236, 72, 153, 0.35)',
    border: '#db2777'
  },
  {
    id: 'avatar-7',
    name: 'Tech & Systems',
    icon: Code2,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    shadow: 'rgba(99, 102, 241, 0.35)',
    border: '#4f46e5'
  },
  {
    id: 'avatar-8',
    name: 'Growth & Trade',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    shadow: 'rgba(245, 158, 11, 0.35)',
    border: '#d97706'
  }
];

const UserAvatar = ({ avatarId = 'avatar-1', name = '', size = 40, style = {}, showRing = false, className = '' }) => {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarId) || AVATAR_PRESETS[0];
  const IconComponent = preset ? preset.icon : UserIcon;
  const iconSize = Math.round(size * 0.52);

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        background: preset.gradient,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 3px 8px ${preset.shadow}`,
        border: showRing ? `2px solid #ffffff` : 'none',
        outline: showRing ? `2px solid var(--palette-orange)` : 'none',
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
