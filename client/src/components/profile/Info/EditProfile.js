import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { checkImage } from '../../../utils/imageUpload'
import { GLOBALTYPES } from '../../../redux/actions/globalTypes'
import { updateProfileUser } from '../../../redux/actions/profileAction'

const EditProfile = ({setOnEdit}) => {
    const initState = {
        fullname: '', website: '', bio: '', pronouns: '', isPrivate: false
    }
    const [userData, setUserData] = useState(initState)
    const { fullname, website, bio, pronouns, isPrivate } = userData

    const [avatar, setAvatar] = useState('')

    const { auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    useEffect(() => {
        if (auth.user) {
            setUserData({
                fullname: auth.user.fullname || '',
                website: auth.user.website || '',
                bio: auth.user.bio || '',
                pronouns: auth.user.pronouns || '',
                isPrivate: auth.user.isPrivate || false
            })
        }
    }, [auth.user])


    const changeAvatar = (e) => {
        const file = e.target.files[0]

        const err = checkImage(file)
        if(err) return dispatch({
            type: GLOBALTYPES.ALERT, payload: {error: err}
        })

        setAvatar(file)
    }

    const handleInput = e => {
        const { name, value, checked, type } = e.target
        setUserData({ ...userData, [name]: type === 'checkbox' ? checked : value })
    }

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(updateProfileUser({userData, avatar, auth}))
    }

    return (
        <div className="edit_profile">
            <button className="btn btn-danger btn_close"
            onClick={() => setOnEdit(false)} title="Close">
                <span className="material-icons">close</span>
            </button>

            <form onSubmit={handleSubmit}>
                <div className="info_avatar">
                    <img src={avatar ? URL.createObjectURL(avatar) : auth.user.avatar} 
                    alt="avatar" style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                    <span>
                        <i className="fas fa-camera" />
                        <p>Change</p>
                        <input type="file" name="file" id="file_up"
                        accept="image/*" onChange={changeAvatar} />
                    </span>
                </div>

                <div className="form-group">
                    <label htmlFor="fullname">Full Name</label>
                    <div className="position-relative">
                        <input type="text" className="form-control" id="fullname"
                        name="fullname" value={fullname} onChange={handleInput} />
                        <small className="text-danger position-absolute"
                        style={{top: '50%', right: '5px', transform: 'translateY(-50%)'}}>
                            {fullname.length}/25
                        </small>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="pronouns">Pronouns</label>
                    <input type="text" name="pronouns" value={pronouns} placeholder="e.g. she/her, they/them"
                    className="form-control" onChange={handleInput} style={{ borderRadius: '3px', background: 'var(--bg-input)' }} />
                </div>

                <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input type="text" name="website" value={website}
                    className="form-control" onChange={handleInput} style={{ borderRadius: '3px', background: 'var(--bg-input)' }} />
                </div>

                <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea name="bio" value={bio} cols="30" rows="3"
                    className="form-control" onChange={handleInput} style={{ borderRadius: '3px', background: 'var(--bg-input)' }} />

                    <small className="text-danger d-block text-right">
                        {bio ? bio.length : 0}/150
                    </small>
                </div>

                <div className="form-group d-flex align-items-center mb-4">
                    <input type="checkbox" name="isPrivate" id="isPrivate" checked={isPrivate}
                    onChange={handleInput} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    <label htmlFor="isPrivate" className="m-0 ml-2" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        Private Account
                    </label>
                </div>

                <button className="btn btn-primary w-100 py-2 font-weight-bold" type="submit" title="Save" style={{ background: '#0095f6', border: 'none', borderRadius: '4px' }}>
                    Save Changes
                </button>
            </form>
        </div>
    )
}

export default EditProfile
