import { GLOBALTYPES } from './globalTypes'
import { postDataAPI, getDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData'

export const SAVED_COLLECTION_TYPES = {
    CREATE: 'CREATE_COLLECTION',
    GET: 'GET_COLLECTIONS',
    UPDATE: 'UPDATE_COLLECTION',
    DELETE: 'DELETE_COLLECTION',
    ADD_POST: 'ADD_POST_TO_COLLECTION',
    REMOVE_POST: 'REMOVE_POST_FROM_COLLECTION'
}

export const createCollection = ({name, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await postDataAPI('saved_collections', { name }, auth.token)

        dispatch({
            type: SAVED_COLLECTION_TYPES.CREATE,
            payload: res.data.collection
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const getCollections = (token) => async (dispatch) => {
    try {
        const res = await getDataAPI('saved_collections', token)
        dispatch({
            type: SAVED_COLLECTION_TYPES.GET,
            payload: res.data.collections
        })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const addToCollection = ({collectionId, postId, auth}) => async (dispatch) => {
    try {
        const res = await patchDataAPI(`saved_collections/${collectionId}/add`, { postId }, auth.token)
        dispatch({
            type: SAVED_COLLECTION_TYPES.ADD_POST,
            payload: { collectionId, postId, cover: res.data.collection.cover }
        })
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const removeFromCollection = ({collectionId, postId, auth}) => async (dispatch) => {
    try {
        await patchDataAPI(`saved_collections/${collectionId}/remove`, { postId }, auth.token)
        dispatch({
            type: SAVED_COLLECTION_TYPES.REMOVE_POST,
            payload: { collectionId, postId }
        })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const deleteCollection = ({collectionId, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await deleteDataAPI(`saved_collections/${collectionId}`, auth.token)
        dispatch({
            type: SAVED_COLLECTION_TYPES.DELETE,
            payload: collectionId
        })
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}
