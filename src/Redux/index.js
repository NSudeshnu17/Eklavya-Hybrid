import { createStore, applyMiddleware, compose, } from "redux";
import rootreducer from "./Reducers/index.js"
// import thunk from "redux-thunk";
import rootSaga from "./saga/index";
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
// import { composeWithDevTools } from "redux-devtools-extension";
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: hardSet
}
const persistedReducer = persistReducer(persistConfig, rootreducer)

const composeEnhancers =  compose;
const sagaMiddleware = createSagaMiddleware();


const store = createStore(rootreducer,composeEnhancers(applyMiddleware(sagaMiddleware)));
// let persistor = persistStore(store)
sagaMiddleware.run(rootSaga);

// export {persistor}
export default store;
