import React from 'react';

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
    
    // Match strings like :thumb_up: or :favorite:
    const regex = /:([a-z0-9_]+):/g;
    const parts = text.split(regex);
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
        // odd indices match the captured group (the icon name)
        if (index % 2 === 1) {
            const color = iconColors[part] || 'var(--text-secondary)';
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
                    {part}
                </span>
            );
        }
        return part;
    });
};
