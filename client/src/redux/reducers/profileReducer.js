import { PROFILE_TYPES } from '../actions/profileAction'
import { EditData } from '../actions/globalTypes'

const initialState = {
    loading: false,
    ids: [],
    users: [],
    posts: []
}

const profileReducer = (state = initialState, action) => {
    switch (action.type){
        case PROFILE_TYPES.LOADING:
            return {
                ...state,
                loading: action.payload
            };
        case PROFILE_TYPES.GET_USER:
            return {
                ...state,
                users: state.users.every(user => user._id !== action.payload.user._id)
                    ? [...state.users, action.payload.user]
                    : EditData(state.users, action.payload.user._id, action.payload.user)
            };
        case PROFILE_TYPES.FOLLOW:
            return {
                ...state,
                users: EditData(state.users, action.payload._id, action.payload)
            };
        case PROFILE_TYPES.UNFOLLOW:
            return {
                ...state,
                users: EditData(state.users, action.payload._id, action.payload)
            };
        case PROFILE_TYPES.GET_ID:
            return {
                ...state,
                ids: state.ids.every(id => id !== action.payload)
                    ? [...state.ids, action.payload]
                    : state.ids
            };
        case PROFILE_TYPES.GET_POSTS:
            return {
                ...state,
                posts: state.posts.every(post => post._id !== action.payload._id)
                    ? [...state.posts, action.payload]
                    : EditData(state.posts, action.payload._id, action.payload)
            };
        case PROFILE_TYPES.UPDATE_POST:
            return {
                ...state,
                posts: EditData(state.posts, action.payload._id, action.payload)
            };
        default:
            return state;
    }
}

export default profileReducer