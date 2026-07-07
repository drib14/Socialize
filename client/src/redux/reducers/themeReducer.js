import { GLOBALTYPES } from '../actions/globalTypes'

const initialState = localStorage.getItem('theme') === 'true'

const themeReducer = (state = initialState, action) => {
    switch (action.type){
        case GLOBALTYPES.THEME:
            localStorage.setItem('theme', action.payload);
            return action.payload;
        default:
            return state;
    }
}


export default themeReducer