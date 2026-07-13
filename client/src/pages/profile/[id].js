import React, { useEffect, useState } from 'react'

import Info from '../../components/profile/Info'
import Posts from '../../components/profile/Posts'

import { useSelector, useDispatch } from 'react-redux'
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton'
import { getProfileUsers } from '../../redux/actions/profileAction'
import { useParams } from 'react-router-dom'


const Profile = () => {
    const { profile, auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const { id } = useParams()
    const [tab, setTab] = useState('posts')

    useEffect(() => {
        if(profile.ids.every(item => item !== id)){
            dispatch(getProfileUsers({id, auth}))
        }
    },[id, auth, dispatch, profile.ids])

    const profileUser = profile.users.find(user => user._id === id)
    const isMyProfile = id === auth.user._id
    const isFollowing = profileUser && profileUser.followers.some(item => (item._id || item) === auth.user._id)
    const showPrivateLock = profileUser && profileUser.isPrivate && !isMyProfile && !isFollowing

    return (
        <div className="profile">
            
            <Info auth={auth} profile={profile} dispatch={dispatch} id={id} />

            {
                showPrivateLock ? (
                    <div className="text-center my-5 p-5 border d-flex flex-column align-items-center justify-content-center" 
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', maxWidth: '600px', margin: 'auto' }}>
                        <span className="material-icons text-muted" style={{ fontSize: '4.5rem', color: 'var(--primary-color)' }}>lock</span>
                        <h4 className="mt-3 font-weight-bold" style={{ color: 'var(--text-main)' }}>This Account is Private</h4>
                        <p className="text-muted text-center" style={{ fontSize: '0.95rem', maxWidth: '400px' }}>
                            Follow this user to view their posts, stories, and social timeline.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="profile_tab">
                            <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')} title="Posts">
                                <span className="material-icons">grid_on</span>
                            </button>
                            <button className={tab === 'reposts' ? 'active' : ''} onClick={() => setTab('reposts')} title="Reposts">
                                <span className="material-icons">repeat</span>
                            </button>
                        </div>

                        {
                            profile.loading 
                            ? <ProfileSkeleton />
                            : <>
                                {
                                    tab === 'posts' && <Posts auth={auth} profile={profile} dispatch={dispatch} id={id} isRepostTab={false} />
                                }
                                {
                                    tab === 'reposts' && <Posts auth={auth} profile={profile} dispatch={dispatch} id={id} isRepostTab={true} />
                                }
                            </>
                        }
                    </>
                )
            }
            
        </div>
    )
}

export default Profile
