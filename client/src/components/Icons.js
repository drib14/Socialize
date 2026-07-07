import React from 'react'
import EmojiPicker from 'emoji-picker-react'
import { BsEmojiSmile } from 'react-icons/bs'

const Icons = ({setContent, content, theme}) => {
    const handleEmojiClick = (emojiData) => {
        setContent(content + emojiData.emoji)
    }

    return (
        <div className="nav-item dropdown" style={{ opacity: 1 }}>
            <span className="nav-link position-relative px-1" id="navbarDropdown" 
            role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
            style={{ cursor: 'pointer' }}>
                <BsEmojiSmile style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }} />
            </span>

            <div className="dropdown-menu p-0" aria-labelledby="navbarDropdown" onClick={(e) => e.stopPropagation()} style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    theme={theme ? 'dark' : 'light'}
                    lazyLoadEmojis={true}
                />
            </div>
        </div>
    )
}

export default Icons
