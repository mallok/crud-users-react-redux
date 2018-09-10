import { emailPattern, passwordPattern, namePattern, CALL_API } from '../constants/variables';

/**
 * Handle communication with web service
 *
 * @param {Object} callAPI
 * @param {Object} next
 * @param {Object} actionWith
 * @param {Object} store
 */
export const api = async (callAPI, next, actionWith, store) => {
  const [requestType, successType, failureType, nextType] = callAPI.types;

  try {
    const res = await fetch(callAPI.endpoint, {
      method: callAPI.method,
      headers: getHeaders(),
      body: JSON.stringify(callAPI.payload),
    });
    const data = await res.json();
    if (res.ok) {
      next(
        actionWith({
          data,
          type: successType,
        })
      );
      if (nextType) {
        if (nextType.type === 'login') {
          store.dispatch(nextType.action(data.email, data.password));
        } else {
          store.dispatch(nextType.action());
        }
      }
    } else {
      next(
        actionWith({
          data,
          type: failureType,
          errors: ['Error with API, please try again'],
        })
      );
    }
  } catch (e) {
    next(
      actionWith({
        type: failureType,
        errors: [e.message || 'Error with API, please try again'],
      })
    );
  }
};
/**
 * Get headers
 * @return {Object} headers
 */
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    const tokenParsed = JSON.parse(token);
    headers.Authorization = `Bearer ${tokenParsed}`;
  }

  return headers;
};

// Default middleware
export default store => next => action => {
  const callAPI = action[CALL_API];

  if (callAPI) {
    const isValidForm = validate(callAPI.payload);
    const { types } = callAPI;
    const [requestType, successType, failureType, nextType] = types;
    const actionWith = data => {
      const finalAction = Object.assign({}, action, data);
      delete finalAction[CALL_API];
      return finalAction;
    };

    if (!isValidForm) {
      return next(actionWith({ type: failureType, errors: callAPI.payload.errors }));
    }

    next(actionWith({ type: requestType }));

    api(callAPI, next, actionWith, store);
  } else {
    return next(action);
  }
};

/**
 * Validate form data
 *
 * @param {Object} payload
 * @return {Boolean}
 */
const validate = payload => {
  let res;
  let regex;
  payload.errors = [];

  for (const key in payload) {
    if (payload.hasOwnProperty(key)) {
      const element = payload[key];
      switch (key) {
        case 'password':
          regex = RegExp(passwordPattern);
          res = regex.test(element);
          if (!res) {
            payload.errors.push(
              'Minimum eight characters, at least one letter, one number and one special'
            );
          }
          break;
        case 'email':
          regex = RegExp(emailPattern);
          res = regex.test(element);
          if (!res) {
            payload.errors.push('Must be a valid Email');
          }
          break;
        case 'name':
          regex = RegExp(namePattern);
          res = regex.test(element);
          if (!res) {
            payload.errors.push('Must be a valid Name');
          }
          break;

        default:
          break;
      }
    }
  }
  return payload.errors.length === 0;
};
