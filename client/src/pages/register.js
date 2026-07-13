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
        if(auth.token) navigate("/")
    }, [auth.token, navigate])

    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({...userData, [name]:value})
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
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-3">Socialize</h3>

                {/* Steps Indicator Dots */}
                <div className="steps_indicator">
                    <span className={`step_dot ${step === 1 ? 'active' : ''}`} />
                    <span className={`step_dot ${step === 2 ? 'active' : ''}`} />
                </div>

                {
                    step === 1 ? (
                        <>
                            <div className="input_group">
                                <span className="material-icons text-muted">person</span>
                                <input type="text" className="form-control" name="fullname"
                                placeholder="Full Name"
                                onChange={handleChangeInput} value={fullname}
                                style={{background: `${alert.fullname ? '#fd2d6a14' : ''}`}} required />
                            </div>
                            <small className="form-text text-danger mb-3 mt-n3">
                                {alert.fullname ? alert.fullname : ''}
                            </small>

                            <div className="input_group">
                                <span className="material-icons text-muted">alternate_email</span>
                                <input type="text" className="form-control" name="username"
                                placeholder="Username"
                                onChange={handleChangeInput} value={username.toLowerCase().replace(/ /g, '')}
                                style={{background: `${alert.username ? '#fd2d6a14' : ''}`}} required />
                            </div>
                            <small className="form-text text-danger mb-3 mt-n3">
                                {alert.username ? alert.username : ''}
                            </small>

                            <div className="input_group">
                                <span className="material-icons text-muted">mail</span>
                                <input type="email" className="form-control" name="email"
                                placeholder="Email address"
                                onChange={handleChangeInput} value={email}
                                style={{background: `${alert.email ? '#fd2d6a14' : ''}`}} required />
                            </div>
                            <small className="form-text text-danger mb-3 mt-n3">
                                {alert.email ? alert.email : ''}
                            </small>

                            <div className="gender_buttons_container d-flex gap-2 mb-4">
                                <button type="button" 
                                className={`gender_btn ${userData.gender === 'male' ? 'active-gender' : ''}`}
                                onClick={() => setUserData({...userData, gender: 'male'})} title="Male">
                                    <i className="fas fa-mars" />
                                </button>

                                <button type="button" 
                                className={`gender_btn ${userData.gender === 'female' ? 'active-gender' : ''}`}
                                onClick={() => setUserData({...userData, gender: 'female'})} title="Female">
                                    <i className="fas fa-venus" />
                                </button>

                                <button type="button" 
                                className={`gender_btn ${userData.gender === 'other' ? 'active-gender' : ''}`}
                                onClick={() => setUserData({...userData, gender: 'other'})} title="Other">
                                    <i className="fas fa-genderless" />
                                </button>
                            </div>

                            <button type="button" className="btn btn-success w-100 d-flex align-items-center justify-content-center py-2"
                            disabled={!isStep1Valid()} onClick={() => setStep(2)}
                            style={{ borderRadius: '12px', fontWeight: 'bold' }}>
                                Next
                                <span className="material-icons ml-2" style={{ fontSize: '1.25rem' }}>arrow_forward</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="input_group">
                                <span className="material-icons text-muted">lock</span>
                                <input type={typePass ? "text" : "password"} 
                                className="form-control"
                                placeholder="Password"
                                onChange={handleChangeInput} value={password} name="password"
                                style={{background: `${alert.password ? '#fd2d6a14' : ''}`}} required />

                                <span className="material-icons pass_toggle" onClick={() => setTypePass(!typePass)}>
                                    {typePass ? 'visibility_off' : 'visibility'}
                                </span>
                            </div>
                            <small className="form-text text-danger mb-3 mt-n3">
                                {alert.password ? alert.password : ''}
                            </small>

                            <div className="input_group">
                                <span className="material-icons text-muted">lock_reset</span>
                                <input type={typeCfPass ? "text" : "password"} 
                                className="form-control"
                                placeholder="Confirm Password"
                                onChange={handleChangeInput} value={cf_password} name="cf_password"
                                style={{background: `${alert.cf_password ? '#fd2d6a14' : ''}`}} required />

                                <span className="material-icons pass_toggle" onClick={() => setTypeCfPass(!typeCfPass)}>
                                    {typeCfPass ? 'visibility_off' : 'visibility'}
                                </span>
                            </div>
                            <small className="form-text text-danger mb-3 mt-n3">
                                {alert.cf_password ? alert.cf_password : ''}
                            </small>

                            {/* Password Requirements Checklist Drawer */}
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

                            <div className="d-flex align-items-center justify-content-between">
                                <button type="button" className="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2 px-3"
                                onClick={() => setStep(1)} style={{ borderRadius: '12px', fontWeight: 'bold' }}>
                                    <span className="material-icons mr-2" style={{ fontSize: '1.25rem' }}>arrow_back</span>
                                    Back
                                </button>

                                <button type="submit" className="btn btn-success flex-fill d-flex align-items-center justify-content-center py-2 ml-3"
                                disabled={!(lengthValid && numValid && upperValid && specialValid && matchesConfirm)}
                                style={{ borderRadius: '12px', fontWeight: 'bold' }} title="Register">
                                    <span className="material-icons mr-2" style={{ fontSize: '1.25rem' }}>how_to_reg</span>
                                    Register
                                </button>
                            </div>
                        </>
                    )
                }

                <p className="my-3 text-center">
                    Already have an account? <Link to="/" style={{color: "var(--primary-color)"}}>Login Now</Link>
                </p>
            </form>
        </div>
    )
    )
}

export default Register
