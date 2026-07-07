import React from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const LikeButton = ({isLike, handleLike, handleUnLike}) => {
    return (
        <>
            {
                isLike
                ? <FaHeart className="text-danger" onClick={handleUnLike} style={{ cursor: 'pointer', fontSize: '24px' }} />
                : <FaRegHeart onClick={handleLike} style={{ cursor: 'pointer', fontSize: '24px' }} />
            }
        </>
    )
}

export default LikeButton
