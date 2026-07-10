import React, { useState, useEffect, useRef } from 'react'
import UserCard from '../UserCard'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import MsgDisplay from './MsgDisplay'
import Icons from '../Icons'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { imageUpload } from '../../utils/imageUpload'
import { addMessage, getMessages, loadMoreMessages, deleteConversation } from '../../redux/actions/messageAction'
import { customConfirm } from '../../utils/customAlert'

const RightSide = () => {
    const { auth, message, theme, socket, peer } = useSelector(state => state)
    const dispatch = useDispatch()

    const { id } = useParams()
    const [user, setUser] = useState([])
    const [text, setText] = useState('')
    const [media, setMedia] = useState([])
    const [loadMedia, setLoadMedia] = useState(false)

    const refDisplay = useRef()
    const pageEnd = useRef()

    const [data, setData] = useState([])
    const [result, setResult] = useState(9)
    const [page, setPage] = useState(0)
    const [isLoadMore, setIsLoadMore] = useState(0)

    const navigate = useNavigate()

    // Voice message recording states
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [replyMessage, setReplyMessage] = useState(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const timerRef = useRef(null)

    useEffect(() => {
        const newData = message.data.find(item => item._id === id)
        if(newData){
            setData(newData.messages)
            setResult(newData.result)
            setPage(newData.page)
        }
    },[message.data, id])

    useEffect(() => {
        if(id && message.users.length > 0){
            setTimeout(() => {
                if(refDisplay.current) {
                    refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
                }
            },50)

            const newUser = message.users.find(user => user._id === id)
            if(newUser) setUser(newUser)
        }
    }, [message.users, id])

    const handleChangeMedia = (e) => {
        const files = [...e.target.files]
        let err = ""
        let newMedia = []

        files.forEach(file => {
            if(!file) return err = "File does not exist."

            if(file.size > 1024 * 1024 * 30){
                return err = "The largest file size is 30mb."
            }

            return newMedia.push(file)
        })

        if(err) dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err} })
        setMedia([...media, ...newMedia])
    }

    const handleDeleteMedia = (index) => {
        const newArr = [...media]
        newArr.splice(index, 1)
        setMedia(newArr)
    }

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        if(!text.trim() && media.length === 0) return;
        
        const textToSend = text;
        const mediaToSend = media;
        const replyToSend = replyMessage;

        setText('')
        setMedia([])
        setReplyMessage(null)
        setLoadMedia(true)

        let newArr = [];
        if(mediaToSend.length > 0) newArr = await imageUpload(mediaToSend, auth.token)

        const msg = {
            sender: auth.user._id,
            recipient: id,
            text: textToSend, 
            media: newArr,
            replyTo: replyToSend ? replyToSend._id : undefined,
            createdAt: new Date().toISOString()
        }

        setLoadMedia(false)
        await dispatch(addMessage({msg, auth, socket}))
        if(refDisplay.current){
            refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
        }
    }

    useEffect(() => {
        const getMessagesData = async () => {
            if(message.data.every(item => item._id !== id)){
                await dispatch(getMessages({auth, id}))
                setTimeout(() => {
                    if(refDisplay.current) {
                        refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
                    }
                },50)
            }
        }
        getMessagesData()
    },[id, dispatch, auth, message.data])

    // Load More
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting){
                setIsLoadMore(p => p + 1)
            }
        },{
            threshold: 0.1
        })

        if(pageEnd.current) {
            observer.observe(pageEnd.current)
        }
    },[setIsLoadMore])

    useEffect(() => {
        if(isLoadMore > 1){
            if(result >= page * 9){
                dispatch(loadMoreMessages({auth, id, page: page + 1}))
                setIsLoadMore(1)
            }
        }
        // eslint-disable-next-line
    },[isLoadMore])

    const handleDeleteConversation = async () => {
        const confirmed = await customConfirm('Do you want to delete this conversation?')
        if(confirmed){
            dispatch(deleteConversation({auth, id}))
            return navigate('/message')
        }
    }

    // Call
    const caller = ({video}) => {
        const { _id, avatar, username, fullname } = user

        const msg = {
            sender: auth.user._id,
            recipient: _id, 
            avatar, username, fullname, video
        }
        dispatch({ type: GLOBALTYPES.CALL, payload: msg })
    }

    const callUser = ({video}) => {
        const { _id, avatar, username, fullname } = auth.user

        const msg = {
            sender: _id,
            recipient: user._id, 
            avatar, username, fullname, video
        }

        if(peer.open) msg.peerId = peer._id

        socket.emit('callUser', msg)
    }

    const handleAudioCall = () => {
        caller({video: false})
        callUser({video: false})
    }
    
    const handleVideoCall = () => {
        caller({video: true})
        callUser({video: true})
    }

    // Audio Voice Message Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            let chunks = [];
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            recorder.onstop = async () => {
                clearInterval(timerRef.current);
                setRecordingTime(0);

                if (chunks.length === 0) return; // Prevent uploading if cancelled

                const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.mp3`, { type: 'audio/mp3' });
                
                // Upload and send voice message immediately for modern experience
                setLoadMedia(true)
                const uploaded = await imageUpload([audioFile], auth.token);
                const msg = {
                    sender: auth.user._id,
                    recipient: id,
                    text: "", 
                    media: uploaded,
                    replyTo: replyMessage ? replyMessage._id : undefined,
                    createdAt: new Date().toISOString()
                }
                setReplyMessage(null)
                setLoadMedia(false)
                await dispatch(addMessage({msg, auth, socket}))
                if(refDisplay.current){
                    refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
                }
            };
            
            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Microphone access denied or unavailable." } });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder) {
            // override onstop before calling stop to discard chunks so it is not sent
            mediaRecorder.onstop = null;
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
            clearInterval(timerRef.current);
            setRecordingTime(0);
        }
    };

    const formatRecordTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <>
            <div className="message_header" style={{cursor: 'pointer'}} >
                {
                    user.length !== 0 &&
                    <UserCard user={user}>
                        <div>
                            <i className="fas fa-phone-alt"
                            onClick={handleAudioCall} />

                            <i className="fas fa-video mx-3"
                            onClick={handleVideoCall} />

                            <i className="fas fa-trash text-danger"
                            onClick={handleDeleteConversation} />
                        </div>
                    </UserCard>
                }
            </div>

            <div className="chat_container" 
            style={{height: media.length > 0 ? 'calc(100% - 220px)' : ''}} >
                <div className="chat_display" ref={refDisplay}>
                    <button style={{marginTop: '-25px', opacity: 0}} ref={pageEnd}>
                        Load more
                    </button>

                    {
                        data.map((msg, index) => (
                                <div key={index}>
                                    {
                                        msg.sender !== auth.user._id &&
                                        <div className="chat_row other_message">
                                            <MsgDisplay user={user} msg={msg} theme={theme} setOnReply={setReplyMessage} />
                                        </div>
                                    }

                                    {
                                        msg.sender === auth.user._id &&
                                        <div className="chat_row you_message">
                                            <MsgDisplay user={auth.user} msg={msg} theme={theme} data={data} setOnReply={setReplyMessage} />
                                        </div>
                                    }
                                </div>
                        ))
                    }
                    

                   {
                       loadMedia && 
                       <div className="chat_row you_message">
                           <img src="/icon-web-01.png" alt="loading" className="loading-logo" />
                       </div>
                   }

                </div>
            </div>

            <div className="show_media" style={{
                display: media.length > 0 ? 'flex' : 'none',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '8px',
                background: 'var(--bg-input)',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                margin: 0,
                alignItems: 'center',
                overflowX: 'auto',
                height: 'auto',
                maxHeight: '90px'
            }}>
                {
                    media.map((item, index) => {
                        const isVideo = item.type && typeof item.type === 'string' && item.type.match(/video/i);
                        const isImage = item.type && typeof item.type === 'string' && item.type.match(/image/i);
                        const isAudio = item.type && typeof item.type === 'string' && item.type.match(/audio/i);
                        const fileName = item.name || "File";
                        const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.') + 1).toUpperCase() : 'FILE';

                        return (
                            <div key={index} className="position-relative" style={{ 
                                width: '68px', 
                                height: '68px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden',
                                background: 'var(--bg-card)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                {
                                    isImage && <img src={URL.createObjectURL(item)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                }
                                {
                                    isVideo && <video src={URL.createObjectURL(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                }
                                {
                                    !isImage && !isVideo && (
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-1" style={{ gap: '2px' }}>
                                            <span className="material-icons text-primary" style={{ fontSize: '1.2rem' }}>
                                                {isAudio ? 'audiotrack' : 'insert_drive_file'}
                                            </span>
                                            <small className="text-truncate font-weight-bold" style={{ fontSize: '0.6rem', maxWidth: '60px', color: 'var(--text-main)' }}>
                                                {ext}
                                            </small>
                                        </div>
                                    )
                                }
                                <span onClick={() => handleDeleteMedia(index)} 
                                      className="d-flex align-items-center justify-content-center text-white"
                                      style={{ 
                                          position: 'absolute', 
                                          top: '2px', 
                                          right: '2px', 
                                          background: '#ef4444', 
                                          width: '16px', 
                                          height: '16px', 
                                          borderRadius: '50%', 
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          fontWeight: 'bold',
                                          zIndex: 10
                                      }}>
                                    &times;
                                </span>
                            </div>
                        );
                    })
                }
            </div>

            {/* Quoted Message Preview above text bar */}
            {
                replyMessage && (
                    <div className="d-flex justify-content-between align-items-center px-3 py-2" 
                         style={{ background: 'var(--bg-body)', borderTop: '1px solid var(--border-color)', gap: '10px', borderLeft: '4px solid var(--primary-color)' }}>
                        <div className="text-left overflow-hidden" style={{ flex: 1 }}>
                            <small className="font-weight-bold d-block" style={{ color: 'var(--primary-color)' }}>
                                Replying to {replyMessage.sender === auth.user._id ? 'Yourself' : user.fullname}
                            </small>
                            <small className="text-muted text-truncate d-block" style={{ fontSize: '0.85rem' }}>
                                {replyMessage.text || (replyMessage.media.length > 0 ? 'Attachment' : '')}
                            </small>
                        </div>
                        <span className="material-icons text-muted" style={{ cursor: 'pointer', fontSize: '1.25rem' }} 
                              onClick={() => setReplyMessage(null)}>
                            close
                        </span>
                    </div>
                )
            }

            {/* Voice Message Recorder Bar vs Text Inputs */}
            {
                recording ? (
                    <div className="chat_input d-flex align-items-center justify-content-between py-2 px-3" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', gap: '16px' }}>
                        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                            {/* Blinking Red Dot */}
                            <div style={{
                                width: '10px',
                                height: '10px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                animation: 'blink 1.5s infinite'
                            }} />
                            <small className="font-weight-bold" style={{ fontSize: '0.95rem' }}>{formatRecordTime(recordingTime)}</small>

                            {/* Animated CSS Waveform */}
                            <div className="d-flex align-items-center" style={{ gap: '2px', marginLeft: '10px' }}>
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div key={i} style={{
                                        width: '2px',
                                        height: '14px',
                                        background: 'var(--primary-color)',
                                        borderRadius: '2px',
                                        animation: `waveform-animation 1.2s infinite ease-in-out ${i * 0.1}s`
                                    }} />
                                ))}
                                <style>
                                    {`
                                        @keyframes waveform-animation {
                                            0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
                                            50% { transform: scaleY(1); opacity: 1; }
                                        }
                                        @keyframes blink {
                                            0%, 100% { opacity: 1; }
                                            50% { opacity: 0.3; }
                                        }
                                    `}
                                </style>
                            </div>
                        </div>
                        <div className="d-flex align-items-center" style={{ gap: '16px' }}>
                            <span className="material-icons text-danger" style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={cancelRecording} title="Cancel Recording">
                                delete
                            </span>
                            <div onClick={stopRecording} className="d-flex align-items-center justify-content-center"
                                 style={{
                                     width: '36px',
                                     height: '36px',
                                     borderRadius: '50%',
                                     background: 'var(--primary-color)',
                                     color: 'white',
                                     cursor: 'pointer',
                                     boxShadow: 'var(--shadow-sm)'
                                 }}
                                 title="Send Voice Message">
                                <span className="material-icons" style={{ fontSize: '1.2rem', transform: 'rotate(-45deg)', marginLeft: '2px', marginBottom: '2px' }}>send</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="chat_input" onSubmit={handleSubmit} >
                        <input type="text" placeholder="Enter your message..."
                        value={text} onChange={e => setText(e.target.value)}
                        style={{
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '18px'
                        }} />

                        <Icons setContent={setText} content={text} theme={theme} />

                        {/* Record Trigger */}
                        <div className="file_upload" onClick={startRecording} title="Record Voice Message" style={{ cursor: 'pointer' }}>
                            <span className="material-icons text-success" style={{ fontSize: '1.5rem' }}>mic</span>
                        </div>

                        {/* File Upload Trigger */}
                        <div className="file_upload" title="Upload Media/Files">
                            <span className="material-icons text-danger" style={{ fontSize: '1.5rem' }}>insert_drive_file</span>
                            <input type="file" name="file" id="file"
                            multiple accept="image/*,video/*,audio/*,application/*,text/*" onChange={handleChangeMedia} />
                        </div>

                        <button type="submit" className="material-icons" 
                        disabled={(text || media.length > 0) ? false : true}>
                            near_me
                        </button>
                    </form>
                )
            }
        </>
    )
}

export default RightSide
