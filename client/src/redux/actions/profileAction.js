import { GLOBALTYPES, DeleteData } from './globalTypes'
import { getDataAPI, patchDataAPI } from '../../utils/fetchData'
import { imageUpload } from '../../utils/imageUpload'
import { createNotify, removeNotify } from '../actions/notifyAction'


export const PROFILE_TYPES = {
    LOADING: 'LOADING_PROFILE',
    GET_USER: 'GET_PROFILE_USER',
    FOLLOW: 'FOLLOW',
    UNFOLLOW: 'UNFOLLOW',
    GET_ID: 'GET_PROFILE_ID',
    GET_POSTS: 'GET_PROFILE_POSTS',
    UPDATE_POST: 'UPDATE_PROFILE_POST'
}


export const getProfileUsers = ({id, auth}) => async (dispatch) => {
    dispatch({type: PROFILE_TYPES.GET_ID, payload: id})

    try {
        dispatch({type: PROFILE_TYPES.LOADING, payload: true})
        const res = getDataAPI(`/user/${id}`, auth.token)
        const res1 = getDataAPI(`/user_posts/${id}`, auth.token)
        
        const users = await res;
        const posts = await res1;

        dispatch({
            type: PROFILE_TYPES.GET_USER,
            payload: users.data
        })

        dispatch({
            type: PROFILE_TYPES.GET_POSTS,
            payload: {...posts.data, _id: id, page: 2}
        })

        dispatch({type: PROFILE_TYPES.LOADING, payload: false})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
    
}


export const updateProfileUser = ({userData, avatar, auth}) => async (dispatch) => {
    if(!userData.fullname)
    return dispatch({type: GLOBALTYPES.ALERT, payload: {error: "Please add your full name."}})

    if(userData.fullname.length > 25)
    return dispatch({type: GLOBALTYPES.ALERT, payload: {error: "Your full name too long."}})

    if(userData.story.length > 200)
    return dispatch({type: GLOBALTYPES.ALERT, payload: {error: "Your story too long."}})

    try {
        let media;
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})

        if(avatar) media = await imageUpload([avatar], auth.token)

        const res = await patchDataAPI("user", {
            ...userData,
            avatar: avatar ? media[0].url : auth.user.avatar
        }, auth.token)

        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                ...auth,
                user: {
                    ...auth.user, ...userData,
                    avatar: avatar ? media[0].url : auth.user.avatar,
                }
            }
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const follow = ({users, user, auth, socket}) => async (dispatch) => {
    let newUser;
    
    if (user.isPrivate) {
        newUser = { ...user, isPendingRequest: true }
        dispatch({ type: PROFILE_TYPES.FOLLOW, payload: newUser })
    } else {
        if(users.every(item => item._id !== user._id)){
            newUser = {...user, followers: [...user.followers, auth.user]}
        }else{
            users.forEach(item => {
                if(item._id === user._id){
                    newUser = {...item, followers: [...item.followers, auth.user]}
                }
            })
        }
        dispatch({ type: PROFILE_TYPES.FOLLOW, payload: newUser })
        dispatch({
            type: GLOBALTYPES.AUTH, 
            payload: {
                ...auth,
                user: {...auth.user, following: [...auth.user.following, newUser]}
            }
        })
    }

    try {
        const res = await patchDataAPI(`user/${user._id}/follow`, null, auth.token)
        
        if (res.data.status === 'pending') {
            const pendingUser = { ...user, isPendingRequest: true }
            dispatch({ type: PROFILE_TYPES.FOLLOW, payload: pendingUser })
        } else {
            socket.emit('follow', res.data.newUser)
            const msg = {
                id: auth.user._id,
                text: 'has started to follow you.',
                recipients: [newUser._id],
                url: `/profile/${auth.user._id}`,
            }
            dispatch(createNotify({msg, auth, socket}))
        }
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const unfollow = ({users, user, auth, socket}) => async (dispatch) => {
    let newUser;

    if(users.every(item => item._id !== user._id)){
        newUser = {...user, followers: DeleteData(user.followers, auth.user._id), isPendingRequest: false}
    }else{
        users.forEach(item => {
            if(item._id === user._id){
                newUser = {...item, followers: DeleteData(item.followers, auth.user._id), isPendingRequest: false}
            }
        })
    }

    dispatch({ type: PROFILE_TYPES.UNFOLLOW, payload: newUser })

    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: {
            ...auth,
            user: { 
                ...auth.user, 
                following: DeleteData(auth.user.following, newUser._id) 
            }
        }
    })

    try {
        const res = await patchDataAPI(`user/${user._id}/unfollow`, null, auth.token)
        socket.emit('unFollow', res.data.newUser)

        const msg = {
            id: auth.user._id,
            text: 'has started to follow you.',
            recipients: [newUser._id],
            url: `/profile/${auth.user._id}`,
        }
        dispatch(removeNotify({msg, auth, socket}))
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const blockUser = ({user, auth, socket}) => async (dispatch) => {
    dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
    try {
        const res = await patchDataAPI(`user/${user._id}/block`, null, auth.token)
        
        const unfollowedUser = {
            ...user,
            followers: DeleteData(user.followers, auth.user._id),
            isBlockedByMe: true
        }

        dispatch({ type: PROFILE_TYPES.UNFOLLOW, payload: unfollowedUser })

        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                ...auth,
                user: {
                    ...auth.user,
                    following: DeleteData(auth.user.following, user._id),
                    followers: DeleteData(auth.user.followers, user._id),
                    blockedUsers: [...(auth.user.blockedUsers || []), user._id]
                }
            }
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const unblockUser = ({user, auth}) => async (dispatch) => {
    dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
    try {
        const res = await patchDataAPI(`user/${user._id}/unblock`, null, auth.token)

        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                ...auth,
                user: {
                    ...auth.user,
                    blockedUsers: DeleteData(auth.user.blockedUsers || [], user._id)
                }
            }
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const getFollowRequests = (token) => async (dispatch) => {
    try {
        const res = await getDataAPI('user_requests', token)
        return res.data.requests;
    } catch (err) {
        console.error(err)
        return [];
    }
}

export const acceptFollowRequest = ({requestId, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await patchDataAPI(`user_requests/${requestId}/accept`, null, auth.token)
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const declineFollowRequest = ({requestId, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await patchDataAPI(`user_requests/${requestId}/decline`, null, auth.token)
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}