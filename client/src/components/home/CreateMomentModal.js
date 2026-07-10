import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-modal'
import { createMoment } from '../../redux/actions/momentAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

const CreateMomentModal = ({ isOpen, onClose }) => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState('')
    const [caption, setCaption] = useState('')

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return;

        // Size check (30MB limit)
        if (selectedFile.size > 1024 * 1024 * 30) {
            return dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: "The media file size must be less than 30MB." }
            })
        }

        setFile(selectedFile)
        setPreview(URL.createObjectURL(selectedFile))
    }

    const handleRemovePreview = () => {
        setFile(null)
        setPreview('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) return;

        dispatch(createMoment({ file, caption, auth }))
        
        // Reset and close
        setFile(null)
        setPreview('')
        setCaption('')
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="create-moment-modal-content"
            overlayClassName="create-moment-modal-overlay"
            contentLabel="Create Moment Modal"
        >
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0" style={{ fontWeight: 700, color: 'var(--text-main)' }}>Create Moment</h5>
                <span 
                    onClick={onClose} 
                    style={{ cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, color: 'var(--text-muted)' }}
                >
                    &times;
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    {
                        preview ? (
                            <div className="moment-preview-container">
                                {
                                    file.type.startsWith('video') ? (
                                        <video src={preview} className="moment-preview-media" autoPlay muted loop />
                                    ) : (
                                        <img src={preview} alt="preview" className="moment-preview-media" />
                                    )
                                }
                                <span className="moment-remove-preview" onClick={handleRemovePreview}>
                                    &times;
                                </span>
                            </div>
                        ) : (
                            <label className="moment-upload-zone">
                                <i className="fas fa-cloud-upload-alt text-primary mb-2" style={{ fontSize: '2.5rem' }}></i>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Select Image or Video
                                </span>
                                <span className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                                    Max file size: 30MB
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/*,video/*" 
                                    onChange={handleFileChange} 
                                    className="d-none" 
                                />
                            </label>
                        )
                    }
                </div>

                {
                    preview && (
                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                Add Caption (Optional)
                            </label>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Write something overlaying..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                maxLength={80}
                            />
                        </div>
                    )
                }

                <div className="d-flex justify-content-end gap-2" style={{ gap: '10px' }}>
                    <button 
                        type="button" 
                        className="btn btn-light" 
                        onClick={onClose}
                        style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={!file}
                        style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'white' }}
                    >
                        Share to Moments
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default CreateMomentModal
