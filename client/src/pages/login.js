import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../redux/actions/authAction'
import { useDispatch, useSelector } from 'react-redux'


const Login = () => {
    const initialState = { email: '', password: '' }
    const [userData, setUserData] = useState(initialState)
    const { email, password } = userData

    const [typePass, setTypePass] = useState(false)

    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if(auth.token) navigate("/")
    }, [auth.token, navigate])

    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({...userData, [name]:value})
    }

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(login(userData))
    }

    return (
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-4">Socialize</h3>

                <div className="input_group">
                    <span className="material-icons text-muted">mail</span>
                    <input type="email" className="form-control" name="email"
                    placeholder="Email address"
                    onChange={handleChangeInput} value={email} required />
                </div>

                <div className="input_group">
                    <span className="material-icons text-muted">lock</span>
                    <input type={typePass ? "text" : "password"} 
                    className="form-control"
                    placeholder="Password"
                    onChange={handleChangeInput} value={password} name="password" required />

                    <span className="material-icons pass_toggle" onClick={() => setTypePass(!typePass)}>
                        {typePass ? 'visibility_off' : 'visibility'}
                    </span>
                </div>
                
                <button type="submit" className="btn btn-success w-100 d-flex align-items-center justify-content-center py-2"
                disabled={email && password ? false : true}
                style={{ borderRadius: '12px', fontWeight: 'bold' }} title="Login">
                    <span className="material-icons mr-2" style={{ fontSize: '1.2rem' }}>login</span>
                    Login
                </button>

                <p className="my-3 text-center">
                    Don't have an account? <Link to="/register" style={{color: "var(--primary-color)"}}>Register Now</Link>
                </p>

                <p className="my-2 text-center">
                    <Link to="/forgot_password" style={{color: "var(--text-secondary)", fontSize: '0.85rem'}}>Forgot Password?</Link>
                </p>
            </form>
        </div>
    )
}

export default Login
