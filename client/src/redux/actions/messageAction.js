import { GLOBALTYPES, DeleteData } from '../actions/globalTypes'
import { postDataAPI, getDataAPI, deleteDataAPI, putDataAPI, patchDataAPI } from '../../utils/fetchData'

export const MESS_TYPES = {
    ADD_USER: 'ADD_USER',
    ADD_MESSAGE: 'ADD_MESSAGE',
    GET_CONVERSATIONS: 'GET_CONVERSATIONS',
    GET_MESSAGES: 'GET_MESSAGES',
    UPDATE_MESSAGES: 'UPDATE_MESSAGES',
    DELETE_MESSAGES: 'DELETE_MESSAGES',
    DELETE_CONVERSATION: 'DELETE_CONVERSATION',
    CHECK_ONLINE_OFFLINE: 'CHECK_ONLINE_OFFLINE',
    READ_MESSAGE: 'READ_MESSAGE'
}



export const addMessage = ({msg, auth, socket}) => async (dispatch) =>{
    dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: msg})

    const { _id, avatar, fullname, username } = auth.user
    socket.emit('addMessage', {...msg, user: { _id, avatar, fullname, username } })
    
    try {
        await postDataAPI('message', msg, auth.token)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
    }
}

export const getConversations = ({auth, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`conversations?limit=${page * 9}`, auth.token)
        
        let newArr = [];
        res.data.conversations.forEach(item => {
            const isSelfChat = item.recipients.length === 1 
                ? item.recipients[0]._id === auth.user._id 
                : item.recipients.every(r => r._id === auth.user._id);

            if (isSelfChat) {
                newArr.push({...auth.user, text: item.text, media: item.media, call: item.call})
            } else {
                item.recipients.forEach(cv => {
                    if(cv._id !== auth.user._id){
                        newArr.push({...cv, text: item.text, media: item.media, call: item.call})
                    }
                })
            }
        })

        dispatch({
            type: MESS_TYPES.GET_CONVERSATIONS, 
            payload: {newArr, result: res.data.result}
        })

    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
    }
}

export const getMessages = ({auth, id, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`message/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, messages: res.data.messages.reverse()}

        dispatch({type: MESS_TYPES.GET_MESSAGES, payload: {...newData, _id: id, page}})
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
    }
}

export const loadMoreMessages = ({auth, id, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`message/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, messages: res.data.messages.reverse()}

        dispatch({type: MESS_TYPES.UPDATE_MESSAGES, payload: {...newData, _id: id, page}})
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
    }
}

export const deleteMessages = ({msg, data, auth}) => async (dispatch) => {
    const newData = DeleteData(data, msg._id)
    dispatch({type: MESS_TYPES.DELETE_MESSAGES, payload: {newData, _id: msg.recipient}})
    try {
        await deleteDataAPI(`message/${msg._id}`, auth.token)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
    }
}

export const deleteConversation = ({auth, id}) => async (dispatch) => {
    dispatch({type: MESS_TYPES.DELETE_CONVERSATION, payload: id})
    try {
        await deleteDataAPI(`conversation/${id}`, auth.token)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
    }
}

export const updateMessage = ({msg, text, auth, socket}) => async (dispatch) => {
    const updatedMsg = { ...msg, text };
    dispatch({ type: MESS_TYPES.UPDATE_MESSAGES, payload: updatedMsg });
    socket.emit('updateMessage', updatedMsg);
    
    try {
        await putDataAPI(`message/${msg._id}`, { text }, auth.token);
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}});
    }
}

export const reactMessage = ({msg, emoji, auth, socket}) => async (dispatch) => {
    try {
        const res = await patchDataAPI(`message/${msg._id}/react`, { emoji }, auth.token);
        const updatedMsg = { ...msg, reactions: res.data.reactions };
        dispatch({ type: MESS_TYPES.UPDATE_MESSAGES, payload: updatedMsg });
        socket.emit('reactMessage', {
            _id: msg._id,
            reactions: res.data.reactions,
            sender: msg.sender,
            recipient: msg.recipient
        });
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}});
    }
}

export const markMessagesAsRead = ({auth, id, socket}) => async (dispatch) => {
    dispatch({ type: MESS_TYPES.READ_MESSAGE, payload: id })
    try {
        await patchDataAPI(`message/read/${id}`, null, auth.token)
        socket.emit('readMessage', { sender: auth.user._id, recipient: id })
    } catch (err) {
        console.error("Mark read error:", err)
    }
}