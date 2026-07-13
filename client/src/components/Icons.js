import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'

const Icons = ({setContent, content, theme}) => {
    const [showPicker, setShowPicker] = useState(false)

    const onEmojiClick = (emojiData) => {
        setContent(content + emojiData.emoji)
    }

    return (
        <div className="nav-item dropdown" style={{ opacity: 1, position: 'relative' }}>
            <span className="nav-link position-relative px-1" 
                  onClick={() => setShowPicker(!showPicker)}
                  style={{ cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>sentiment_satisfied_alt</span>
            </span>

            {showPicker && (
                <div className="position-absolute" style={{ 
                    bottom: '40px', 
                    right: 0, 
                    zIndex: 1000,
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: '8px'
                }} onClick={(e) => e.stopPropagation()}>
                    <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        theme={theme ? 'dark' : 'light'}
                        width={300}
                        height={400}
                    />
                </div>
            )}
        </div>
    )
}

export default Icons
