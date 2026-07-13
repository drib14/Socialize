import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import PageRender from './customRouter/PageRender'
import PrivateRouter from './customRouter/PrivateRouter'

import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import ForgotPassword from './pages/forgot_password'
import ResetPassword from './pages/reset_password'

import Alert from './components/alert/Alert'
import Header from './components/header/Header'
import StatusModal from './components/StatusModal'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useSelector, useDispatch } from 'react-redux'
import { refreshToken } from './redux/actions/authAction'
import { getPosts } from './redux/actions/postAction'
import { getSuggestions } from './redux/actions/suggestionsAction'

import io from 'socket.io-client'
import { GLOBALTYPES } from './redux/actions/globalTypes'
import SocketClient from './SocketClient'

import { getNotifies } from './redux/actions/notifyAction'
import CallModal from './components/message/CallModal'
import Peer from 'peerjs'

function App() {
  const { auth, status, modal, call, theme } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(refreshToken())

    const socket = io(import.meta.env.VITE_API_URL || '')
    dispatch({type: GLOBALTYPES.SOCKET, payload: socket})
    return () => socket.close()
  },[dispatch])

  useEffect(() => {
    if(auth.token) {
      dispatch(getPosts(auth.token))
      dispatch(getSuggestions(auth.token))
      dispatch(getNotifies(auth.token))
    }
  }, [dispatch, auth.token])

  
  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {}
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {}
      });
    }
  },[])

 
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL;
    let peerConfig = { path: '/', secure: true };
    if (backendUrl) {
      try {
        const urlObj = new URL(backendUrl);
        peerConfig.host = urlObj.hostname;
        peerConfig.port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80);
      } catch (err) {
        console.error('Invalid VITE_API_URL:', err);
      }
    }
    const newPeer = new Peer(undefined, peerConfig)
    
    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer })
  },[dispatch])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme ? 'dark' : 'light')
  }, [theme])


  return (
    <Router>
      <Alert />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />

      <input type="checkbox" id="theme" checked={theme} readOnly />
      <div className={`App ${(status || modal) && 'mode'}`}>
        <div className="main">
          {auth.token && <Header />}
          {status && <StatusModal />}
          {auth.token && <SocketClient />}
          {call && <CallModal />}
          
          <Routes>
            <Route path="/" element={auth.token ? <Home /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset_password/:token" element={<ResetPassword />} />

            <Route path="/posts/tag/:id" element={
              <PrivateRouter>
                <PageRender />
              </PrivateRouter>
            } />

            <Route path="/:page" element={
              <PrivateRouter>
                <PageRender />
              </PrivateRouter>
            } />
            <Route path="/:page/:id" element={
              <PrivateRouter>
                <PageRender />
              </PrivateRouter>
            } />
          </Routes>
          
        </div>
      </div>
    </Router>
  );
}

export default App;
