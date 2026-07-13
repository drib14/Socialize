import React from 'react';
import { Link } from 'react-router-dom';

const iconColors = {
    'thumb_up': '#1877f2',
    'favorite': '#e0245e',
    'sentiment_very_satisfied': '#f5c33b',
    'sentiment_very_dissatisfied': '#f5c33b',
    'celebration': '#ff9f43',
    'local_fire_department': '#ff4757',
    'lightbulb': '#eccc68',
    'star': '#f1c40f',
    'check_circle': '#2ecc71',
    'error': '#e74c3c',
    'info': '#3498db'
};

export const renderTextWithIcons = (text) => {
    if (!text) return '';
    
    // Match icons (:icon:), mentions (@username), or hashtags (#tag)
    const regex = /(:[a-z0-9_]+:)|(\s|^)(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g;
    const parts = text.split(regex);
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
        if (!part) return null;
        const trimmed = part.trim();

        // 1. Icon match
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
            const iconName = trimmed.slice(1, -1);
            const color = iconColors[iconName] || 'var(--text-secondary)';
            return (
                <span 
                    key={index} 
                    className="material-icons" 
                    style={{ 
                        fontSize: '1.15rem', 
                        verticalAlign: 'middle', 
                        margin: '0 2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: color
                    }}
                >
                    {iconName}
                </span>
            );
        }

        // 2. Mention match
        if (trimmed.startsWith('@')) {
            const username = trimmed.substring(1);
            return (
                <Link 
                    key={index} 
                    to={`/profile_by_username/${username}`} 
                    style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}
                >
                    {part}
                </Link>
            );
        }

        // 3. Hashtag match
        if (trimmed.startsWith('#')) {
            const tag = trimmed.substring(1);
            return (
                <Link 
                    key={index} 
                    to={`/posts/tag/${tag}`} 
                    style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}
                >
                    {part}
                </Link>
            );
        }

        return part;
    });
};
