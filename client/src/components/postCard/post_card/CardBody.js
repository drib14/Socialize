import React, { useState, useRef } from 'react'
import Carousel from '../../Carousel'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { likePost } from '../../../redux/actions/postAction'

import { renderTextWithIcons } from '../../../utils/iconParser'

const CardBody = ({post, theme}) => {
    const [readMore, setReadMore] = useState(false)
    const [showHeart, setShowHeart] = useState(false)

    const dispatch = useDispatch()
    const { auth, socket } = useSelector(state => state)
    const lastTap = useRef(0)

    const renderContent = (content) => {
        if (!content) return '';
        const parts = content.split(/([@#]\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link key={index} to={`/profile_by_username/${username}`} style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                        {part}
                    </Link>
                );
            }
            if (part.startsWith('#')) {
                const tag = part.substring(1);
                return (
                    <Link key={index} to={`/posts/tag/${tag}`} style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>
                        {part}
                    </Link>
                );
            }
            return renderTextWithIcons(part);
        });
    };

    const getCardTheme = (postId) => {
        const code = postId ? postId.toString().charCodeAt(postId.toString().length - 1) % 3 : 0;
        if (code === 0) return 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
        if (code === 1) return 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
        return 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            const hasLiked = post.likes.some(like => (like._id || like) === auth.user._id);
            if (!hasLiked) {
                dispatch(likePost({post, auth, socket}));
            }
            setShowHeart(true);
            setTimeout(() => {
                setShowHeart(false);
            }, 800);
        }
        lastTap.current = now;
    };

    const isShortText = post.images.length === 0 && post.content && post.content.length < 120;

    return (
        <div className="card_body px-3 pb-2">
            <style>{`
                @keyframes heartBlast {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    15% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.9; }
                    30% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.9; }
                    80% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.9; }
                    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                }
            `}</style>

            {
                isShortText ? (
                    <div className="text-center p-4 my-2 text-white font-weight-bold d-flex align-items-center justify-content-center"
                    style={{ 
                        background: getCardTheme(post._id), 
                        minHeight: '200px', 
                        borderRadius: '12px',
                        fontSize: '1.4rem', 
                        textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                        lineHeight: '1.4'
                    }}>
                        <span style={{ maxWidth: '90%' }}>{renderContent(post.content)}</span>
                    </div>
                ) : (
                    <div className="card_body-content mb-2" 
                    style={{
                        color: 'var(--text-main)',
                    }}>
                        <span>
                            {
                                post.content.length < 60 
                                ? renderContent(post.content) 
                                : readMore ? renderContent(post.content) : renderContent(post.content.slice(0, 60) + '.....')
                            }
                        </span>
                        {
                            post.content.length > 60 &&
                            <span className="readMore ml-1" onClick={() => setReadMore(!readMore)} style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '600' }}>
                                {readMore ? 'Hide content' : 'Read more'}
                            </span>
                        }
                    </div>
                )
            }

            {
                post.images.length > 0 && (
                    <div className="position-relative" onClick={handleDoubleTap} style={{ cursor: 'pointer' }}>
                        <Carousel images={post.images} id={post._id} />
                        {
                            showHeart && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 100,
                                    pointerEvents: 'none',
                                    animation: 'heartBlast 0.8s ease-out'
                                }}>
                                    <span className="material-icons text-white" style={{ fontSize: '5rem', textShadow: '0 0 15px rgba(0,0,0,0.3)' }}>favorite</span>
                                </div>
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default CardBody
