import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/actions/authAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Avatar from '../Avatar'

const LeftSideBar = () => {
    const { auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()
    const { pathname } = useLocation()

    const isActive = (pn) => {
        if (pn === pathname) return 'active-link'
    }

    return (
        <div className="left_sidebar mt-3">
            {/* User Profile Card */}
            <div className="sidebar_profile_card p-3 mb-4 card" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Link to={`/profile/${auth.user._id}`} className="d-flex align-items-center text-decoration-none">
                    <Avatar src={auth.user.avatar} size="big-avatar" />
                    <div className="ml-3 overflow-hidden">
                        <span className="d-block font-weight-bold text-truncate" style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
                            {auth.user.fullname}
                        </span>
                        <span className="d-block text-truncate" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            @{auth.user.username}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="sidebar_menu card p-2 mb-4" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <ul className="nav flex-column">
                    <li className={`nav-item rounded ${isActive('/saved') ? 'active-link' : ''}`} style={{ margin: '4px 0' }}>
                        <Link className="nav-link d-flex align-items-center py-3 px-4" to="/saved" style={{ color: isActive('/saved') ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: isActive('/saved') ? '700' : '500', gap: '15px', transition: 'var(--transition)' }}>
                            <span className="material-icons" style={{ fontSize: '24px' }}>bookmark</span>
                            <span style={{ fontSize: '1rem' }}>Saved Posts</span>
                        </Link>
                    </li>

                    <li className="nav-item rounded" style={{ margin: '4px 0', cursor: 'pointer' }}
                        onClick={() => dispatch({ type: GLOBALTYPES.THEME, payload: !theme })}>
                        <div className="nav-link d-flex align-items-center py-3 px-4" style={{ color: 'var(--text-main)', fontWeight: '500', gap: '15px' }}>
                            <span className="material-icons">
                                {theme ? 'light_mode' : 'dark_mode'}
                            </span>
                            <span>{theme ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                    </li>

                    <li className="nav-item rounded" style={{ margin: '4px 0', cursor: 'pointer' }}
                        onClick={() => dispatch(logout())}>
                        <div className="nav-link d-flex align-items-center py-3 px-4 text-danger" style={{ fontWeight: '500', gap: '15px' }}>
                            <span className="material-icons">logout</span>
                            <span>Logout</span>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Static Information Footer */}
            <div className="sidebar_footer card p-3 mb-4 text-muted" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <p className="font-weight-bold mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>About Socialize</p>
                <p className="mb-3" style={{ lineHeight: '1.4' }}>
                    Socialize is a modern web platform connecting creators, professionals, and developers globally. Share thoughts, upload rich media, and interact in real time.
                </p>
                <div className="d-flex flex-wrap gap-2 mb-3" style={{ gap: '8px' }}>
                    <span className="text-muted mr-2 hover-underline" style={{ cursor: 'pointer' }}>Terms</span>
                    <span className="text-muted mr-2 hover-underline" style={{ cursor: 'pointer' }}>Privacy</span>
                    <span className="text-muted mr-2 hover-underline" style={{ cursor: 'pointer' }}>Help</span>
                    <span className="text-muted hover-underline" style={{ cursor: 'pointer' }}>Contact</span>
                </div>
                <span className="d-block mt-2" style={{ color: 'var(--text-muted)' }}>&copy; 2026 Socialize Inc.</span>
            </div>
        </div>
    )
}

export default LeftSideBar
