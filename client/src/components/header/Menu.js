import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/actions/authAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Avatar from '../Avatar'
import NotifyModal from '../NotifyModal'
import { getFollowRequests, acceptFollowRequest, declineFollowRequest } from '../../redux/actions/profileAction'

const Menu = () => {
    const navLinks = [
        { label: 'Home', iconActive: 'fas fa-home', iconInactive: 'fas fa-home', path: '/' },
        { label: 'Message', iconActive: 'fas fa-comments', iconInactive: 'far fa-comments', path: '/message' },
        { label: 'Discover', iconActive: 'fas fa-compass', iconInactive: 'far fa-compass', path: '/discover' }
    ]

    const { auth, theme, notify } = useSelector(state => state)
    const dispatch = useDispatch()
    const { pathname } = useLocation()

    const [requests, setRequests] = useState([])

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

    const isActive = (pn) => {
        if (pn === pathname) return 'active'
    }

    return (
        <div className="menu">
            <ul className="navbar-nav flex-row align-items-center">
                {
                    navLinks.map((link, index) => (
                        <li className={`nav-item px-2 ${isActive(link.path) ? 'active' : ''}`} key={index}>
                            <Link className="nav-link d-flex align-items-center" to={link.path}>
                                <i className={isActive(link.path) ? link.iconActive : link.iconInactive} style={{ fontSize: '1.25rem' }}></i>
                            </Link>
                        </li>
                    ))
                }

                <li className="nav-item dropdown px-2" style={{ opacity: 1 }}>
                    <span className="nav-link position-relative d-flex align-items-center" id="requestsDropdown"
                        role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ cursor: 'pointer' }}>
                        <i className="fas fa-user-plus" style={{ fontSize: '1.25rem' }}></i>
                        {
                            requests.length > 0 &&
                            <span className="position-absolute d-flex align-items-center justify-content-center" style={{
                                width: '16px',
                                height: '16px',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                borderRadius: '50%',
                                top: '0px',
                                right: '0px'
                            }}>{requests.length}</span>
                        }
                    </span>
                    <div className="dropdown-menu p-3" aria-labelledby="requestsDropdown"
                        style={{ transform: 'translateX(75px)', minWidth: '320px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
                        <h5 className="font-weight-bold mb-2" style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Follow Requests</h5>
                        <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                        {
                            requests.length === 0 ? (
                                <div className="text-center my-3 text-muted" style={{ fontSize: '0.9rem' }}>No pending requests</div>
                            ) : (
                                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {
                                        requests.map(req => (
                                            <div key={req._id} className="d-flex align-items-center justify-content-between mb-2">
                                                <Link to={`/profile/${req.sender._id}`} className="d-flex align-items-center text-decoration-none">
                                                    <Avatar src={req.sender.avatar} size="medium-avatar" />
                                                    <div className="mx-2" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                                        <strong style={{ color: 'var(--primary-color)' }}>@{req.sender.username}</strong>
                                                        <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>{req.sender.fullname}</span>
                                                    </div>
                                                </Link>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-success btn-sm p-1 px-2" onClick={() => handleAccept(req._id)} style={{ fontSize: '0.7rem', borderRadius: '4px' }}>
                                                        Confirm
                                                    </button>
                                                    <button className="btn btn-outline-secondary btn-sm p-1 px-2" onClick={() => handleDecline(req._id)} style={{ fontSize: '0.7rem', borderRadius: '4px' }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </li>

                <li className="nav-item dropdown px-2" style={{ opacity: 1 }} >
                    <span className="nav-link position-relative d-flex align-items-center" id="navbarDropdown"
                        role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ cursor: 'pointer' }}>

                        <i className={notify.data.length > 0 ? "fas fa-bell" : "far fa-bell"} style={{ fontSize: '1.25rem' }}></i>

                        {
                            notify.data.length > 0 &&
                            <span className="position-absolute" style={{
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                top: '6px',
                                right: '6px'
                            }} />
                        }

                    </span>

                    <div className="dropdown-menu" aria-labelledby="navbarDropdown"
                        style={{ transform: 'translateX(75px)' }}>
                        <NotifyModal />
                    </div>

                </li>


                <li className="nav-item dropdown px-2" style={{ opacity: 1 }} >
                    <span className="nav-link dropdown-toggle" id="navbarDropdown"
                        role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ cursor: 'pointer' }}>
                        <Avatar src={auth.user.avatar} size="medium-avatar" />
                    </span>

                    <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                        <Link className="dropdown-item" to={`/profile/${auth.user._id}`}>Profile</Link>

                        <label htmlFor="theme" className="dropdown-item"
                            onClick={() => dispatch({
                                type: GLOBALTYPES.THEME, payload: !theme
                            })}>

                            {theme ? 'Light mode' : 'Dark mode'}
                        </label>

                        <div className="dropdown-divider"></div>
                        <Link className="dropdown-item" to="/"
                            onClick={() => dispatch(logout())}>
                            Logout
                        </Link>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Menu
