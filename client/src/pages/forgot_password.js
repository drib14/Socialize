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
                payload: {error: err.response.data.msg} 
            })
        }
    }

    return (
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-4">Forgot Password</h3>

                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" name="email"
                    onChange={e => setEmail(e.target.value)} value={email} required />
                </div>
                
                <button type="submit" className="btn btn-dark w-100 mb-2"
                style={{ background: '#2b8a3e', borderColor: '#2b8a3e' }}>
                    Send Password Reset Link
                </button>

                <p className="my-2 text-center">
                    <Link to="/" style={{color: "#2b8a3e"}}>Back to Login</Link>
                </p>
            </form>
        </div>
    )
}

export default ForgotPassword
