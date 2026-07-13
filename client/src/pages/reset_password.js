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

    // Password criteria flags
    const lengthValid = password.length >= 8
    const numValid = /\d/.test(password)
    const upperValid = /[A-Z]/.test(password)
    const specialValid = /[!@#$%^&*(),.?":{}|<>_]/.test(password)
    const matchesConfirm = password && password === cf_password

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
                payload: {error: err.response?.data?.msg || err.message} 
            })
        }
    }

    return (
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-4">New Credentials</h3>

                <div className="input_group">
                    <span className="material-icons text-muted">lock</span>
                    <input type={typePass ? "text" : "password"} className="form-control" 
                    name="password" placeholder="New Password"
                    onChange={e => setPassword(e.target.value)} value={password} required />
                    
                    <span className="material-icons pass_toggle" onClick={() => setTypePass(!typePass)}>
                        {typePass ? 'visibility_off' : 'visibility'}
                    </span>
                </div>

                <div className="input_group">
                    <span className="material-icons text-muted">lock_reset</span>
                    <input type={typeCfPass ? "text" : "password"} className="form-control" 
                    name="cf_password" placeholder="Confirm New Password"
                    onChange={e => setCfPassword(e.target.value)} value={cf_password} required />
                    
                    <span className="material-icons pass_toggle" onClick={() => setTypeCfPass(!typeCfPass)}>
                        {typeCfPass ? 'visibility_off' : 'visibility'}
                    </span>
                </div>

                {/* Password Criteria Verification List */}
                <div className="password_requirements mb-3">
                    <ul style={{ paddingLeft: '4px' }}>
                        <li className={lengthValid ? 'valid' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                                {lengthValid ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            At least 8 characters
                        </li>
                        <li className={numValid ? 'valid' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                                {numValid ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            At least 1 number
                        </li>
                        <li className={upperValid ? 'valid' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                                {upperValid ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            At least 1 uppercase letter
                        </li>
                        <li className={specialValid ? 'valid' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                                {specialValid ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            At least 1 special character
                        </li>
                        <li className={matchesConfirm ? 'valid' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                                {matchesConfirm ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            Passwords match
                        </li>
                    </ul>
                </div>
                
                <button type="submit" className="btn btn-success w-100 d-flex align-items-center justify-content-center py-2"
                disabled={!(lengthValid && numValid && upperValid && specialValid && matchesConfirm)}
                style={{ borderRadius: '12px', fontWeight: 'bold' }} title="Reset Password">
                    <span className="material-icons mr-2" style={{ fontSize: '1.25rem' }}>lock_reset</span>
                    Reset Password
                </button>
            </form>
        </div>
    )
}

export default ResetPassword
