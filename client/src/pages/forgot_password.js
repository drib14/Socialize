import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { postDataAPI } from '../utils/fetchData'
import { useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!email) return;

        try {
            dispatch({ type: GLOBALTYPES.ALERT, payload: {loading: true} })
            const res = await postDataAPI('forgot', { email })
            dispatch({ type: GLOBALTYPES.ALERT, payload: {success: res.data.msg} })
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
                <h3 className="text-uppercase text-center mb-4">Reset Credentials</h3>

                <div className="input_group">
                    <span className="material-icons text-muted">mail</span>
                    <input type="email" className="form-control" name="email"
                    placeholder="Email address"
                    onChange={e => setEmail(e.target.value)} value={email} required />
                </div>
                
                <button type="submit" className="btn btn-success w-100 d-flex align-items-center justify-content-center py-2 mb-2"
                style={{ borderRadius: '12px', fontWeight: 'bold' }} title="Send Reset Link">
                    <span className="material-icons mr-2" style={{ fontSize: '1.2rem' }}>send</span>
                    Send Reset Link
                </button>

                <p className="my-3 text-center">
                    <Link to="/" style={{color: "var(--primary-color)"}}>Back to Login</Link>
                </p>
            </form>
        </div>
    )
}

export default ForgotPassword
