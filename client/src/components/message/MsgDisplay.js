import React, { useState, useRef, useEffect } from 'react'
import Avatar from '../Avatar'
import { useSelector, useDispatch } from 'react-redux'
import { deleteMessages, updateMessage, reactMessage, addMessage } from '../../redux/actions/messageAction'
import Times from './Times'
import { customConfirm } from '../../utils/customAlert'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Modal from 'react-modal'

Modal.setAppElement('#root')

// Customized Audio Bubble Component
const CustomAudioPlayer = ({ url }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        audioRef.current = new Audio(url);
        const audio = audioRef.current;
        
        const setAudioData = () => {
            setDuration(audio.duration);
        };
        const setAudioTime = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        if (audio.readyState >= 1) {
            setDuration(audio.duration);
        }

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [url]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.log(e));
            setIsPlaying(true);
        }
    };

    const handleProgressChange = (e) => {
        if (!audioRef.current || !duration) return;
        const newTime = (e.target.value / 100) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(e.target.value);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="custom_audio_player p-2 mb-2 d-flex align-items-center" 
             style={{ 
                 background: 'var(--bg-body)', 
                 borderRadius: '20px', 
                 minWidth: '250px', 
                 gap: '12px', 
                 border: '1px solid var(--border-color)',
                 boxShadow: 'var(--shadow-sm)'
             }}>
            <button onClick={togglePlay} className="btn d-flex align-items-center justify-content-center"
                    type="button"
                    style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'var(--primary-color)', 
                        color: 'white', 
                        border: 'none',
                        boxShadow: 'var(--shadow-sm)',
                        padding: 0
                    }}>
                <span className="material-icons text-white" style={{ fontSize: '1.4rem' }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>
            
            <div className="d-flex flex-column" style={{ flex: 1, gap: '2px', minWidth: '130px' }}>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={handleProgressChange}
                    style={{ 
                        width: '100%', 
                        height: '4px', 
                        borderRadius: '2px', 
                        background: 'var(--border-color)', 
                        outline: 'none',
                        cursor: 'pointer'
                    }} 
                />
                <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <span className="material-icons text-muted mr-1" style={{ fontSize: '1.20rem' }}>mic</span>
        </div>
    );
};

// Customized Document Bubble Component
const CustomFileBubble = ({ url }) => {
    const fileName = typeof url === 'string' ? url.substring(url.lastIndexOf('/') + 1) : "attachment.file";
    const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.') + 1).toUpperCase() : 'FILE';
    const displayName = fileName.length > 18 ? fileName.substring(0, 10) + '...' + fileName.substring(fileName.lastIndexOf('.')) : fileName;

    return (
        <div className="custom_file_bubble d-flex align-items-center p-2 mb-2" 
             style={{ 
                 background: 'var(--bg-body)', 
                 border: '1px solid var(--border-color)', 
                 borderRadius: '16px', 
                 minWidth: '240px', 
                 maxWidth: '280px',
                 gap: '12px', 
                 boxShadow: 'var(--shadow-sm)'
             }}>
            <div className="d-flex align-items-center justify-content-center text-white" 
                 style={{ 
                     width: '42px', 
                     height: '42px', 
                     borderRadius: '12px', 
                     background: 'var(--primary-color)', 
                     fontWeight: 'bold',
                     fontSize: '0.7rem'
                 }}>
                {ext.substring(0, 4)}
            </div>
            <div className="text-left overflow-hidden" style={{ flex: 1 }}>
                <div className="font-weight-bold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-main)' }} title={fileName}>
                    {displayName}
                </div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Document File</small>
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center justify-content-center mr-1" 
               style={{ 
                   width: '30px', 
                   height: '30px', 
                   borderRadius: '50%', 
                   background: 'var(--bg-card)', 
                   boxShadow: 'var(--shadow-sm)',
                   color: 'var(--primary-color)',
                   textDecoration: 'none'
               }}
               title="Download file">
                <span className="material-icons" style={{ fontSize: '1.1rem' }}>download</span>
            </a>
        </div>
    );
};

