import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/actions/authAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Avatar from '../Avatar'
import NotifyModal from '../NotifyModal'
import { getFollowRequests, acceptFollowRequest, declineFollowRequest } from '../../redux/actions/profileAction'
import Search from './Search'

const NavSidebar = () => {
    const { auth, theme, notify } = useSelector(state => state)
    const dispatch = useDispatch()
    const { pathname } = useLocation()

    const [requests, setRequests] = useState([])
    const [showNotify, setShowNotify] = useState(false)
    const [showRequests, setShowRequests] = useState(false)
    const [showMore, setShowMore] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        if (auth.token) {
            dispatch(getFollowRequests(auth.token)).then(res => {
                if (res) setRequests(res)
            })
        }
    }, [auth.token, dispatch])

    const handleAccept = async (requestId) => {
        await dispatch(acceptFollowRequest({requestId, auth}))
        setRequests(requests.filter(item => item._id !== requestId))
    }

    const handleDecline = async (requestId) => {
        await dispatch(declineFollowRequest({requestId, auth}))
        setRequests(requests.filter(item => item._id !== requestId))
    }

    const isActive = (path) => {
        return pathname === path ? 'active' : ''
    }

    return (
        <div className="nav_sidebar d-none d-md-flex flex-column justify-content-between p-3" 
             style={{
                 position: 'fixed',
                 left: 0,
                 top: 0,
                 bottom: 0,
                 width: showSearch ? '320px' : '240px',
                 background: 'var(--bg-card)',
                 borderRight: '1px solid var(--border-color)',
                 zIndex: 1000,
                 transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                 color: 'var(--text-main)'
             }}>
            
            <div className="d-flex flex-column w-100" style={{ gap: '20px' }}>
                {/* Brand Logo */}
                <Link to="/" className="text-decoration-none py-3 px-2 mb-2 d-block">
                    <h3 className="font-weight-bold text-uppercase m-0 logo_text" 
                        style={{ 
                            fontSize: '1.4rem', 
                            letterSpacing: '1px',
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                        Socialize
                    </h3>
                </Link>

                {/* Nav Links */}
                <div className="d-flex flex-column w-100" style={{ gap: '8px' }}>
                    <Link to="/" className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded text-decoration-none ${isActive('/')}`}
                          style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px' }}>
                        <i className={`fas fa-home`} style={{ fontSize: '1.25rem' }} />
                        <span className="link_text">Home</span>
                    </Link>

                    <div className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded cursor-pointer ${showSearch ? 'active' : ''}`}
                         onClick={() => setShowSearch(!showSearch)}
                         style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px', cursor: 'pointer' }}>
                        <i className="fas fa-search" style={{ fontSize: '1.25rem' }} />
                        <span className="link_text">Search</span>
                    </div>

                    <Link to="/discover" className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded text-decoration-none ${isActive('/discover')}`}
                          style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px' }}>
                        <i className="fas fa-compass" style={{ fontSize: '1.25rem' }} />
                        <span className="link_text">Explore</span>
                    </Link>

                    <Link to="/message" className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded text-decoration-none ${isActive('/message')}`}
                          style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px' }}>
                        <div className="position-relative">
                            <i className="fas fa-paper-plane" style={{ fontSize: '1.25rem' }} />
                        </div>
                        <span className="link_text">Messages</span>
                    </Link>

                    {/* Notifications Toggle */}
                    <div className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded position-relative ${showNotify ? 'active' : ''}`}
                         onClick={() => { setShowNotify(!showNotify); setShowRequests(false); }}
                         style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px', cursor: 'pointer' }}>
                        <div className="position-relative">
                            <i className={notify.data.length > 0 ? "fas fa-bell" : "far fa-bell"} style={{ fontSize: '1.25rem' }} />
                            {notify.data.length > 0 && (
                                <span className="position-absolute" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', top: '-2px', right: '-2px' }} />
                            )}
                        </div>
                        <span className="link_text">Notifications</span>

                        {showNotify && (
                            <div className="position-absolute" 
                                 onClick={e => e.stopPropagation()}
                                 style={{ left: '100%', top: 0, minWidth: '350px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 1010, marginLeft: '10px' }}>
                                <NotifyModal />
                            </div>
                        )}
                    </div>

                    {/* Follow Requests Toggle */}
                    <div className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded position-relative ${showRequests ? 'active' : ''}`}
                         onClick={() => { setShowRequests(!showRequests); setShowNotify(false); }}
                         style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px', cursor: 'pointer' }}>
                        <div className="position-relative">
                            <i className="fas fa-user-plus" style={{ fontSize: '1.25rem' }} />
                            {requests.length > 0 && (
                                <span className="position-absolute d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '50%', top: '-6px', right: '-8px' }}>
                                    {requests.length}
                                </span>
                            )}
                        </div>
                        <span className="link_text">Requests</span>

                        {showRequests && (
                            <div className="position-absolute p-3" 
                                 onClick={e => e.stopPropagation()}
                                 style={{ left: '100%', top: 0, minWidth: '320px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 1010, marginLeft: '10px' }}>
                                <h6 className="font-weight-bold mb-2">Follow Requests</h6>
                                <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                                {requests.length === 0 ? (
                                    <div className="text-center my-3 text-muted">No pending requests</div>
                                ) : (
                                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        {requests.map(req => (
                                            <div key={req._id} className="d-flex align-items-center justify-content-between mb-2">
                                                <Link to={`/profile/${req.sender._id}`} className="d-flex align-items-center text-decoration-none" onClick={() => setShowRequests(false)}>
                                                    <Avatar src={req.sender.avatar} size="medium-avatar" />
                                                    <div className="ml-2">
                                                        <strong style={{ color: 'var(--text-main)', fontSize: '0.82rem' }}>@{req.sender.username}</strong>
                                                    </div>
                                                </Link>
                                                <div className="d-flex gap-1" style={{ gap: '4px' }}>
                                                    <button className="btn btn-success btn-sm py-1 px-2" onClick={() => handleAccept(req._id)} style={{ fontSize: '0.7rem' }}>Confirm</button>
                                                    <button className="btn btn-outline-secondary btn-sm py-1 px-2" onClick={() => handleDecline(req._id)} style={{ fontSize: '0.7rem' }}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Create Button */}
                    <div className="nav_sidebar_link d-flex align-items-center py-2 px-3 rounded"
                         onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}
                         style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px', cursor: 'pointer' }}>
                        <i className="far fa-plus-square" style={{ fontSize: '1.25rem' }} />
                        <span className="link_text">Create</span>
                    </div>

                    {/* Profile */}
                    <Link to={`/profile/${auth.user._id}`} className={`nav_sidebar_link d-flex align-items-center py-2 px-3 rounded text-decoration-none ${isActive(`/profile/${auth.user._id}`)}`}
                          style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px' }}>
                        <Avatar src={auth.user.avatar} size="small-avatar" />
                        <span className="link_text">Profile</span>
                    </Link>
                </div>
            </div>

            {/* Slide-out Search Panel */}
            {showSearch && (
                <div className="position-absolute p-3" 
                     style={{ 
                         left: '100%', top: 0, bottom: 0, width: '280px', 
                         background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)',
                         boxShadow: '10px 0 25px rgba(0,0,0,0.05)', zIndex: 990 
                     }}>
                    <h5 className="font-weight-bold mb-3">Search</h5>
                    <Search />
                </div>
            )}

            {/* Bottom More / Options */}
            <div className="position-relative w-100">
                <div className="nav_sidebar_link d-flex align-items-center py-2 px-3 rounded"
                     onClick={() => setShowMore(!showMore)}
                     style={{ color: 'var(--text-main)', transition: 'background 0.2s', gap: '15px', cursor: 'pointer' }}>
                    <i className="fas fa-bars" style={{ fontSize: '1.25rem' }} />
                    <span className="link_text">More</span>
                </div>

                {showMore && (
                    <div className="position-absolute p-2" 
                         style={{ bottom: '100%', left: 0, width: '200px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 1010, marginBottom: '8px' }}>
                        <div className="dropdown-item py-2 px-3 rounded cursor-pointer d-flex align-items-center" 
                             onClick={() => {
                                 dispatch({ type: GLOBALTYPES.THEME, payload: !theme });
                                 setShowMore(false);
                             }}
                             style={{ cursor: 'pointer', color: 'var(--text-main)', gap: '10px' }}>
                            <i className={theme ? "fas fa-sun" : "fas fa-moon"} />
                            <span>{theme ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
                        <Link className="dropdown-item py-2 px-3 rounded text-danger d-flex align-items-center text-decoration-none" to="/"
                              onClick={() => { dispatch(logout()); setShowMore(false); }}
                              style={{ gap: '10px' }}>
                            <i className="fas fa-sign-out-alt" />
                            <span>Logout</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NavSidebar;
