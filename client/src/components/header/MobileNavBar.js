import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Avatar from '../Avatar'

const MobileNavBar = () => {
    const { auth, notify } = useSelector(state => state)
    const dispatch = useDispatch()
    const { pathname } = useLocation()

    const isActive = (path) => {
        return pathname === path ? 'active' : ''
    }

    return (
        <>
            {/* Mobile Top Header Bar */}
            <div className="mobile_top_header d-flex d-md-none justify-content-between align-items-center px-3 py-2"
                 style={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     right: 0,
                     height: '50px',
                     background: 'var(--bg-card)',
                     borderBottom: '1px solid var(--border-color)',
                     zIndex: 1000,
                     color: 'var(--text-main)'
                 }}>
                <Link to="/" className="text-decoration-none">
                    <h4 className="font-weight-bold text-uppercase m-0" 
                        style={{ 
                            fontSize: '1.25rem',
                            letterSpacing: '1px',
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                        Socialize
                    </h4>
                </Link>

                <div className="d-flex align-items-center" style={{ gap: '15px' }}>
                    <Link to="/message" className="text-decoration-none" style={{ color: 'var(--text-main)' }}>
                        <i className="fas fa-paper-plane" style={{ fontSize: '1.2rem' }} />
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="mobile_bottom_bar d-flex d-md-none justify-content-around align-items-center py-2"
                 style={{
                     position: 'fixed',
                     bottom: 0,
                     left: 0,
                     right: 0,
                     height: '52px',
                     background: 'var(--bg-card)',
                     borderTop: '1px solid var(--border-color)',
                     zIndex: 1000,
                     color: 'var(--text-main)'
                 }}>
                
                <Link to="/" className={`text-decoration-none ${isActive('/')}`} style={{ color: pathname === '/' ? 'var(--primary-color)' : 'var(--text-main)' }}>
                    <i className="fas fa-home" style={{ fontSize: '1.25rem' }} />
                </Link>

                <Link to="/discover" className={`text-decoration-none ${isActive('/discover')}`} style={{ color: pathname === '/discover' ? 'var(--primary-color)' : 'var(--text-main)' }}>
                    <i className="fas fa-search" style={{ fontSize: '1.25rem' }} />
                </Link>

                <div onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}
                     className="cursor-pointer" style={{ color: 'var(--text-main)', cursor: 'pointer' }}>
                    <i className="far fa-plus-square" style={{ fontSize: '1.35rem' }} />
                </div>

                <div className="position-relative" style={{ cursor: 'pointer' }}>
                    <i className={notify.data.length > 0 ? "fas fa-bell" : "far fa-bell"} style={{ fontSize: '1.25rem' }} />
                    {notify.data.length > 0 && (
                        <span className="position-absolute" style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', top: '0', right: '0' }} />
                    )}
                </div>

                <Link to={`/profile/${auth.user._id}`} className="text-decoration-none">
                    <Avatar src={auth.user.avatar} size="medium-avatar" />
                </Link>
            </div>
        </>
    )
}

export default MobileNavBar;
