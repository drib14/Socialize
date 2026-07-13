import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getCollections, addToCollection, createCollection } from '../../redux/actions/savedCollectionAction'
import Modal from 'react-modal'

Modal.setAppElement('#root')

const SaveToCollectionModal = ({ isOpen, onClose, postId }) => {
    const { auth, savedCollections } = useSelector(state => state)
    const dispatch = useDispatch()
    const [newColName, setNewColName] = useState('')
    const [showCreate, setShowCreate] = useState(false)

    useEffect(() => {
        if (isOpen && auth.token) {
            dispatch(getCollections(auth.token))
        }
    }, [isOpen, auth.token, dispatch])

    const handleSave = (collectionId) => {
        dispatch(addToCollection({ collectionId, postId, auth }))
        onClose()
    }

    const handleCreateAndSave = async (e) => {
        e.preventDefault()
        if (!newColName.trim()) return;
        
        await dispatch(createCollection({ name: newColName.trim(), auth }))
        setNewColName('')
        setShowCreate(false)
        
        // Refresh collections
        dispatch(getCollections(auth.token))
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 3000
                },
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '340px',
                    borderRadius: '12px',
                    padding: '20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }
            }}
        >
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="m-0 font-weight-bold">Save to Collection</h6>
                <button className="btn btn-sm btn-light" onClick={onClose} style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}>
                    <i className="fas fa-times" />
                </button>
            </div>

            <div className="collection-list mb-3">
                {savedCollections.collections && savedCollections.collections.map(col => {
                    const hasPost = col.posts && col.posts.includes(postId);
                    return (
                        <div 
                            key={col._id} 
                            className="d-flex align-items-center justify-content-between py-2 border-bottom"
                            style={{ cursor: 'pointer' }}
                            onClick={() => !hasPost && handleSave(col._id)}
                        >
                            <div className="d-flex align-items-center">
                                {col.cover ? (
                                    <img src={col.cover} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', background: 'var(--border-color)', borderRadius: '4px', marginRight: '10px' }} />
                                )}
                                <span>{col.name}</span>
                            </div>
                            {hasPost ? (
                                <i className="fas fa-check-circle text-success" />
                            ) : (
                                <i className="far fa-circle text-muted" />
                            )}
                        </div>
                    )
                })}
            </div>

            {showCreate ? (
                <form onSubmit={handleCreateAndSave} className="d-flex gap-2">
                    <input 
                        type="text" 
                        placeholder="New collection name..." 
                        value={newColName} 
                        onChange={e => setNewColName(e.target.value)}
                        className="form-control form-control-sm mr-2"
                        style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                    />
                    <button type="submit" className="btn btn-sm btn-primary" style={{ borderRadius: '12px', background: '#0095f6', border: 'none' }}>
                        Create
                    </button>
                </form>
            ) : (
                <button className="btn btn-sm btn-outline-primary w-100 mt-2" onClick={() => setShowCreate(true)} style={{ borderRadius: '12px' }}>
                    + New Collection
                </button>
            )}
        </Modal>
    )
}

export default SaveToCollectionModal
