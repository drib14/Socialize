import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Modal from 'react-modal'
import Avatar from '../Avatar'
import { postDataAPI } from '../../utils/fetchData'
import { MESS_TYPES } from '../../redux/actions/messageAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

Modal.setAppElement('#root')

const GroupDMModal = ({ isOpen, onClose }) => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [groupName, setGroupName] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const following = auth.user.following || []
    const filteredFollowing = following.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleSelectUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(item => item !== id))
        } else {
            setSelectedUsers([...selectedUsers, id])
        }
    }

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        if (selectedUsers.length === 0) return;

        try {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
            
            // Create group DM conversation on backend
            const res = await postDataAPI('messages', {
                sender: auth.user._id,
                isGroup: true,
                groupRecipients: selectedUsers,
                groupName: groupName.trim() || 'Group Chat',
                text: 'initialized group chat',
                media: []
            }, auth.token)

            dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })

            if (res.data && res.data.conversation) {
                const newCol = res.data.conversation;
                // Add conversation user item state so it appears in LeftSide list
                dispatch({
                    type: MESS_TYPES.ADD_USER,
                    payload: {
                        _id: newCol._id,
                        username: newCol.name,
                        fullname: 'Group Conversation',
                        avatar: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png',
                        isGroup: true,
                        recipients: newCol.recipients,
                        text: 'Group initialized'
                    }
                })

                onClose()
                navigate(`/message/${newCol._id}`)
            }
        } catch (err) {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg || err.message } })
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
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
                <h6 className="m-0 font-weight-bold">Create Group Chat</h6>
                <button className="btn btn-sm btn-light" onClick={onClose} style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}>
                    <i className="fas fa-times" />
                </button>
            </div>

            <form onSubmit={handleCreateGroup}>
                <div className="form-group mb-3">
                    <label className="small font-weight-bold">Group Name (Optional)</label>
                    <input 
                        type="text" 
                        className="form-control form-control-sm"
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        placeholder="e.g. Squad, Design Team..."
                        style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="small font-weight-bold">Add Members</label>
                    <input 
                        type="text" 
                        className="form-control form-control-sm mb-2"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search contacts..."
                        style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    />

                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredFollowing.map(user => {
                            const isChecked = selectedUsers.includes(user._id);
                            return (
                                <div 
                                    key={user._id} 
                                    className="d-flex align-items-center justify-content-between py-2 border-bottom"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSelectUser(user._id)}
                                >
                                    <div className="d-flex align-items-center">
                                        <Avatar src={user.avatar} size="small-avatar" />
                                        <span className="small ml-2 font-weight-bold">@{user.username}</span>
                                    </div>
                                    {isChecked ? (
                                        <i className="fas fa-check-circle text-primary" style={{ fontSize: '1.1rem' }} />
                                    ) : (
                                        <i className="far fa-circle text-muted" style={{ fontSize: '1.1rem' }} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary btn-sm w-100 font-weight-bold" 
                    disabled={selectedUsers.length === 0}
                    style={{ borderRadius: '8px', background: '#0095f6', border: 'none' }}
                >
                    Create Group Chat
                </button>
            </form>
        </Modal>
    )
}

export default GroupDMModal
