import React, { useState, useRef, useEffect } from 'react'
import Avatar from '../Avatar'
import { useSelector, useDispatch } from 'react-redux'
import { deleteMessages, updateMessage, reactMessage, addMessage } from '../../redux/actions/messageAction'
import Times from './Times'
import { customConfirm } from '../../utils/customAlert'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Modal from 'react-modal'
import { renderTextWithIcons } from '../../utils/iconParser'

Modal.setAppElement('#root')

const getReactionColor = (iconName) => {
    if (iconName === 'thumb_up') return '#1877f2'; // FB Blue
    if (iconName === 'favorite') return '#e0245e'; // Heart Red
    if (iconName === 'sentiment_very_satisfied') return '#f5c33b'; // Laugh Yellow
    if (iconName === 'sentiment_very_dissatisfied') return '#f5c33b'; // Sad Yellow
    if (iconName === 'celebration') return '#ff9f43'; // Celebration Orange
    if (iconName === 'local_fire_department') return '#ff4757'; // Fire Red
    if (iconName === 'lightbulb') return '#eccc68'; // Idea Gold
    return 'var(--text-secondary)';
};

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
                 borderRadius: '24px',
                 minWidth: '280px',
                 maxWidth: '320px',
                 gap: '12px', 
                 border: '1px solid var(--border-color)',
                 boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
             }}>

            {/* Play/Pause Button */}
            <button onClick={togglePlay} className="btn d-flex align-items-center justify-content-center flex-shrink-0"
                    type="button"
                    style={{ 
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%', 
                        background: isPlaying ? 'var(--primary-color)' : '#f0f2f5',
                        color: isPlaying ? 'white' : 'var(--primary-color)',
                        border: 'none',
                        boxShadow: isPlaying ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                        transition: 'all 0.2s ease',
                        padding: 0
                    }}>
                <span className="material-icons" style={{ fontSize: '1.8rem', marginLeft: !isPlaying ? '2px' : '0' }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>
            
            {/* Waveform Progress / Timer */}
            <div className="d-flex flex-column justify-content-center" style={{ flex: 1, gap: '4px' }}>
                <div className="d-flex align-items-center" style={{ position: 'relative', height: '24px' }}>
                    {/* Simulated Waveform Background */}
                    <div className="d-flex align-items-center justify-content-between w-100 h-100 px-1" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.3 }}>
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} style={{
                                width: '3px',
                                height: `${Math.max(10, Math.sin(i) * 10 + 14)}px`,
                                background: 'var(--primary-color)',
                                borderRadius: '2px',
                                transition: 'height 0.2s ease'
                            }} />
                        ))}
                    </div>

                    {/* Simulated Waveform Foreground (Played) */}
                    <div className="d-flex align-items-center justify-content-between h-100 px-1" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'hidden', width: `${progress}%`, zIndex: 1 }}>
                        <div className="d-flex align-items-center justify-content-between w-100" style={{ minWidth: '100%', position: 'absolute', top: 0, left: 0, padding: '0 4px', height: '100%' }}>
                            {Array.from({ length: 25 }).map((_, i) => (
                                <div key={i} style={{
                                    width: '3px',
                                    height: `${Math.max(10, Math.sin(i) * 10 + 14)}px`,
                                    background: 'var(--primary-color)',
                                    borderRadius: '2px'
                                }} />
                            ))}
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleProgressChange}
                        style={{
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 2,
                            position: 'relative'
                        }}
                    />
                </div>

                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <span>{formatTime(currentTime)}</span>
                    <div className="d-flex align-items-center gap-1">
                        {isPlaying && <span className="material-icons" style={{ fontSize: '1rem', color: '#2ecc71' }}>graphic_eq</span>}
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Profile Avatar placeholder or Icon */}
            <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '36px', height: '36px', background: 'var(--bg-input)' }}>
                <span className="material-icons text-muted" style={{ fontSize: '1.2rem' }}>mic</span>
            </div>
        </div>
    );
};

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Customized Document Bubble Component
const CustomFileBubble = ({ item }) => {
    const url = item.url || '';
    const size = item.size ? formatBytes(item.size) : '';
    const mimeType = item.resource_type || '';
    
    let ext = 'FILE';
    const fileName = typeof url === 'string' ? url.substring(url.lastIndexOf('/') + 1) : "attachment.file";
    if (fileName.includes('.')) {
        ext = fileName.substring(fileName.lastIndexOf('.') + 1).toUpperCase();
    } else if (typeof mimeType === 'string' && mimeType.includes('/')) {
        const sub = mimeType.substring(mimeType.lastIndexOf('/') + 1).toUpperCase();
        if (sub.includes('WORD') || sub.includes('DOCUMENT')) ext = 'DOCX';
        else if (sub.includes('EXCEL') || sub.includes('SHEET')) ext = 'XLSX';
        else if (sub.includes('PRESENTATION') || sub.includes('POWERPOINT')) ext = 'PPTX';
        else if (sub.includes('PLAIN')) ext = 'TXT';
        else ext = sub;
    }
    
    const displayName = fileName.length > 18 ? fileName.substring(0, 10) + '...' + (fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '') : fileName;

    let bgCol = 'var(--primary-color)';
    let iconName = 'insert_drive_file';

    if (ext === 'PDF') {
        bgCol = '#e74c3c';
        iconName = 'picture_as_pdf';
    } else if (ext === 'DOC' || ext === 'DOCX') {
        bgCol = '#3498db';
        iconName = 'description';
    } else if (ext === 'XLS' || ext === 'XLSX' || ext === 'CSV') {
        bgCol = '#2ecc71';
        iconName = 'table_view';
    } else if (ext === 'PPT' || ext === 'PPTX') {
        bgCol = '#f39c12';
        iconName = 'slideshow';
    } else if (ext === 'TXT') {
        bgCol = '#95a5a6';
        iconName = 'article';
    }

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
                     background: bgCol,
                     fontWeight: 'bold',
                     fontSize: '0.7rem',
                     flexDirection: 'column'
                 }}>
                 <span className="material-icons" style={{ fontSize: '1.2rem' }}>{iconName}</span>
                 <span style={{ fontSize: '0.5rem', marginTop: '-2px' }}>{ext.substring(0, 4)}</span>
            </div>
            <div className="text-left overflow-hidden" style={{ flex: 1 }}>
                <div className="font-weight-bold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-main)' }} title={fileName}>
                    {displayName}
                </div>
                <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.7rem', gap: '4px' }}>
                    <span>Document File</span>
                    {size && (
                        <>
                            <span>•</span>
                            <span>{size}</span>
                        </>
                    )}
                </div>
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center justify-content-center mr-1" 
               style={{ 
                   width: '30px', 
                   height: '30px', 
                   borderRadius: '50%', 
                   background: 'var(--bg-card)', 
                   boxShadow: 'var(--shadow-sm)',
                   color: bgCol,
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

    const isOwn = msg.sender === auth.user._id

    const getBubbleStyle = () => {
        if (!data || data.length === 0) return {};
        const msgIndex = data.findIndex(m => m._id === msg._id);
        if (msgIndex === -1) return {};

        const prevMsg = msgIndex > 0 ? data[msgIndex - 1] : null;
        const isConsecutivePrev = prevMsg && prevMsg.sender === msg.sender;

        const nextMsg = msgIndex < data.length - 1 ? data[msgIndex + 1] : null;
        const isConsecutiveNext = nextMsg && nextMsg.sender === msg.sender;

        if (isOwn) {
            return {
                borderRadius: `${isConsecutivePrev ? '4px' : '16px'} 16px ${isConsecutiveNext ? '4px' : '16px'} 16px`
            };
        } else {
            return {
                borderRadius: `16px ${isConsecutivePrev ? '4px' : '16px'} 16px ${isConsecutiveNext ? '4px' : '16px'}`
            };
        }
    };

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
        
        const url = typeof item.url === 'string' ? item.url : '';
        const mimeType = typeof item.resource_type === 'string' ? item.resource_type.toLowerCase() : '';

        // --- 1. DOCUMENT detection (checked FIRST to prevent Cloudinary /image/upload/ false positives) ---
        const docExtensions = /\.(pdf|docx?|xlsx?|csv|pptx?|txt|rtf|odt|ods|odp|pages|numbers|key|zip|rar|7z|gz|tar|epub|md)$/i;
        const isDocument = (
            // By MIME type (browser stores full MIME like "application/pdf", "application/vnd.openxmlformats-officedocument...")
            mimeType.startsWith('application/') && !mimeType.includes('octet-stream') ||
            mimeType.startsWith('text/') && !mimeType.startsWith('text/html') ||
            mimeType.includes('pdf') ||
            mimeType.includes('word') ||
            mimeType.includes('document') ||
            mimeType.includes('excel') ||
            mimeType.includes('sheet') ||
            mimeType.includes('presentation') ||
            mimeType.includes('powerpoint') ||
            mimeType.includes('zip') ||
            mimeType.includes('rar') ||
            mimeType.includes('compressed') ||
            mimeType.includes('archive') ||
            // By file extension in the URL
            url.match(docExtensions)
        );

        // --- 2. AUDIO detection ---
        const isAudio = !isDocument && (
            mimeType.startsWith('audio') ||
            url.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i) ||
            url.includes('voice_')
        );

        // --- 3. VIDEO detection ---
        const isVideo = !isDocument && !isAudio && (
            mimeType.startsWith('video') ||
            url.match(/\.(mp4|webm|ogv|mov|avi|mkv)$/i) ||
            url.includes('/video/upload/')
        );

        // --- 4. IMAGE detection (only if nothing else matched) ---
        const isImage = !isDocument && !isAudio && !isVideo && (
            mimeType.startsWith('image') ||
            url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|ico|tiff)$/i) ||
            url.includes('/image/upload/')
        );

        // --- RENDER by priority ---
        if (isDocument) {
            return <CustomFileBubble key={index} item={item} />;
        }

        if (isAudio) {
            return <CustomAudioPlayer key={index} url={url} />;
        }

        if (isVideo) {
            return (
                <div key={index} className="chat_media_container position-relative mb-2" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '320px', boxShadow: 'var(--shadow-sm)' }}>
                    <video src={url} controls className="w-100" style={{ display: 'block', borderRadius: 'var(--radius-md)' }} />
                </div>
            );
        }

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

        // --- FALLBACK: unknown type → show as downloadable file bubble ---
        return <CustomFileBubble key={index} item={item} />;
    };

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
                                      {['thumb_up', 'favorite', 'sentiment_very_satisfied', 'sentiment_very_dissatisfied', 'celebration', 'local_fire_department', 'lightbulb'].map(icon => (
                                          <span key={icon} style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                                                onClick={() => {
                                                    handleReactMessage(icon);
                                                    setShowReactions(false);
                                                }}
                                                className="quick_emoji_btn mx-1"
                                                title={icon.replace(/_/g, ' ')}>
                                              <span className="material-icons" style={{ fontSize: '1.25rem', color: getReactionColor(icon) }}>
                                                  {icon}
                                              </span>
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
                            <div className="chat_text" style={getBubbleStyle()}>
                                {renderTextWithIcons(msg.text)}
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
                                return Object.keys(counts).map(iconName => (
                                    <span key={iconName} title={`${counts[iconName]} reaction(s)`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginRight: '4px' }}>
                                        <span className="material-icons" style={{ fontSize: '1rem', color: getReactionColor(iconName) }}>{iconName}</span>
                                        <small style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{counts[iconName]}</small>
                                    </span>
                                ));
                            })()}
                        </div>
                    )
                }
            
            </div>

            <div className="chat_time d-flex align-items-center justify-content-end" style={{ gap: '4px' }}>
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                {
                    msg.sender === auth.user._id && (
                        <span className="material-icons" style={{ 
                            fontSize: '14px', 
                            color: msg.isRead ? 'var(--primary-color)' : 'var(--text-muted)',
                            verticalAlign: 'middle',
                            lineHeight: '1'
                        }}>
                            {msg.isRead ? 'done_all' : 'done'}
                        </span>
                    )
                }
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
