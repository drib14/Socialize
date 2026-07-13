import React, { useState, useRef } from 'react'
import Carousel from '../../Carousel'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { likePost, votePollOption } from '../../../redux/actions/postAction'
import Avatar from '../../Avatar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { renderTextWithIcons } from '../../../utils/iconParser'

dayjs.extend(relativeTime)

const CardBody = ({post, theme}) => {
    const [readMore, setReadMore] = useState(false)
    const [showHeart, setShowHeart] = useState(false)
    const [showTags, setShowTags] = useState(false)

    const dispatch = useDispatch()
    const { auth, socket } = useSelector(state => state)
    const lastTap = useRef(0)

    const handleVote = (optionId) => {
        dispatch(votePollOption({post, optionId, auth}))
    }

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
                        <Carousel images={post.images} id={post._id} altText={post.altText} />
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

                        {/* Tagged Users Indicator Overlay */}
                        {
                            post.taggedUsers && post.taggedUsers.length > 0 && (
                                <>
                                    <div 
                                        className="position-absolute d-flex align-items-center justify-content-center"
                                        style={{ bottom: '15px', left: '15px', zIndex: 25, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', cursor: 'pointer' }}
                                        onClick={(e) => { e.stopPropagation(); setShowTags(!showTags); }}
                                    >
                                        <i className="fas fa-user-tag" style={{ fontSize: '0.85rem' }}></i>
                                    </div>

                                    {
                                        showTags && (
                                            <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center" 
                                                 style={{ top: 0, left: 0, background: 'rgba(0,0,0,0.45)', zIndex: 24, borderRadius: '12px' }}
                                                 onClick={() => setShowTags(false)}
                                            >
                                                <div className="d-flex flex-wrap justify-content-center p-3" style={{ gap: '8px' }}>
                                                    {post.taggedUsers.map(u => (
                                                        <Link 
                                                            key={u._id} 
                                                            to={`/profile/${u._id}`}
                                                            className="px-2 py-1"
                                                            style={{ background: 'rgba(255,255,255,0.95)', color: '#000', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #ddd', textDecoration: 'none' }}
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            @{u.username || u}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                </>
                            )
                        }
                    </div>
                )
            }

            {/* Poll options component */}
            {post.poll && post.poll.options && post.poll.options.length > 0 && (
                <div className="mt-3 p-3" style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    background: 'var(--bg-card)'
                }}>
                    {post.poll.question && (
                        <h6 className="font-weight-bold mb-3" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {post.poll.question}
                        </h6>
                    )}
                    <div className="d-flex flex-column" style={{ gap: '10px' }}>
                        {post.poll.options.map(option => {
                            const totalVotes = post.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
                            const hasVoted = post.poll.options.some(opt => opt.votes.includes(auth.user._id))
                            const voteCount = option.votes.length
                            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
                            const isMyVote = option.votes.includes(auth.user._id)

                            return (
                                <div key={option._id} 
                                     onClick={() => !hasVoted && handleVote(option._id)}
                                     className="position-relative p-2 d-flex align-items-center justify-content-between"
                                     style={{
                                         border: '1px solid var(--border-color)',
                                         borderRadius: '8px',
                                         cursor: hasVoted ? 'default' : 'pointer',
                                         overflow: 'hidden',
                                         fontSize: '0.85rem',
                                         background: 'var(--bg-input)',
                                         transition: 'background 0.2s'
                                     }}>
                                    
                                    {/* Percentage fill indicator */}
                                    {hasVoted && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, bottom: 0,
                                            width: `${percentage}%`,
                                            background: isMyVote ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.05)',
                                            zIndex: 1,
                                            transition: 'width 0.5s ease-out'
                                        }} />
                                    )}

                                    <span style={{ zIndex: 2, fontWeight: isMyVote ? '600' : 'normal', color: 'var(--text-main)' }}>
                                        {option.text} {isMyVote && <i className="fas fa-check-circle text-success ml-1" />}
                                    </span>

                                    {hasVoted && (
                                        <span style={{ zIndex: 2, fontWeight: '600', color: 'var(--text-main)' }}>
                                            {percentage}% ({voteCount})
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Embedded Quote Repost original card block */}
            {post.repostOf && (
                <div className="mt-3 p-3 text-left" style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.02)',
                    cursor: 'pointer'
                }} onClick={() => window.location.href = `/post/${post.repostOf._id}`}>
                    <div className="d-flex align-items-center mb-2">
                        <Avatar src={post.repostOf.user.avatar} size="small-avatar" />
                        <div className="ml-2">
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>@{post.repostOf.user.username}</strong>
                            <span className="text-muted ml-2" style={{ fontSize: '0.75rem' }}>{dayjs(post.repostOf.createdAt).fromNow()}</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                        {renderContent(post.repostOf.content)}
                    </div>
                    {post.repostOf.images && post.repostOf.images.length > 0 && (
                        <div className="mt-2" style={{ maxHeight: '200px', overflow: 'hidden', borderRadius: '8px' }}>
                            <Carousel images={post.repostOf.images} id={post.repostOf._id} altText={post.repostOf.altText} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default CardBody
