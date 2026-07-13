import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDataAPI, deleteDataAPI } from '../utils/fetchData'
import LeftSideBar from '../components/home/LeftSideBar'
import RightSideBar from '../components/home/RightSideBar'
import dayjs from 'dayjs'
import { GLOBALTYPES } from '../redux/actions/globalTypes'

const MomentsArchive = () => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    
    const [archived, setArchived] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (auth.token) {
            setLoading(true)
            getDataAPI('moments/archive', auth.token)
                .then(res => {
                    setArchived(res.data.archivedMoments || [])
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
        if (window.confirm("Are you sure you want to delete this moment permanently from your archive?")) {
            try {
                dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
                await deleteDataAPI(`moments/${id}`, auth.token)
                setArchived(archived.filter(item => item._id !== id))
                dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Deleted moment!' } })
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
                    <i className="fas fa-history text-primary mr-2" style={{ fontSize: '1.8rem' }}></i>
                    <div>
                        <h2 className="font-weight-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>Moments Archive</h2>
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
                            <i className="fas fa-history text-muted" style={{ fontSize: '4.5rem', marginBottom: '15px' }}></i>
                            <h5>Your archive is empty</h5>
                            <p className="small">Moments will automatically move here 24 hours after posting.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {
                                archived.map(moment => (
                                    <div key={moment._id} className="col-sm-6 col-md-4 mb-4">
                                        <div className="card position-relative overflow-hidden shadow-sm h-100" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', minHeight: '220px' }}>
                                            
                                            {/* Media Rendering */}
                                            {
                                                moment.resource_type === 'video' ? (
                                                    <video src={moment.media} className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '180px' }} controls />
                                                ) : (
                                                    <img src={moment.media} alt="Archive media" className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '180px' }} />
                                                )
                                            }

                                            {/* Overlay Details */}
                                            <div className="p-2" style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                {moment.caption && <p className="mb-1 text-truncate small" title={moment.caption}>{moment.caption}</p>}
                                                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                                                    <span className="d-flex align-items-center">
                                                        <i className="far fa-eye mr-1" style={{ fontSize: '0.85rem' }}></i>
                                                        {moment.views ? moment.views.length : 0} views
                                                    </span>
                                                    <span>{dayjs(moment.createdAt).format('MMM DD, YYYY')}</span>
                                                </div>
                                            </div>

                                            {/* Action Delete Button */}
                                            <button className="btn btn-sm btn-danger position-absolute" 
                                                    style={{ top: '8px', right: '8px', borderRadius: '50%', width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, opacity: 0.85 }} 
                                                    onClick={() => handleDelete(moment._id)}>
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
        </div>
    )
}

export default MomentsArchive
