(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', '../types', 'immutable'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('../types'), require('immutable'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.types, global.immutable);
    global.reducerHandler = mod.exports;
  }
})(this, function (exports, _types, _require) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = reducerHandler;

  var _types2 = _interopRequireDefault(_types);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var Map = _require.Map;
  var SET_DOCUMENT = _types2.default.SET_DOCUMENT,
      CLEAN_DOCUMENT = _types2.default.CLEAN_DOCUMENT,
      CLEAN_ALL_DOCUMENTS = _types2.default.CLEAN_ALL_DOCUMENTS,
      UPDATE_DOC_FIELD = _types2.default.UPDATE_DOC_FIELD;

  // This is not a reducer, return null if it is not a relevant action.

  function reducerHandler(state, action) {
    var payload = action.payload;

    var _ref = payload || {},
        targetName = _ref.targetName,
        status = _ref.status,
        data = _ref.data,
        info = _ref.info,
        error = _ref.error;

    switch (action.type) {
      case SET_DOCUMENT:
        {
          var documents = state.documents.get(targetName);
          var nextState = state;
          if (!documents) {
            nextState = nextState.setIn(['documents', targetName], Map());
          }
          if ('status' in payload) {
            nextState = nextState.setIn(['documents', targetName, 'status'], status);
          }
          if ('data' in payload) {
            nextState = nextState.setIn(['documents', targetName, 'data'], Map(data));
          }
          if ('info' in payload) {
            nextState = nextState.setIn(['documents', targetName, 'info'], info);
          }
          if ('error' in payload) {
            nextState = nextState.setIn(['documents', targetName, 'error'], error);
          }
          return nextState;
        }
      case UPDATE_DOC_FIELD:
        {
          var _documents = state.documents.get(targetName);
          var _nextState = state;
          if (!_documents) {
            _nextState = _nextState.setIn(['documents', targetName], Map());
          }
          _nextState = _nextState.setIn(['documents', targetName, 'data', action.key], action.value);
          return _nextState;
        }
      case CLEAN_DOCUMENT:
        {
          var _documents2 = state.documents.delete(targetName);
          return state.set('documents', _documents2);
        }
      case CLEAN_ALL_DOCUMENTS:
        {
          return state.set('documents', Map());
        }
      default:
        return null;
    }
  }
});