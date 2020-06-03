// ------------------------------------
// Constants

// ------------------------------------
export const SIGNUP_REQUEST = "SIGNUP_REQUEST";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const SIGNUP_FAILURE = "SIGNUP_FAILURE";

// ------------------------------------
// Actions
// ------------------------------------

export async function businessSignup(data) {
  // Default options are marked with *
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch('/api/businessSignUp', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: myHeaders,
    // mode: 'no-cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: 'same-origin', // include, *same-origin, omit
    //redirect: 'follow', // manual, *follow, error
    //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  // return response.json(); // parses JSON response into native JavaScript objects
  if (response.status === 200) {
    return response.json()
  }
  else {
    console.log('error', response);
    return Promise.reject(response.json())
  }
}

export async function getFirebaseToken(profile) {  
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch('/api/createCustomToken', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: myHeaders,
    body: JSON.stringify(profile) // body data type must match "Content-Type" header
  });
  if (response.status === 200) {
    return response.json().then(data => ({ ...data, ...profile, email: data.email }))
  }
  else {
    console.log('error', response);
    return Promise.reject(response.body)
  }
}

// export function loginFirebaseWithLine(id) {
//   const firebase = useFirebase();
//   getLoginToken({ id }).then((token) => {
//     firebase
//       .login({ token: token.firebase_token })
//       .catch((err) => console.log(err));
//   });
// }

// ------------------------------------
// Specialized Action Creator
// ------------------------------------

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = null;
export default function userReducer(state = initialState, action) {
  if (action.type === SIGNUP_SUCCESS) console.log("user action", action);

  return action.type === SIGNUP_SUCCESS ? action.payload : state;
}
