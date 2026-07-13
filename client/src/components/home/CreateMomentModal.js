import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-modal'
import { createMoment } from '../../redux/actions/momentAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

Modal.setAppElement('#root')

const CreateMomentModal = ({ isOpen, onClose }) => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState('')
    const [caption, setCaption] = useState('')
    const [closeFriendsOnly, setCloseFriendsOnly] = useState(false)

    // Story poll state
    const [hasPoll, setHasPoll] = useState(false)
    const [pollQuestion, setPollQuestion] = useState('')
    const [pollOptions, setPollOptions] = useState(['Yes', 'No'])

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
        setHasPoll(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) return;

        let pollData = undefined;
        if (hasPoll && pollQuestion.trim()) {
            pollData = {
                question: pollQuestion.trim(),
                options: [
                    { text: pollOptions[0].trim() || 'Yes', votes: [] },
                    { text: pollOptions[1].trim() || 'No', votes: [] }
                ]
            }
        }

        dispatch(createMoment({ 
            file, 
            caption, 
            visibility: 'followers', 
            closeFriendsOnly, 
            poll: pollData, 
            auth 
        }))
        
        // Reset and close
        setFile(null)
        setPreview('')
        setCaption('')
        setCloseFriendsOnly(false)
        setHasPoll(false)
        setPollQuestion('')
        setPollOptions(['Yes', 'No'])
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="create-moment-modal-content"
            overlayClassName="create-moment-modal-overlay"
            contentLabel="Create Story Modal"
        >
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0" style={{ fontWeight: 700, color: 'var(--text-main)' }}>Create Story</h5>
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
                        <>
                            <div className="form-group mb-3">
                                <label className="form-label small font-weight-bold">
                                    Add Caption
                                </label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Write a caption..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    maxLength={80}
                                />
                            </div>

                            {/* Story Poll sticker picker */}
                            <div className="form-group mb-3 card p-2" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="small font-weight-bold">Add Interactive Poll sticker</span>
                                    <input 
                                        type="checkbox" 
                                        checked={hasPoll} 
                                        onChange={e => setHasPoll(e.target.checked)} 
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                </div>
                                {hasPoll && (
                                    <div className="d-flex flex-column gap-2" style={{ gap: '8px' }}>
                                        <input 
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Ask a question..."
                                            value={pollQuestion}
                                            onChange={e => setPollQuestion(e.target.value)}
                                            style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                        />
                                        <div className="d-flex gap-2" style={{ gap: '8px' }}>
                                            <input 
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Yes"
                                                value={pollOptions[0]}
                                                onChange={e => setPollOptions([e.target.value, pollOptions[1]])}
                                                style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                            />
                                            <input 
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="No"
                                                value={pollOptions[1]}
                                                onChange={e => setPollOptions([pollOptions[0], e.target.value])}
                                                style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group d-flex align-items-center mb-4">
                                <input 
                                    type="checkbox" 
                                    id="closeFriendsOnly" 
                                    checked={closeFriendsOnly}
                                    onChange={(e) => setCloseFriendsOnly(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="closeFriendsOnly" className="m-0 ml-2 font-weight-bold" style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#00e575' }}>
                                    <i className="fas fa-star mr-1"></i> Share with Close Friends only
                                </label>
                            </div>
                        </>
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
                        style={{ background: '#0095f6', borderColor: '#0095f6', borderRadius: '8px', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}
                    >
                        Share to Story
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default CreateMomentModal
