import React, { useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const LikeButton = ({isLike, handleLike, handleUnLike}) => {
    const [animate, setAnimate] = useState(false)

    const onLikeClick = () => {
        setAnimate(true)
        setTimeout(() => setAnimate(false), 300)
        handleLike()
    }

    const onUnLikeClick = () => {
        setAnimate(true)
        setTimeout(() => setAnimate(false), 300)
        handleUnLike()
    }

    return (
        <div style={{
            transform: animate ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'inline-block'
        }}>
            {
                isLike
                ? <FaHeart className="text-danger animate-pop" onClick={onUnLikeClick} style={{ cursor: 'pointer', fontSize: '24px' }} />
                : <FaRegHeart className="text-secondary animate-pop" onClick={onLikeClick} style={{ cursor: 'pointer', fontSize: '24px' }} />
            }
        </div>
    )
}

export default LikeButton
