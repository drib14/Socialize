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
        <div className="auth_page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <div className="d-flex align-items-center justify-content-center" style={{ maxWidth: '935px', width: '100%', gap: '32px' }}>
                {/* Desktop Phone Mockup */}
                <div className="d-none d-lg-block" style={{
                    width: '380px',
                    height: '580px',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    borderRadius: '36px',
                    padding: '12px',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{
                        background: '#000',
                        width: '100%',
                        height: '100%',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fab fa-instagram text-white mb-3" style={{ fontSize: '4.5rem' }} />
                        <h4 className="text-white font-weight-bold text-center px-4" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            Instagram
                        </h4>
                        <p className="text-white-50 text-center px-4 mt-2" style={{ fontSize: '0.85rem' }}>
                            Connecting you to the people and things you love.
                        </p>
                    </div>
                </div>

                {/* Login Form Box */}
                <div className="d-flex flex-column" style={{ maxWidth: '350px', width: '100%', gap: '10px' }}>
                    <form onSubmit={handleSubmit} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        padding: '40px 30px',
                        textAlign: 'center',
                        borderRadius: '1px',
                        width: '100%',
                        maxWidth: '100%'
                    }}>
                        <h2 className="mb-4 font-weight-bold logo_text" style={{ 
                            fontSize: '2.2rem', 
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: 'serif'
                        }}>
                            Instagram
                        </h2>

                        <div className="form-group mb-2">
                            <input type="email" className="form-control" name="email"
                            placeholder="Email address"
                            onChange={handleChangeInput} value={email} required 
                            style={{ borderRadius: '3px', background: 'var(--bg-input)', fontSize: '0.82rem', padding: '9px 12px' }} />
                        </div>

                        <div className="form-group mb-3 position-relative">
                            <input type={typePass ? "text" : "password"} 
                            className="form-control"
                            placeholder="Password"
                            onChange={handleChangeInput} value={password} name="password" required 
                            style={{ borderRadius: '3px', background: 'var(--bg-input)', fontSize: '0.82rem', padding: '9px 12px' }} />
                            <span className="position-absolute" style={{ right: '12px', top: '10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }} onClick={() => setTypePass(!typePass)}>
                                {typePass ? 'Hide' : 'Show'}
                            </span>
                        </div>
                        
                        <button type="submit" className="btn btn-primary w-100 py-1"
                        disabled={email && password ? false : true}
                        style={{ borderRadius: '4px', fontWeight: 'bold', background: '#0095f6', border: 'none', fontSize: '0.88rem' }} title="Login">
                            Log In
                        </button>

                        <div className="d-flex align-items-center my-3" style={{ gap: '10px' }}>
                            <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                            <span className="text-muted font-weight-bold" style={{ fontSize: '0.78rem' }}>OR</span>
                            <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                        </div>

                        <p className="my-2" style={{ fontSize: '0.85rem' }}>
                            Don't have an account? <Link to="/register" style={{ color: "#0095f6", fontWeight: 'bold', textDecoration: 'none' }}>Sign up</Link>
                        </p>

                        <p className="mt-3 mb-0">
                            <Link to="/forgot_password" style={{ color: "#00376b", fontSize: '0.78rem', textDecoration: 'none' }}>Forgot password?</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
