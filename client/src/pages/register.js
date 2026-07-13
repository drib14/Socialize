import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../redux/actions/authAction'

const Register = () => {
    const { auth, alert } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const initialState = {
        fullname: '', username: '', email: '', password: '', cf_password: '', gender: 'male'
    }
    const [userData, setUserData] = useState(initialState)
    const { fullname, username, email, password, cf_password } = userData

    const [typePass, setTypePass] = useState(false)
    const [typeCfPass, setTypeCfPass] = useState(false)
    const [step, setStep] = useState(1)

    useEffect(() => {
        if (auth.token) navigate("/")
    }, [auth.token, navigate])

    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({ ...userData, [name]: value })
    }

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(register(userData))
    }

    // Password criteria flags
    const lengthValid = password.length >= 8
    const numValid = /\d/.test(password)
    const upperValid = /[A-Z]/.test(password)
    const specialValid = /[!@#$%^&*(),.?":{}|<>_]/.test(password)
    const matchesConfirm = password && password === cf_password

    const isStep1Valid = () => {
        return fullname.trim() && username.trim() && email.trim()
    }

    return (
        <div className="auth_page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
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
                    <h2 className="mb-3 font-weight-bold logo_text" style={{ 
                        fontSize: '2.2rem', 
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'serif'
                    }}>
                        Instagram
                    </h2>

                    <p className="text-muted font-weight-bold mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.3' }}>
                        Sign up to see photos and videos from your friends.
                    </p>

                    <div className="form-group mb-2">
                        <input type="email" className="form-control" name="email"
                            placeholder="Email address"
                            onChange={handleChangeInput} value={email} required 
                            style={{ borderRadius: '3px', background: 'var(--bg-input)', fontSize: '0.82rem', padding: '9px 12px' }} />
                        <small className="text-danger">{alert.email ? alert.email : ''}</small>
                    </div>

                    <div className="form-group mb-2">
                        <input type="text" className="form-control" name="fullname"
                            placeholder="Full Name"
                            onChange={handleChangeInput} value={fullname} required 
                            style={{ borderRadius: '3px', background: 'var(--bg-input)', fontSize: '0.82rem', padding: '9px 12px' }} />
                        <small className="text-danger">{alert.fullname ? alert.fullname : ''}</small>
                    </div>

                    <div className="form-group mb-2">
                        <input type="text" className="form-control" name="username"
                            placeholder="Username"
                            onChange={handleChangeInput} value={username.toLowerCase().replace(/ /g, '')} required 
                            style={{ borderRadius: '3px', background: 'var(--bg-input)', fontSize: '0.82rem', padding: '9px 12px' }} />
                        <small className="text-danger">{alert.username ? alert.username : ''}</small>
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
                        <small className="text-danger">{alert.password ? alert.password : ''}</small>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-1"
                        disabled={!(fullname.trim() && username.trim() && email.trim() && password.length >= 6)}
                        style={{ borderRadius: '4px', fontWeight: 'bold', background: '#0095f6', border: 'none', fontSize: '0.88rem' }} title="Register">
                        Sign Up
                    </button>

                    <p className="mt-4 mb-0" style={{ fontSize: '0.85rem' }}>
                        Have an account? <Link to="/" style={{ color: "#0095f6", fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register
