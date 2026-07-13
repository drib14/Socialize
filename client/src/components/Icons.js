import React from 'react'

const Icons = ({setContent, content, theme}) => {
    const iconsList = [
        'thumb_up', 'favorite', 'sentiment_very_satisfied', 'sentiment_very_dissatisfied', 
        'celebration', 'local_fire_department', 'lightbulb', 'star', 
        'check_circle', 'error', 'info', 'help', 
        'chat', 'send', 'share', 'visibility',
        'lock', 'edit', 'delete', 'settings',
        'home', 'notifications', 'search', 'person'
    ];

    const getIconColor = (name) => {
        if (name === 'thumb_up') return '#1877f2';
        if (name === 'favorite') return '#e0245e';
        if (name === 'sentiment_very_satisfied') return '#f5c33b';
        if (name === 'sentiment_very_dissatisfied') return '#f5c33b';
        if (name === 'celebration') return '#ff9f43';
        if (name === 'local_fire_department') return '#ff4757';
        if (name === 'lightbulb') return '#eccc68';
        if (name === 'star') return '#f1c40f';
        if (name === 'check_circle') return '#2ecc71';
        if (name === 'error') return '#e74c3c';
        if (name === 'info') return '#3498db';
        return 'var(--text-secondary)';
    };

    const handleIconClick = (iconName) => {
        setContent(content + ` :${iconName}: `)
    }

    return (
        <div className="nav-item dropdown" style={{ opacity: 1 }}>
            <span className="nav-link position-relative px-1" id="navbarDropdown" 
            role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
            style={{ cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>sentiment_satisfied_alt</span>
            </span>

            <div className="dropdown-menu p-2" aria-labelledby="navbarDropdown" onClick={(e) => e.stopPropagation()} 
                 style={{ 
                     border: '1px solid var(--border-color)', 
                     background: 'var(--bg-card)', 
                     boxShadow: 'var(--shadow-md)', 
                     borderRadius: '12px',
                     minWidth: '220px',
                     maxWidth: '240px'
                 }}>
                 <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                     {iconsList.map(name => (
                         <span key={name} 
                               onClick={() => handleIconClick(name)}
                               style={{ 
                                   cursor: 'pointer', 
                                   transition: 'transform 0.15s ease',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   width: '32px',
                                   height: '32px',
                                   borderRadius: '6px'
                               }}
                               className="quick_icon_select_btn"
                               title={name.replace(/_/g, ' ')}>
                             <span className="material-icons" style={{ fontSize: '1.25rem', color: getIconColor(name) }}>
                                 {name}
                             </span>
                         </span>
                     ))}
                 </div>
                 <style>{`
                     .quick_icon_select_btn:hover {
                         background: var(--bg-input);
                         transform: scale(1.15);
                     }
                 `}</style>
            </div>
        </div>
    )
}

export default Icons
