

import * as types from "../Actions/DemoActions";

const initialState = {
    state1: '',
    isLoggedIn:false,
    navbar : false,
    changeslide : 0,
    slide_info : [
        { id: 1, name: "piyush", page_no: 0 },
        { id: 2, name: "komal", page_no: 0 },
        { id: 3, name: "KP", page_no: 0 },
        { id: 4, name: "Jitendra", page_no: 0 }
      ]

}



export default function DemoState(state = initialState, actions) {
    switch (actions.type) {
        case types.UPDATE_DEMO: return {
            ...state,
            state1 : actions.payload
        }
        case types.UPDATE_LOGIN: return {
            ...state,
            isLoggedIn:actions.payload
        }
        case types.UPDATE_NAVBAR: return {
            ...state,
            navbar : actions.payload
        }
        case types.SLIDER_CHNAGE : return {
            ...state,
            changeslide : actions.payload
        }
        case types.SLIDER_INFO : return {
            ...state,
            slide_info : actions.payload
        }
        default: return {
            ...state
        }
    }

}