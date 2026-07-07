import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postDataAPI } from '../utils/fetchData'
import { useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [password, setPassword] = useState('')
    const [cf_password, setCfPassword] = useState('')
    const [typePass, setTypePass] = useState(false)
    const [typeCfPass, setTypeCfPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(password !== cf_password) {
            return dispatch({
                type: GLOBALTYPES.ALERT,
                payload: {error: "Passwords do not match."}
            })
        }

        try {
            dispatch({ type: GLOBALTYPES.ALERT, payload: {loading: true} })
            const res = await postDataAPI('reset', { password }, token)
            dispatch({ type: GLOBALTYPES.ALERT, payload: {success: res.data.msg} })
            navigate('/')
        } catch (err) {
            dispatch({ 
                type: GLOBALTYPES.ALERT, 
                payload: {error: err.response.data.msg} 
            })
        }
    }

    return (
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-4">Reset Password</h3>

                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">New Password</label>
                    <div className="pass">
                        <input type={typePass ? "text" : "password"} className="form-control" 
                        id="exampleInputPassword1" name="password"
                        onChange={e => setPassword(e.target.value)} value={password} required />
                        <small onClick={() => setTypePass(!typePass)}>
                            {typePass ? 'Hide' : 'Show'}
                        </small>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="cf_password">Confirm New Password</label>
                    <div className="pass">
                        <input type={typeCfPass ? "text" : "password"} className="form-control" 
                        id="cf_password" name="cf_password"
                        onChange={e => setCfPassword(e.target.value)} value={cf_password} required />
                        <small onClick={() => setTypeCfPass(!typeCfPass)}>
                            {typeCfPass ? 'Hide' : 'Show'}
                        </small>
                    </div>
                </div>
                
                <button type="submit" className="btn btn-dark w-100"
                style={{ background: '#2b8a3e', borderColor: '#2b8a3e' }}>
                    Reset Password
                </button>
            </form>
        </div>
    )
}

export default ResetPassword
