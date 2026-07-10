import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMoments } from '../../redux/actions/momentAction'
import Avatar from '../Avatar'
import CreateMomentModal from './CreateMomentModal'
import MomentViewer from './MomentViewer'

const MomentsBar = () => {
    const { auth, moments } = useSelector(state => state)
    const dispatch = useDispatch()

    const [isCreateOpen, setCreateOpen] = useState(false)
    const [viewerIndex, setViewerIndex] = useState(null) // holds selected moments group index

    useEffect(() => {
        if (auth.token) {
            dispatch(getMoments(auth.token))
        }
    }, [auth.token, dispatch])

    // Find current user's active moments group
    const myMomentsGroup = moments.moments.find(group => group.user._id === auth.user._id)
    const followingGroups = moments.moments.filter(group => group.user._id !== auth.user._id)

    // Check if a group has any unviewed moments
    const hasUnviewedMoments = (group) => {
        if (!group || !group.moments) return false;
        return group.moments.some(m => !m.views.includes(auth.user._id))
    }

    const openViewer = (groupUserId) => {
        const index = moments.moments.findIndex(group => group.user._id === groupUserId)
        if (index > -1) {
            setViewerIndex(index)
        }
    }

    return (
        <div className="moments-wrapper">
            <div className="moments-title">
                <span className="material-icons text-primary" style={{ fontSize: '1.2rem' }}>flash_on</span>
                <span>Moments</span>
            </div>

            <div className="moments-container">
                {/* 1. SELF CARD (Create / View own stories) */}
                {
                    myMomentsGroup ? (
                        /* Self has active moments */
                        <div 
                            className="moment-card"
                            onClick={() => openViewer(auth.user._id)}
                        >
                            <img 
                                src={myMomentsGroup.moments[0].media} 
                                alt="My Moment" 
                                className="moment-card-media"
                            />
                            <div className="moment-card-overlay"></div>
                            
                            {/* Small plus badge in corner to add more */}
                            <div 
                                className="create-moment-btn"
                                style={{ top: '10px', left: 'unset', right: '10px', transform: 'none', border: '2px solid var(--bg-card)', width: '28px', height: '28px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCreateOpen(true);
                                }}
                                title="Add another moment"
                            >
                                <i className="fas fa-plus" style={{ fontSize: '0.7rem' }}></i>
                            </div>

                            <div className="moment-card-name">My Moment</div>
                        </div>
                    ) : (
                        /* Self has NO active moments */
                        <div 
                            className="moment-card create-moment-card"
                            onClick={() => setCreateOpen(true)}
                        >
                            <div className="create-moment-top">
                                <img src={auth.user.avatar} alt="avatar" />
                            </div>
                            <div className="create-moment-bottom">
                                <div className="create-moment-btn">
                                    <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                                </div>
                                <span className="create-moment-text">Add Moment</span>
                            </div>
                        </div>
                    )
                }

                {/* 2. FOLLOWING CARDS */}
                {
                    followingGroups.map((group) => {
                        const isNew = hasUnviewedMoments(group)
                        const latestMoment = group.moments[0]

                        return (
                            <div 
                                key={group.user._id} 
                                className="moment-card"
                                onClick={() => openViewer(group.user._id)}
                            >
                                <img 
                                    src={latestMoment.media} 
                                    alt="thumbnail" 
                                    className="moment-card-media" 
                                />
                                <div className="moment-card-overlay"></div>

                                <div className={`moment-card-avatar ${isNew ? 'unviewed' : 'viewed'}`}>
                                    <img src={group.user.avatar} alt="avatar" />
                                </div>

                                <div className="moment-card-name text-truncate">
                                    {group.user.fullname.split(' ')[0]}
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            {/* Modal for uploading a new Moment */}
            {
                isCreateOpen && (
                    <CreateMomentModal 
                        isOpen={isCreateOpen} 
                        onClose={() => setCreateOpen(false)} 
                    />
                )
            }

            {/* Stories Fullscreen Slider Viewer */}
            {
                viewerIndex !== null && moments.moments[viewerIndex] && (
                    <MomentViewer 
                        userMoments={moments.moments[viewerIndex]}
                        onClose={() => setViewerIndex(null)}
                        onPrevUser={
                            viewerIndex > 0 
                                ? () => setViewerIndex(viewerIndex - 1) 
                                : null
                        }
                        onNextUser={
                            viewerIndex < moments.moments.length - 1 
                                ? () => setViewerIndex(viewerIndex + 1) 
                                : null
                        }
                    />
                )
            }
        </div>
    )
}

export default MomentsBar
