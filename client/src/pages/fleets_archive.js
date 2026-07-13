import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getDataAPI, deleteDataAPI } from '../utils/fetchData'
import LeftSideBar from '../components/home/LeftSideBar'
import RightSideBar from '../components/home/RightSideBar'
import Avatar from '../components/Avatar'
import dayjs from 'dayjs'
import { GLOBALTYPES } from '../redux/actions/globalTypes'

const FleetsArchive = () => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    
    const [archived, setArchived] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedViews, setSelectedViews] = useState(null)

    useEffect(() => {
        if (auth.token) {
            setLoading(true)
            getDataAPI('fleets/archive', auth.token)
                .then(res => {
                    setArchived(res.data.archivedFleets || [])
                    setLoading(false)
                })
                .catch(err => {
                    dispatch({
                        type: GLOBALTYPES.ALERT,
                        payload: { error: err.response?.data?.msg || err.message }
                    })
                    setLoading(false)
                })
        }
    }, [auth.token, dispatch])

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this fleet permanently from your archive?")) {
            try {
                dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
                await deleteDataAPI(`fleets/${id}`, auth.token)
                setArchived(archived.filter(item => item._id !== id))
                dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Deleted fleet!' } })
            } catch (err) {
                dispatch({
                    type: GLOBALTYPES.ALERT,
                    payload: { error: err.response?.data?.msg || err.message }
                })
            }
        }
    }

    return (
        <div className="home row mx-0">
            <div className="col-md-3 px-0">
                <LeftSideBar />
            </div>

            <div className="col-md-6 px-4 mt-3">
                <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-archive text-primary mr-2" style={{ fontSize: '1.8rem' }}></i>
                    <div>
                        <h2 className="font-weight-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>Fleets Archive</h2>
                        <small className="text-muted">Your past stories, preserved safely after 24 hours. Only visible to you.</small>
                    </div>
                </div>

                <hr style={{ borderColor: 'var(--border-color)' }} />

                {
                    loading ? (
                        <div className="d-flex justify-content-center align-items-center my-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : archived.length === 0 ? (
                        <div className="text-center my-5 text-muted" style={{ opacity: 0.6 }}>
                            <i className="fas fa-archive text-muted" style={{ fontSize: '4.5rem', marginBottom: '15px' }}></i>
                            <h5>Your archive is empty</h5>
                            <p className="small">Fleets will automatically move here 24 hours after posting.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {
                                archived.map(fleet => (
                                    <div key={fleet._id} className="col-sm-6 col-md-4 mb-4">
                                        <div className="card position-relative overflow-hidden shadow-sm h-100" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', minHeight: '220px' }}>
                                            {/* Action Visibility Indicator Overlay */}
                                            <span className="position-absolute" style={{ top: '8px', left: '8px', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '4px', padding: '4px 6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {fleet.visibility === 'followers' ? <i className="fas fa-users" title="Followers Only"></i> :
                                                 fleet.visibility === 'private' ? <i className="fas fa-lock" title="Only Me"></i> :
                                                 <i className="fas fa-globe" title="Public"></i>}
                                                <span style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{fleet.visibility}</span>
                                            </span>

                                            {/* Media Rendering */}
                                            {
                                                fleet.resource_type === 'video' ? (
                                                    <video src={fleet.media} className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '180px' }} controls />
                                                ) : (
                                                    <img src={fleet.media} alt="Archive media" className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '180px' }} />
                                                )
                                            }

                                            {/* Overlay Details */}
                                            <div className="p-2" style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                {fleet.caption && <p className="mb-1 text-truncate small" title={fleet.caption}>{fleet.caption}</p>}
                                                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                                                    <span className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setSelectedViews(fleet.views || [])} title="Click to view viewers">
                                                        <i className="far fa-eye mr-1" style={{ fontSize: '0.85rem' }}></i>
                                                        {fleet.views ? fleet.views.length : 0} views
                                                    </span>
                                                    <span>{dayjs(fleet.createdAt).format('MMM DD, YYYY')}</span>
                                                </div>
                                            </div>

                                            {/* Action Delete Button */}
                                            <button className="btn btn-sm btn-danger position-absolute" 
                                                    style={{ top: '8px', right: '8px', borderRadius: '50%', width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, opacity: 0.85 }} 
                                                    onClick={() => handleDelete(fleet._id)}>
                                                <i className="fas fa-trash-alt" style={{ fontSize: '0.9rem' }}></i>
                                            </button>

                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>

            <div className="col-md-3 px-0">
                <RightSideBar />
            </div>

            {/* Viewers modal */}
            {selectedViews && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setSelectedViews(null)}>
                    <div className="card p-3" style={{
                        width: '320px',
                        maxHeight: '400px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="font-weight-bold mb-0" style={{ color: 'var(--text-main)' }}>Viewers ({selectedViews.length})</h6>
                            <button className="btn btn-sm btn-light d-flex align-items-center justify-content-center" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }} onClick={() => setSelectedViews(null)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
                        <div style={{ overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }} className="notify-list-container">
                            {selectedViews.length === 0 ? (
                                <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>No views yet</div>
                            ) : (
                                selectedViews.map(viewer => (
                                    <div key={viewer._id || viewer} className="d-flex align-items-center mb-2 justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <Avatar src={viewer.avatar} size="medium-avatar" />
                                            <div className="ml-2">
                                                <strong className="d-block" style={{ fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'left' }}>@{viewer.username || 'user'}</strong>
                                                <span className="small text-muted" style={{ display: 'block', fontSize: '0.75rem', textAlign: 'left' }}>{viewer.fullname || ''}</span>
                                            </div>
                                        </div>
                                        <Link to={`/profile/${viewer._id || viewer}`} className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => setSelectedViews(null)}>
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FleetsArchive
