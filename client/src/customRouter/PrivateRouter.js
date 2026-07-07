import { Navigate } from 'react-router-dom'

const PrivateRouter = ({ children }) => {
    const firstLogin = localStorage.getItem('firstLogin')
    return firstLogin ? children : <Navigate to="/" replace />
}

export default PrivateRouter