const MsgDisplay = ({user, msg, theme, data, setOnReply}) => {
    const { auth, socket, message } = useSelector(state => state)
    const dispatch = useDispatch()

    const [isEdit, setIsEdit] = useState(false)
    const [editText, setEditText] = useState(msg.text || "")

    // Hover UI menu states
    const [showDropdown, setShowDropdown] = useState(false)
    const [showReactions, setShowReactions] = useState(false)
    const [showForwardModal, setShowForwardModal] = useState(false)

    const handleDeleteMessages = async () => {
        if(!data) return;
        
        const confirmed = await customConfirm('Do you want to delete this message?')
        if(confirmed){
            dispatch(deleteMessages({msg, data, auth}))
        }
    }

    const handleReactMessage = (emoji) => {
        dispatch(reactMessage({ msg, emoji, auth, socket }))
    }

    const handleUpdateMessage = () => {
        if(!editText.trim()) return;
        dispatch(updateMessage({ msg, text: editText, auth, socket }))
        setIsEdit(false)
    }

    const handleForwardToUser = async (targetUser) => {
        const forwardMsg = {
            sender: auth.user._id,
            recipient: targetUser._id,
            text: msg.text || "",
            media: msg.media || [],
            createdAt: new Date().toISOString()
        }
        
        await dispatch(addMessage({ msg: forwardMsg, auth, socket }))
        setShowForwardModal(false)
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: `Message forwarded to ${targetUser.fullname}` } })
    }

    const renderMediaOrFile = (item, index) => {
        if (!item || !item.url) return null;
        
        const url = item.url;
        const mimeType = item.resource_type || '';

        const isAudio = typeof mimeType === 'string' && mimeType.startsWith('audio') || (
            typeof url === 'string' && (
                url.match(/\.(mp3|wav|ogg|m4a|aac)/i) || 
                url.includes('voice_')
            )
        );

        const isVideo = typeof url === 'string' && !isAudio && (
            (typeof mimeType === 'string' && mimeType.startsWith('video')) ||
            url.match(/\.(mp4|webm|ogv|mov|quicktime)/i) || 
            url.includes('/video/upload/') || 
            url.match(/video/i)
        );

        const isImage = typeof url === 'string' && !isAudio && !isVideo && (
            (typeof mimeType === 'string' && mimeType.startsWith('image')) ||
            url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || 
            url.includes('/image/upload/')
        );

        if (isImage) {
            return (
                <div key={index} className="chat_media_container position-relative mb-2" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '280px', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={url} alt="chat attachment" className="img-thumbnail p-0 border-0" style={{ width: '100%', height: 'auto', display: 'block', transition: 'var(--transition)' }} />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="chat_media_download position-absolute d-flex align-items-center justify-content-center" 
                       style={{ top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.85)', color: 'var(--text-main)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', textDecoration: 'none' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>file_download</span>
                    </a>
                </div>
            );
        }

        if (isVideo) {
            return (
                <div key={index} className="chat_media_container position-relative mb-2" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '320px', boxShadow: 'var(--shadow-sm)' }}>
                    <video src={url} controls className="w-100" style={{ display: 'block', borderRadius: 'var(--radius-md)' }} />
                </div>
            );
        }

        if (isAudio) {
            return <CustomAudioPlayer key={index} url={url} />;
        }

        // Generic File
        return <CustomFileBubble key={index} url={url} />;
    };

    const isOwn = msg.sender === auth.user._id;

    return (
        <>
            <div className="chat_title">
                <Avatar src={user.avatar} size="small-avatar" />
                <span>{user.fullname}</span>
            </div>

            <div className="you_content" style={{ position: 'relative' }}>
                {/* Floating Actions on Hover - exactly 3 icons placed at the side */}
                <div className="message_action_bar position-absolute d-flex align-items-center" 
                     style={{ 
                         top: '50%', 
                         transform: 'translateY(-50%)',
                         right: isOwn ? 'calc(100% + 8px)' : 'auto', 
                         left: !isOwn ? 'calc(100% + 8px)' : 'auto', 
                         background: 'var(--bg-card)', 
                         border: '1px solid var(--border-color)', 
                         borderRadius: '16px', 
                         padding: '2px 8px', 
                         zIndex: 10,
                         gap: '8px',
                         boxShadow: 'var(--shadow-sm)',
                         opacity: 0,
                         transition: 'opacity 0.2s ease-in-out'
                     }}>
                     
                     {/* 1. Forward Icon */}
                     <span className="material-icons text-muted" style={{ fontSize: '1.2rem', cursor: 'pointer' }} 
                           onClick={() => setShowForwardModal(true)} title="Forward Message">
                         forward
                     </span>

                     {/* 2. Emoji Picker icon */}
                     <div className="position-relative d-flex align-items-center">
                         <span className="material-icons text-muted" style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                               onClick={() => {
                                   setShowReactions(!showReactions);
                                   setShowDropdown(false);
                               }} title="React to message">
                             add_reaction
                         </span>
                         {
                             showReactions && (
                                 <div className="position-absolute d-flex flex-wrap p-2" 
                                      style={{ 
                                          bottom: '28px', 
                                          right: isOwn ? '0' : 'auto',
                                          left: !isOwn ? '0' : 'auto', 
                                          background: 'var(--bg-card)', 
                                          border: '1px solid var(--border-color)', 
                                          borderRadius: '8px', 
                                          gap: '6px', 
                                          minWidth: '180px', 
                                          zIndex: 100,
                                          boxShadow: 'var(--shadow-md)'
                                      }}>
                                      {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '🎉', '💯', '👀', '🤔', '💩', '🚀', '💡'].map(emoji => (
                                          <span key={emoji} style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                                onClick={() => {
                                                    handleReactMessage(emoji);
                                                    setShowReactions(false);
                                                }}
                                                className="quick_emoji_btn">
                                              {emoji}
                                          </span>
                                      ))}
                                 </div>
                             )
                         }
                     </div>

                     {/* 3. 3-Dots Dropdown with CRUD */}
                     <div className="position-relative d-flex align-items-center">
                         <span className="material-icons text-muted" style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                               onClick={() => {
                                   setShowDropdown(!showDropdown);
                                   setShowReactions(false);
                               }} title="Message actions">
                             more_vert
                         </span>
                         {
                             showDropdown && (
                                 <div className="position-absolute d-flex flex-column py-1" 
                                      style={{ 
                                          bottom: '28px', 
                                          right: isOwn ? '0' : 'auto',
                                          left: !isOwn ? '0' : 'auto', 
                                          background: 'var(--bg-card)', 
                                          border: '1px solid var(--border-color)', 
                                          borderRadius: '8px', 
                                          minWidth: '110px', 
                                          zIndex: 100,
                                          boxShadow: 'var(--shadow-md)',
                                          textAlign: 'left'
                                      }}>
                                      <div className="dropdown-item py-1 px-3 d-flex align-items-center" style={{ cursor: 'pointer', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}
                                           onClick={() => {
                                               setOnReply && setOnReply(msg);
                                               setShowDropdown(false);
                                           }}>
                                          <span className="material-icons" style={{ fontSize: '1rem' }}>reply</span> Reply
                                      </div>
                                      {
                                          isOwn && (
                                              <>
                                                  <div className="dropdown-item py-1 px-3 d-flex align-items-center" style={{ cursor: 'pointer', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}
                                                       onClick={() => {
                                                           setIsEdit(true);
                                                           setShowDropdown(false);
                                                       }}>
                                                      <span className="material-icons" style={{ fontSize: '1rem' }}>edit</span> Edit
                                                  </div>
                                                  <div className="dropdown-item py-1 px-3 d-flex align-items-center text-danger" style={{ cursor: 'pointer', gap: '8px', fontSize: '0.85rem' }}
                                                       onClick={() => {
                                                           handleDeleteMessages();
                                                           setShowDropdown(false);
                                                       }}>
                                                      <span className="material-icons" style={{ fontSize: '1rem' }}>delete</span> Delete
                                                  </div>
                                              </>
                                          )
                                      }
                                 </div>
                             )
                         }
                     </div>
                </div>

                <div>
                    {/* Quoted Message Quote Bubble */}
                    {
                        msg.replyTo && (
                            <div className="quoted_message mb-2 p-2" 
                                 style={{ 
                                     background: 'rgba(0, 0, 0, 0.08)', 
                                     borderLeft: '3px solid var(--primary-color)', 
                                     borderRadius: '4px',
                                     fontSize: '0.85rem',
                                     color: 'var(--text-secondary)',
                                     textAlign: 'left'
                                 }}>
                                 <strong className="d-block" style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                                     {msg.replyTo.sender === auth.user._id ? 'You' : (user._id === msg.replyTo.sender ? user.fullname : 'Other')}
                                 </strong>
                                 <span className="text-truncate d-block">
                                     {msg.replyTo.text || 'Attachment'}
                                 </span>
                            </div>
                        )
                    }

                    {/* Chat Text Message Box (Edit vs View) */}
                    {
                        isEdit ? (
                            <div className="d-flex flex-column" style={{ gap: '8px', minWidth: '220px', padding: '8px' }}>
                                <input 
                                    type="text" 
                                    value={editText} 
                                    onChange={e => setEditText(e.target.value)} 
                                    className="form-control form-control-sm"
                                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', outline: 'none' }}
                                    autoFocus
                                />
                                <div className="d-flex justify-content-end" style={{ gap: '6px' }}>
                                    <button className="btn btn-sm btn-secondary" style={{ padding: '4px 8px !important', fontSize: '0.8rem !important' }} onClick={() => setIsEdit(false)}>Cancel</button>
                                    <button className="btn btn-sm btn-primary" style={{ padding: '4px 8px !important', fontSize: '0.8rem !important' }} onClick={handleUpdateMessage}>Save</button>
                                </div>
                            </div>
                        ) : (
                            msg.text && 
                            <div className="chat_text">
                                {msg.text}
                            </div>
                        )
                    }
                    {
                        msg.media.map((item, index) => renderMediaOrFile(item, index))
                    }
                </div>
            
                {
                    msg.call &&
                    <button className="btn d-flex align-items-center py-3"
                    style={{background: '#eee', borderRadius: '10px'}}>

                        <span className="material-icons font-weight-bold mr-1"
                        style={{ 
                            fontSize: '2.5rem', color: msg.call.times === 0 ? '#2b8a3e' : 'green'
                        }}>
                            {
                                msg.call.times === 0
                                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                                : msg.call.video ? 'video_camera_front' : 'call'
                            }
                        </span>

                        <div className="text-left">
                            <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
                            <small>
                                {
                                    msg.call.times > 0 
                                    ? <Times total={msg.call.times} />
                                    : new Date(msg.createdAt).toLocaleTimeString()
                                }
                            </small>
                        </div>

                    </button>
                }

                {/* Reaction Badges overlay */}
                {
                    msg.reactions && msg.reactions.length > 0 && (
                        <div className="position-absolute d-flex align-items-center" style={{
                            bottom: '-12px',
                            right: msg.sender === auth.user._id ? '10px' : 'auto',
                            left: msg.sender !== auth.user._id ? '10px' : 'auto',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '2px 6px',
                            gap: '4px',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: '0.75rem',
                            zIndex: 5
                        }}>
                            {(() => {
                                const counts = {};
                                msg.reactions.forEach(r => {
                                    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
                                });
                                return Object.keys(counts).map(emoji => (
                                    <span key={emoji} title={`${counts[emoji]} reaction(s)`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                        {emoji} <small style={{ color: 'var(--text-secondary)' }}>{counts[emoji]}</small>
                                    </span>
                                ));
                            })()}
                        </div>
                    )
                }
            
            </div>

            <div className="chat_time">
                {new Date(msg.createdAt).toLocaleString()}
            </div>

            {/* Forward Message Modal */}
            {
                showForwardModal && (
                    <Modal
                        isOpen={showForwardModal}
                        onRequestClose={() => setShowForwardModal(false)}
                        className="status_modal_content"
                        overlayClassName="status_modal_overlay"
                        contentLabel="Forward Message"
                        style={{
                            content: {
                                maxWidth: '400px',
                                margin: 'auto',
                                maxHeight: '80vh',
                                overflowY: 'auto'
                            }
                        }}
                    >
                        <div className="status_header">
                            <h5 className="m-0">Forward Message</h5>
                            <span onClick={() => setShowForwardModal(false)} style={{ cursor: 'pointer' }}>&times;</span>
                        </div>
                        <div className="status_body p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {message.users.map(u => (
                                <div key={u._id} className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                                        <Avatar src={u.avatar} size="big-avatar" />
                                        <div>
                                            <div className="font-weight-bold" style={{ color: 'var(--text-main)' }}>{u.fullname}</div>
                                            <small className="text-muted">@{u.username}</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-clay text-primary px-3" 
                                            style={{ borderRadius: '16px' }}
                                            onClick={() => handleForwardToUser(u)}>
                                        Send
                                    </button>
                                </div>
                            ))}
                            {
                                message.users.length === 0 && (
                                    <div className="text-center text-muted py-3">No active chats found to forward message.</div>
                                )
                            }
                        </div>
                    </Modal>
                )
            }
        </>
    )
}

export default MsgDisplay
