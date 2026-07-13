import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import UserCard from '../UserCard'
import FollowBtn from '../FollowBtn'
import { getSuggestions } from '../../redux/actions/suggestionsAction'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getDataAPI } from '../../utils/fetchData'
import Avatar from '../Avatar'

const RightSideBar = () => {
    const { auth, suggestions, online } = useSelector(state => state)
    const dispatch = useDispatch()

    const [trending, setTrending] = useState([])
    const [loadingTags, setLoadingTags] = useState(false)

    useEffect(() => {
        setLoadingTags(true)
        getDataAPI('trending_tags', auth.token)
        .then(res => {
            setTrending(res.data.tags || [])
            setLoadingTags(false)
        })
        .catch(() => setLoadingTags(false))
    }, [auth.token])

    // Find following friends that are online
    const onlineFriends = (auth.user.following || []).filter(user => {
        const userId = typeof user === 'object' ? user._id : user
        return online.includes(userId)
    })

    return (
        <div className="mt-3 right_sidebar_inner">
            <UserCard user={auth.user} />

            {/* Suggestions Block */}
            <div className="card p-3 mb-4 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="font-weight-bold m-0" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Suggestions for you</h6>
                    {
                        !suggestions.loading &&
                        <i className="fas fa-sync text-muted cursor-pointer" style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={ () => dispatch(getSuggestions(auth.token)) } />
                    }
                </div>
                {
                    suggestions.loading
                    ? <Skeleton height={50} className="mb-2" borderRadius={8} count={3} />
                    : <div className="suggestions">
                        {
                            suggestions.users.slice(0, 4).map(user => (
                                <UserCard key={user._id} user={user} >
                                    <FollowBtn user={user} />
                                </UserCard>
                            ))
                        }
                    </div>
                }
            </div>

            {/* Online Friends Widget (Facebook/Socialize Style active dock) */}
            {
                onlineFriends.length > 0 && (
                    <div className="card p-3 mb-4 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <h6 className="font-weight-bold mb-3" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Online Friends</h6>
                        <div className="d-flex flex-column" style={{ gap: '10px' }}>
                            {
                                onlineFriends.map(friend => {
                                    const friendObj = typeof friend === 'object' ? friend : { _id: friend, username: 'Friend', avatar: '' }
                                    return (
                                        <div key={friendObj._id} className="d-flex align-items-center justify-content-between">
                                            <Link to={`/profile/${friendObj._id}`} className="d-flex align-items-center text-decoration-none">
                                                <div className="position-relative">
                                                    <Avatar src={friendObj.avatar} size="medium-avatar" />
                                                    <span className="position-absolute" style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        background: '#2b8a3e',
                                                        border: '2px solid var(--bg-card)',
                                                        borderRadius: '50%',
                                                        bottom: '0',
                                                        right: '0'
                                                    }} />
                                                </div>
                                                <span className="ml-2 font-weight-bold" style={{ color: 'var(--text-main)', fontSize: '0.82rem' }}>
                                                    @{friendObj.username}
                                                </span>
                                            </Link>
                                            <Link to={`/message/${friendObj._id}`} className="btn btn-sm btn-outline-success py-1 px-2" style={{ fontSize: '0.75rem', borderRadius: '8px' }}>
                                                Chat
                                            </Link>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }

            {/* Trending Tags Widget */}
            <div className="card p-3 mb-4 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h6 className="font-weight-bold mb-3" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Trending Tags</h6>
                {
                    loadingTags ? (
                        <Skeleton height={35} count={3} borderRadius={8} className="mb-2" />
                    ) : trending.length === 0 ? (
                        <div className="text-muted text-center py-2" style={{ fontSize: '0.8rem' }}>No trending tags yet</div>
                    ) : (
                        <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                            {
                                trending.slice(0, 5).map((t, idx) => (
                                    <Link key={idx} to={`/posts/tag/${t.tag}`} className="btn btn-sm btn-light py-1 px-3 d-flex align-items-center text-decoration-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '0.75rem', gap: '6px' }}>
                                        <i className="fas fa-hashtag text-primary" style={{ fontSize: '0.7rem' }} />
                                        <strong>{t.tag}</strong>
                                        <span className="text-muted">({t.count})</span>
                                    </Link>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default RightSideBar
