import { HIGHLIGHT_TYPES } from '../actions/highlightAction'

const initialState = {
    highlights: [],
    loading: false
}

const highlightReducer = (state = initialState, action) => {
    switch (action.type) {
        case HIGHLIGHT_TYPES.GET:
            return {
                ...state,
                highlights: action.payload
            };
        case HIGHLIGHT_TYPES.CREATE:
            return {
                ...state,
                highlights: [...state.highlights, action.payload]
            };
        case HIGHLIGHT_TYPES.DELETE:
            return {
                ...state,
                highlights: state.highlights.filter(item => item._id !== action.payload)
            };
        case HIGHLIGHT_TYPES.UPDATE:
            return {
                ...state,
                highlights: state.highlights.map(item => 
                    item._id === action.payload._id ? action.payload : item
                )
            };
        default:
            return state;
    }
}

export default highlightReducer
