import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { createPost, updatePost } from '../redux/actions/postAction'
import Icons from './Icons'
import { imageShow, videoShow } from '../utils/mediaShow'
import Modal from 'react-modal'
import axios from 'axios'
import { getDataAPI } from '../utils/fetchData'
import Avatar from './Avatar'
import { PREDEFINED_MOODS, getMoodIcon } from '../utils/moods'

Modal.setAppElement('#root')

const StatusModal = () => {
    const { auth, theme, status, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [content, setContent] = useState('')
    const [images, setImages] = useState([])

    const [stream, setStream] = useState(false)
    const videoRef = useRef()
    const refCanvas = useRef()
    const textareaRef = useRef()
    const [tracks, setTracks] = useState('')

    // Location autocomplete states
    const [location, setLocation] = useState('')
    const [locationInput, setLocationInput] = useState('')
    const [locationSuggestions, setLocationSuggestions] = useState([])
    const [showLocationInput, setShowLocationInput] = useState(false)

    // Mood states
    const [mood, setMood] = useState('')
    const [dynamicMoods, setDynamicMoods] = useState([])
    const [showMoodCards, setShowMoodCards] = useState(false)

    // Mention autocomplete states
    const [mentionSuggestions, setMentionSuggestions] = useState([])
    const [mentionSearch, setMentionSearch] = useState('')
    const [showMentionDropdown, setShowMentionDropdown] = useState(false)

    useEffect(() => {
        if(status && textareaRef.current){
            setTimeout(() => {
                textareaRef.current.focus()
            }, 100)
        }
    }, [status])

    const handleChangeImages = e => {
        const files = [...e.target.files]
        let err = ""
        let newImages = []

        files.forEach(file => {
            if(!file) return err = "File does not exist."

            if(file.size > 1024 * 1024 * 30){
                return err = "The image/video largest is 30mb."
            }

            return newImages.push(file)
        })

        if(err) dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err} })
        setImages([...images, ...newImages])
    }

    const deleteImages = (index) => {
        const newArr = [...images]
        newArr.splice(index, 1)
        setImages(newArr)
    }

    const handleStream = () => {
        setStream(true)
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: true})
            .then(mediaStream => {
                videoRef.current.srcObject = mediaStream
                videoRef.current.play()

                const track = mediaStream.getTracks()
                setTracks(track[0])
            }).catch(err => console.log(err))
        }
    }

    const handleCapture = () => {
        const width = videoRef.current.clientWidth;
        const height = videoRef.current.clientHeight;

        refCanvas.current.setAttribute("width", width)
        refCanvas.current.setAttribute("height", height)

        const ctx = refCanvas.current.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, width, height)
        let URL = refCanvas.current.toDataURL()
        setImages([...images, {camera: URL}])
    }

    const handleStopStream = () => {
        tracks.stop()
        setStream(false)
    }

    const handleLocationSearch = async (e) => {
        const query = e.target.value;
        setLocationInput(query);
        if (query.trim().length < 3) {
            setLocationSuggestions([]);
            return;
        }
        
        try {
            const keyRes = await getDataAPI('location_key', auth.token);
            const key = keyRes.data.key;
            const res = await axios.get(`https://us1.locationiq.com/v1/autocomplete?key=${key}&q=${query}&format=json`);
            if (res.data && Array.isArray(res.data)) {
                setLocationSuggestions(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectSuggestion = (suggestion) => {
        setLocation(suggestion.display_name);
        setLocationInput('');
        setLocationSuggestions([]);
        setShowLocationInput(false);
    };

    // Use Predefined Mood Cards
    const toggleMoodCards = () => {
        setShowMoodCards(!showMoodCards);
    };

    // Mentions & Tagging
    const handleTextareaChange = async (e) => {
        const val = e.target.value;
        setContent(val);
        
        const selectionStart = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, selectionStart);
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1];
        
        if (lastWord.startsWith('@') && lastWord.length > 1) {
            const query = lastWord.substring(1);
            setMentionSearch(query);
            setShowMentionDropdown(true);
            try {
                const res = await getDataAPI(`search?username=${query}`, auth.token);
                if (res.data && Array.isArray(res.data.users)) {
                    setMentionSuggestions(res.data.users);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            setShowMentionDropdown(false);
            setMentionSuggestions([]);
        }
    };

    const selectMention = (userObj) => {
        const selectionStart = textareaRef.current.selectionStart;
        const textBeforeCursor = content.slice(0, selectionStart);
        const textAfterCursor = content.slice(selectionStart);
        
        const words = textBeforeCursor.split(/\s+/);
        words[words.length - 1] = `@${userObj.username} `;
        const newTextBeforeCursor = words.join(' ');
        
        const newContent = newTextBeforeCursor + textAfterCursor;
        setContent(newContent);
        setShowMentionDropdown(false);
        setMentionSuggestions([]);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = newTextBeforeCursor.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 50);
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        if(content.trim().length === 0 && images.length === 0)
        return dispatch({ 
            type: GLOBALTYPES.ALERT, payload: {error: "Please add content or a photo."}
        })

        if(status.onEdit){
            dispatch(updatePost({content, images, auth, status, location, mood}))
        }else{
            dispatch(createPost({content, images, auth, socket, location, mood}))
        }

        setContent('')
        setImages([])
        setLocation('')
        setMood('')
        setShowLocationInput(false)
        setShowMoodCards(false)
        if(tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false})
    }

    const handleCloseModal = () => {
        setContent('')
        setImages([])
        setLocation('')
        setMood('')
        setShowLocationInput(false)
        setShowMoodCards(false)
        if(tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false})
    }

    useEffect(() => {
        if(status.onEdit){
            setContent(status.content)
            setImages(status.images)
            setLocation(status.location || '')
            setMood(status.mood || '')
        }
    },[status])

    return (
        <Modal
            isOpen={!!status}
            onRequestClose={handleCloseModal}
            className="status_modal_content"
            overlayClassName="status_modal_overlay"
            contentLabel="Status Modal"
        >
            <form onSubmit={handleSubmit}>
                <div className="status_header">
                    <h5 className="m-0">Create Post</h5>
                    <span onClick={handleCloseModal}>
                        &times;
                    </span>
                </div>

                <div className="status_body">
                    <textarea name="content" value={content}
                    placeholder={`${auth.user.username}, what are you thinking?`}
                    onChange={handleTextareaChange}
                    autoFocus
                    ref={textareaRef}
                    style={{
                        color: 'var(--text-main)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px'
                    }} />

                    {/* Mention Autocomplete Dropdown overlay */}
                    {
                        showMentionDropdown && mentionSuggestions.length > 0 && (
                            <div className="mention_dropdown mb-2" style={{ 
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px', 
                                maxHeight: '150px', 
                                overflowY: 'auto', 
                                zIndex: 100, 
                                boxShadow: 'var(--shadow-md)',
                            }}>
                                {mentionSuggestions.map((item) => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => selectMention(item)} 
                                        className="p-2 dropdown-item d-flex align-items-center" 
                                        style={{ cursor: 'pointer', gap: '8px' }}
                                    >
                                        <Avatar src={item.avatar} size="small-avatar" />
                                        <div className="text-truncate">
                                            <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.fullname}</strong>
                                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>@{item.username}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {/* Location Badge */}
                    {
                        location && (
                            <div className="d-flex align-items-center mb-2 px-2 py-1" 
                                 style={{ background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)', width: 'fit-content', gap: '6px' }}>
                                <span className="material-icons text-primary" style={{ fontSize: '1rem' }}>place</span>
                                <small style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{location}</small>
                                <span className="material-icons text-danger" style={{ fontSize: '1rem', cursor: 'pointer' }} onClick={() => setLocation('')}>close</span>
                            </div>
                        )
                    }

                    {/* Mood Badge */}
                    {
                        mood && (
                            <div className="d-flex align-items-center mb-2 px-2 py-1" 
                                 style={{ background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)', width: 'fit-content', gap: '6px' }}>
                                {getMoodIcon(mood) && <i className={getMoodIcon(mood)}></i>}
                                <small style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{mood}</small>
                                <span className="material-icons text-danger" style={{ fontSize: '1rem', cursor: 'pointer' }} onClick={() => setMood('')}>close</span>
                            </div>
                        )
                    }

                    {/* Autocomplete Input Location Search */}
                    {
                        showLocationInput && !location && (
                            <div className="position-relative mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Search location..." 
                                    value={locationInput} 
                                    onChange={handleLocationSearch}
                                    className="form-control form-control-sm"
                                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '6px 12px' }}
                                />
                                {
                                    locationSuggestions.length > 0 && (
                                        <div className="position-absolute w-100" style={{ 
                                            background: 'var(--bg-card)', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px', 
                                            maxHeight: '180px', 
                                            overflowY: 'auto', 
                                            zIndex: 100, 
                                            boxShadow: 'var(--shadow-md)',
                                            top: '36px'
                                        }}>
                                            {locationSuggestions.map((item, index) => (
                                                <div 
                                                    key={index} 
                                                    onClick={() => selectSuggestion(item)} 
                                                    className="p-2 dropdown-item text-truncate" 
                                                    style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}
                                                >
                                                    {item.display_name}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {/* Dynamic Mood Selection Cards */}
                    {
                        showMoodCards && !mood && (
                            <div className="mb-2 p-2" style={{ background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)', maxHeight: '180px', overflowY: 'auto' }}>
                                <small className="text-muted d-block mb-2 font-weight-bold">Select Mood</small>
                                <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                                    {PREDEFINED_MOODS.map((item, index) => {
                                        return (
                                            <div 
                                                key={index}
                                                onClick={() => {
                                                    setMood(`Feeling ${item.name}`);
                                                    setShowMoodCards(false);
                                                }}
                                                className="p-2 d-flex align-items-center justify-content-center"
                                                style={{ 
                                                    background: 'var(--bg-card)', 
                                                    border: '1px solid var(--border-color)', 
                                                    borderRadius: '8px', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    boxShadow: 'var(--shadow-sm)',
                                                    gap: '6px',
                                                    minWidth: '80px',
                                                    flex: '1 0 22%'
                                                }}
                                                title={`Feeling ${item.name}`}
                                            >
                                                <i className={item.icon}></i>
                                                <small className="text-truncate" style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{item.name}</small>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }

                    <div className="d-flex">
                        <div className="flex-fill"></div>
                        <Icons setContent={setContent} content={content} theme={theme} />
                    </div>

                    <div className="show_images">
                        {
                            images.map((img, index) => (
                                <div key={index} id="file_img">
                                    {
                                        img.camera ? imageShow(img.camera, theme)
                                        : img.url
                                            ?<>
                                                {
                                                    typeof img.url === 'string' && img.url.match(/video/i)
                                                    ? videoShow(img.url, theme) 
                                                    : imageShow(img.url, theme)
                                                }
                                            </>
                                            :<>
                                                {
                                                    img.type && typeof img.type === 'string' && img.type.match(/video/i)
                                                    ? videoShow(URL.createObjectURL(img), theme) 
                                                    : imageShow(URL.createObjectURL(img), theme)
                                                }
                                            </>
                                    }
                                    <span onClick={() => deleteImages(index)}>&times;</span>
                                </div>
                            ))
                        }
                    </div>

                    {
                        stream && 
                        <div className="stream position-relative">
                            <video autoPlay muted ref={videoRef} width="100%" height="100%"
                            style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                            
                            <span onClick={handleStopStream}>&times;</span>
                            <canvas ref={refCanvas} style={{display: 'none'}} />
                        </div>
                    }

                    <div className="input_images">
                        {
                            stream 
                            ? <i className="fas fa-camera" onClick={handleCapture} />
                            : <>
                                <i className="fas fa-camera" onClick={handleStream} />

                                <div className="file_upload">
                                    <i className="fas fa-image" />
                                    <input type="file" name="file" id="file"
                                    multiple accept="image/*,video/*" onChange={handleChangeImages} />
                                </div>

                                <div className="file_upload" onClick={() => setShowLocationInput(!showLocationInput)} title="Add Location" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons text-primary" style={{ fontSize: '1.4rem', verticalAlign: 'middle' }}>add_location_alt</span>
                                </div>

                                <div className="file_upload" onClick={toggleMoodCards} title="Add Mood" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons text-warning" style={{ fontSize: '1.4rem', verticalAlign: 'middle' }}>sentiment_satisfied_alt</span>
                                </div>
                            </>
                        }
                        
                    </div>

                </div>

                <div className="status_footer">
                    <button className="btn btn-secondary w-100" type="submit" style={{ background: '#2b8a3e', borderColor: '#2b8a3e', color: 'white' }}>
                        Post
                    </button>
                </div>

            </form>
        </Modal>
    )
}

export default StatusModal
