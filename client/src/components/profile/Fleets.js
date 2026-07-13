import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getFleets, createFleet, deleteFleet } from '../../redux/actions/fleetAction'
import { getDataAPI } from '../../utils/fetchData'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Modal from 'react-modal'
import MomentViewer from '../home/MomentViewer'

Modal.setAppElement('#root')

const Fleets = ({ userId }) => {
    const { auth, fleets } = useSelector(state => state)
    const dispatch = useDispatch()

    const [isMyProfile, setIsMyProfile] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [archiveMoments, setArchiveMoments] = useState([])
    const [selectedMoments, setSelectedMoments] = useState([])
    const [title, setTitle] = useState('')

    const [activeViewerFleet, setActiveViewerFleet] = useState(null)

    useEffect(() => {
        setIsMyProfile(auth.user && auth.user._id === userId)
        if (auth.token) {
            dispatch(getFleets({ userId, token: auth.token }))
        }
    }, [userId, auth, dispatch])

    const handleOpenCreateModal = async () => {
        try {
            const res = await getDataAPI('moments/archive', auth.token)
            setArchiveMoments(res.data.archivedMoments || [])
            setSelectedMoments([])
            setTitle('')
            setShowCreateModal(true)
        } catch (err) {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.message } })
        }
    }

    const toggleSelectMoment = (id) => {
        if (selectedMoments.includes(id)) {
            setSelectedMoments(selectedMoments.filter(item => item !== id))
        } else {
            setSelectedMoments([...selectedMoments, id])
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim()) return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Please enter a title." } });
        if (selectedMoments.length === 0) return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Please select at least one story." } });

        // First selected moment media can serve as the cover image
        const matched = archiveMoments.find(m => m._id === selectedMoments[0])
        const cover = matched ? matched.media : ''

        await dispatch(createFleet({ title: title.trim(), cover, moments: selectedMoments, auth }))
        setShowCreateModal(false)
        dispatch(getFleets({ userId, token: auth.token }))
    }

    const handleDelete = async (colId, e) => {
        e.stopPropagation()
        const confirmed = window.confirm("Are you sure you want to delete this fleet?")
        if (confirmed) {
            await dispatch(deleteFleet({ fleetId: colId, auth }))
            dispatch(getFleets({ userId, token: auth.token }))
        }
    }

    return (
        <div className="fleets-container my-3 px-3">
            <div className="d-flex align-items-center flex-wrap" style={{ gap: '20px' }}>
                {/* Create New Fleet button */}
                {isMyProfile && (
                    <div className="d-flex flex-column align-items-center" onClick={handleOpenCreateModal} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center justify-content-center" 
                             style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                            <i className="fas fa-plus text-muted" style={{ fontSize: '1.25rem' }}></i>
                        </div>
                        <span className="small mt-1 text-muted" style={{ fontWeight: 600 }}>New</span>
                    </div>
                )}

                {/* Fleets List */}
                {fleets.fleets && fleets.fleets.map(hl => (
                    <div 
                        key={hl._id} 
                        className="d-flex flex-column align-items-center position-relative" 
                        onClick={() => setActiveViewerFleet(hl)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', padding: '2px', border: '2px solid var(--border-color)', background: 'var(--bg-card)' }}>
                            {hl.cover ? (
                                <img src={hl.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--border-color)' }} />
                            )}
                        </div>
                        <span className="small mt-1 font-weight-bold" style={{ color: 'var(--text-main)', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {hl.title}
                        </span>
                        
                        {isMyProfile && (
                            <button 
                                className="btn p-0 position-absolute" 
                                onClick={(e) => handleDelete(hl._id, e)}
                                style={{ top: '-5px', right: '-5px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(237,73,86,0.9)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                                title="Delete Fleet"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Fleet Modal */}
            <Modal
                isOpen={showCreateModal}
                onRequestClose={() => setShowCreateModal(false)}
                style={{
                    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 3000 },
                    content: {
                        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
                        marginRight: '-50%', transform: 'translate(-50%, -50%)',
                        width: '350px', borderRadius: '12px', padding: '20px',
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        color: 'var(--text-main)', maxHeight: '500px', overflowY: 'auto'
                    }
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="m-0 font-weight-bold">New Fleet</h6>
                    <button className="btn btn-sm btn-light" onClick={() => setShowCreateModal(false)} style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}>
                        <i className="fas fa-times" />
                    </button>
                </div>

                <form onSubmit={handleCreate}>
                    <div className="form-group mb-3">
                        <label className="small font-weight-bold">Fleet Title</label>
                        <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Summer, Food..."
                            maxLength={15}
                            style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                        />
                    </div>

                    <label className="small font-weight-bold mb-2">Select Archived Stories</label>
                    <div className="archive-list mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {archiveMoments.length === 0 ? (
                            <div className="text-center text-muted small py-3">No archived stories found.</div>
                        ) : (
                            archiveMoments.map(m => {
                                const isSelected = selectedMoments.includes(m._id);
                                return (
                                    <div 
                                        key={m._id} 
                                        className="d-flex align-items-center justify-content-between py-2 border-bottom"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleSelectMoment(m._id)}
                                    >
                                        <div className="d-flex align-items-center">
                                            {m.resource_type === 'video' ? (
                                                <video src={m.media} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                                            ) : (
                                                <img src={m.media} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                                            )}
                                            <span className="small text-muted">{new Date(m.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {isSelected ? (
                                            <i className="fas fa-check-circle text-success" />
                                        ) : (
                                            <i className="far fa-circle text-muted" />
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <button type="submit" className="btn btn-sm btn-primary w-100 font-weight-bold" style={{ borderRadius: '12px', background: '#0095f6', border: 'none' }}>
                        Add to Fleets
                    </button>
                </form>
            </Modal>

            {/* View Fleet Moments (reusing MomentViewer) */}
            {activeViewerFleet && (
                <MomentViewer 
                    userMoments={{
                        user: activeViewerFleet.user,
                        moments: activeViewerFleet.moments
                    }}
                    onClose={() => setActiveViewerFleet(null)}
                />
            )}
        </div>
    )
}

export default Fleets
