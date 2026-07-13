import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import LeftSideBar from '../components/home/LeftSideBar'
import RightSideBar from '../components/home/RightSideBar'
import Avatar from '../components/Avatar'
import { addCloseFriend, removeCloseFriend } from '../redux/actions/profileAction'

const CloseFriends = () => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    const [search, setSearch] = useState('')

    const handleToggleCloseFriend = (user) => {
        const isCF = auth.user.closeFriends && auth.user.closeFriends.includes(user._id);
        if (isCF) {
            dispatch(removeCloseFriend({ user, auth }))
        } else {
            dispatch(addCloseFriend({ user, auth }))
        }
    }

    const followingList = auth.user.following || []
    const filteredList = followingList.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.fullname.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="home row mx-0" style={{ width: '100%' }}>
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <LeftSideBar />
            </div>

            <div className="col-12 col-md-6 col-lg-6 mt-3">
                <div className="card p-4" style={{ borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                    <h4 className="font-weight-bold mb-2">Close Friends</h4>
                    <p className="text-muted small mb-3">
                        We don't send notifications when you edit your Close Friends list. Stories shared with close friends will have a green ring.
                    </p>

                    <input 
                        type="text" 
                        placeholder="Search followings..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="form-control mb-4"
                        style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '10px 15px' }}
                    />

                    <div className="close-friends-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filteredList.length === 0 ? (
                            <div className="text-center text-muted py-4 small">No followings found.</div>
                        ) : (
                            filteredList.map(user => {
                                const isCF = auth.user.closeFriends && auth.user.closeFriends.includes(user._id);
                                return (
                                    <div key={user._id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                        <div className="d-flex align-items-center">
                                            <Avatar src={user.avatar} size="medium-avatar" />
                                            <div className="ml-3">
                                                <strong className="d-block" style={{ fontSize: '0.9rem' }}>@{user.username}</strong>
                                                <span className="small text-muted">{user.fullname}</span>
                                            </div>
                                        </div>
                                        <button 
                                            className={`btn btn-sm ${isCF ? 'btn-success' : 'btn-outline-secondary'}`}
                                            onClick={() => handleToggleCloseFriend(user)}
                                            style={{ borderRadius: '20px', padding: '5px 15px', fontWeight: 600, fontSize: '0.8rem' }}
                                        >
                                            {isCF ? 'Close Friend' : 'Add'}
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <RightSideBar />
            </div>
        </div>
    )
}

export default CloseFriends
