import { SAVED_COLLECTION_TYPES } from '../actions/savedCollectionAction'

const initialState = {
    collections: [],
    loading: false
}

const savedCollectionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVED_COLLECTION_TYPES.GET:
            return {
                ...state,
                collections: action.payload
            };
        case SAVED_COLLECTION_TYPES.CREATE:
            return {
                ...state,
                collections: [action.payload, ...state.collections]
            };
        case SAVED_COLLECTION_TYPES.DELETE:
            return {
                ...state,
                collections: state.collections.filter(item => item._id !== action.payload)
            };
        case SAVED_COLLECTION_TYPES.ADD_POST:
            return {
                ...state,
                collections: state.collections.map(col => 
                    col._id === action.payload.collectionId 
                    ? {
                        ...col,
                        cover: action.payload.cover || col.cover,
                        posts: [...col.posts, action.payload.postId]
                      }
                    : col
                )
            };
        case SAVED_COLLECTION_TYPES.REMOVE_POST:
            return {
                ...state,
                collections: state.collections.map(col => 
                    col._id === action.payload.collectionId 
                    ? { ...col, posts: col.posts.filter(pid => pid !== action.payload.postId) }
                    : col
                )
            };
        default:
            return state;
    }
}

export default savedCollectionReducer
