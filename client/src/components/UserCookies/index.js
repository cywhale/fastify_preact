import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
//import axios from 'axios'; //202012 try set cookies from server
import Cookies from 'universal-cookie';
import "../../style/style_usercookies.css";
import style from "./style.css";

const UserCookies = () => {
  const Nothing = () => null;
  const [root, setRoot] = useState(null);
  const [shown, setShown] = useState(true);
//const [cookie, setCookie] = useState({
//  //res: null,
//  state: false,
//});
  const cookies = new Cookies();
  const cookieRef = useRef(null);
  const cookieOpts = {
    path: "/",
    //expires: new Date(2020, 10, 20, 14, 20, 0, 30),
    secure: true, //active when use https
    sameSite: true,
  };
/*
  const axiosOpts = {
    headers: {
      "content-Type": "application/json",
      "Accept": "/",
      "Cache-Control": "no-cache"
//    "Cookie": cookies
    },
    credentials: "include", //"same-origin" //redirect: "follow" //mode: 'same-origin' in fetch
    withCredentials: true
  };
*/
  const setNoSecCookie = (c) => {
    //console.log('setcookies before:', cookies); //document.cookie);
    let cookie = c.split('=');//document.cookie;
    //document.cookie = cookies + ';' + c;
    cookies.set(cookie[0], cookie[1], cookieOpts);
    //console.log('setcookies after:', cookies.get(cookie[0], { doNotParse: true }));
  };

/* // move to UserLogin
  const initSessionx = async () => {
    try {
        const res = await axios.get("/sessioninfo", axiosOpts //, {
            //headers: {
            //    Cookie: "cookiepolycyagree=true;" //cookie2=value;
            //},
            //withCredentials:true }
          ) //.then...
        console.log("Debug get cookie response: ", res);
        return(
          setCookie((preState) => ({
            ...preState,
            res: res,
            state: 'done',
          }))
        );
    } catch (err) {
      console.log("Req cookie error: ", err);
      return(
          setCookie((preState) => ({
            ...preState,
            state: 'fail',
          }))
      );
    }
  };
*/
  const CookiePopup = () => {
    const [popup, setPopup] = useState({
      details: false
    });

    const clickClose = () => {
      //console.log('click close');
      setNoSecCookie('cookiepolycyagree=true');

      const d = document.getElementById('useCookies');
      render(<Nothing />, d, root);
      setShown(true);
    };

    const clickDetails = () => {
      //console.log('click details');
      setPopup( { details: true })
    };

    const details = popup.details;
    return(
        <div class={details? 'details':''}><p>
          <a class='close' onClick={clickClose}>×</a>
          This site uses cookies. By using our site, you acknowledge that you have read and understand our use of cookies.
          {!details? <a onClick={clickDetails}>» Find out more</a> : ''}
          {details && <p>
            We may collect and process non-personal information about your visit to this website, such as noting some of the pages you visit and some of the searches you perform. Such anonymous information is used by us to help improve the contents of the site and to compile aggregate statistics about individuals using our site for internal research purposes only. In doing this, we may install cookies. We DONT share these information with third parties, and DONT use them in advertising and marketing.
          </p>}</p>
        </div>
    );
  };

  const checkCookies = () => { //cookiepolycyagree should not be httpOnly
    let c = cookies.get('cookiepolycyagree', { doNotParse: true });
    console.log('Check Cookies initially: ', c)
    if (c !== null && c !== undefined) {
      return (c === true || c === 'true' || c[0] === true || c[0] === 'true');
    }
    return (false)
  }

  const initCookies = ()  => {
    if (!checkCookies()) {
      setShown(false);
      setRoot(render(<CookiePopup />, cookieRef.current));
    } /*else {
      setCookie((preState) => ({
        ...preState,
        state: true, //'existed',
      }))
    }*/
  };

  useEffect(() => {
    //initSession();
    initCookies();
  }, []);

  let showClass;
  if (shown) {
    showClass=`${style.cookiediv} ${style.shown}`;
  } else {
    showClass=`${style.cookiediv}`
  }

  return(
      <div id='useCookies' class={showClass} isShown={shown} ref={cookieRef} />
  );
};
export default UserCookies;
