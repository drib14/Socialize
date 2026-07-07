import React, { useEffect, useState } from 'react'

import Info from '../../components/profile/Info'
import Posts from '../../components/profile/Posts'
import Saved from '../../components/profile/Saved'

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

    return (
        <div className="profile">
            
            <Info auth={auth} profile={profile} dispatch={dispatch} id={id} />

            <div className="profile_tab">
                <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Posts</button>
                <button className={tab === 'reposts' ? 'active' : ''} onClick={() => setTab('reposts')}>Reposts</button>
                {
                    auth.user._id === id &&
                    <button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>Saved</button>
                }
            </div>

            {
                profile.loading 
                ? <ProfileSkeleton />
                : <>
                    {
                        tab === 'saved' && <Saved auth={auth} dispatch={dispatch} />
                    }
                    {
                        tab === 'posts' && <Posts auth={auth} profile={profile} dispatch={dispatch} id={id} isRepostTab={false} />
                    }
                    {
                        tab === 'reposts' && <Posts auth={auth} profile={profile} dispatch={dispatch} id={id} isRepostTab={true} />
                    }
                </>
            }
            
        </div>
    )
}

export default Profile
