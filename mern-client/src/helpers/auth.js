import cookie from "js-cookie";

//set in cookie
export const setCookie = (key, value) => {
    if (window) {
        cookie.set(key, value, {
            //1 day
            expires: 1
        })
    }
}

//Remove from cookie
export const removeCookie = (key) => {
    if (window) {
        cookie.remove(key, {
            expires: 1
        })
    }
}

//get cookie
export const getCookie = (key) => {
    if (window) {
        return cookie.get(key)
    }
}

//store in local storage
export const setLocalStorage = (key, value) => {
    if (window) {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

//remove from localstorage
export const removeLocalStorage = (key) => {
    if (window) {
        localStorage.removeItem(key)
    }
}

//authenticate user after login
export const authenticate = (response, next) => {
    const { data } = response;
    const { token, user } = data;
    setCookie("token", token);
    setLocalStorage("user", user);
    next();
}

//get user info from localstorage
export const isAuth = () => {
    if (window) {
        const cookieChecked = getCookie("token")
        if (cookieChecked) {
            if (localStorage.getItem("user")) {
                return JSON.parse(localStorage.getItem("user"))
            } else {
                return false;
            }
        }
    }
}

export const signout = next => {
    removeCookie('token');
    removeLocalStorage('user');
    next();
};

//update user data in local storage
export const updateUser = (response, next) => {
    if (window) {
        let auth = JSON.parse(localStorage.getItem("user"))
        auth = response.data;
        localStorage.setItem("user", JSON.stringify(auth))
    }
    next()
}