//use hooks for https://jsfiddle.net/vittore/nyrmcmcy/2/
/** @jsx h */
import { render } from 'preact'; //Fragment
import { useState, useEffect, useRef } from 'preact/hooks'; //useCallback
import Cookies from 'universal-cookie';
//import { nanoid } from 'nanoid';
import "../../style/style_usercookies.css";
import style from "./style_cookiediv";

const UserCookies = (props) => {
  const { userCallback } = props;
  const cookies = new Cookies();
  const Nothing = () => null;
  const [root, setRoot] = useState(null);
  const [shown, setShown] = useState(true);
  const cookieOpts = {
    path: "/",
    //expires: new Date(2020, 10, 20, 14, 20, 0, 30),
    secure: true,
    samSite: true,
  };
  /*const ucodelen = 32;
  const [ucode, setUcode] = useState({
    str: '',
    //expired:
  }); */
  const cookieRef = useRef(null);

  const setCookie = (c) => {
    //console.log('setcookies before:', cookies); //document.cookie);
    let cookie = c.split('=');//document.cookie;
    //document.cookie = cookies + ';' + c;
    cookies.set(cookie[0], cookie[1], cookieOpts);
    //console.log('setcookies after:', cookies.get(cookie[0], { doNotParse: true }));
  };

  const CookiePopup = () => {
    const [popup, setPopup] = useState({
      details: false
    });

    const clickClose = (allow) => {
      //console.log('click close');
      const d = document.getElementById('useCookies');
      //if (!state.close) {
      if (allow) {
        setCookie('useragree=true'); // + ((allow)? 'true' : 'false'));
      }
      render(<Nothing />, d, root);
      setShown(true);
      return(
        userCallback((preState) => ({
           ...preState,
           saveAgree: allow
        }))
      );
    };

    const clickDetails = () => {
      //console.log('click details');
      setPopup( { details: true }) //this.
    };

    //render(props, state) {
    const details = popup.details;
    return(
        <div class={details? 'details':''}><p>
          <a class='close' onClick={() => {clickClose(false)}} aria-label='Decline web local storage 不使用客戶端儲存' style='margin-left:21px'>×</a>
          <a class='close' onClick={() => {clickClose(true)}} aria-label='Accept web local storage 使用客戶端儲存' style='padding:0.4px 3.2px;'>&#10004;</a>
          This site uses web local storage, i.e., cookies and indexedDB. By using our website, you acknowledge that you have read and understand our use of web local storage. 
          {!details? <a onClick={clickDetails}>» Find out more</a> : ''}
          {details && <p>
            Preferred settings of this website needs write-permission of web local storage. You can accept or decline it. Besides, We may collect and process non-personal information about your visit to this website, such as counts of resource usage or keyword searches. Such anonymous information is used by us to help improve our contents and to compile aggregate statistics about individuals using our site for internal research purposes only. We DONT share these information with third parties, and DONT use them in advertising and marketing.
          </p>}</p>
        </div>
    );
  };

  const checkCookies = () => {
    let c = cookies.get('useragree', { doNotParse: true });
    console.log('Check Cookies initially: ', c)
    //return (c.indexOf('cookiepolycyagree=true') > -1);
    if (c !== null && c !== undefined) {
      userCallback((preState) => ({
           ...preState,
           saveAgree: c === true || c === 'true' || c[0] === true || c[0] === 'true'
      }));
      return (true);
    }
    return (false);
  }

  const initCookies = ()  => {
    if (!checkCookies()) {
      setShown(false);
      setRoot(render(<CookiePopup />, cookieRef.current)); //document.getElementById('useCookies')));
    }
  };
/*
  const fetchingUcode = (leng=32) => nanoid(leng);

  const setWithUcode = useCallback(() => {
    const checkUcode = () => {
      let uget = false;
      let uc = cookies.get('ucode', { doNotParse: true });
      console.log('Check ucode availability: ', uc)
      if (uc !== null && uc != undefined) {
        uget = uc && uc !== '' && uc.length === ucodelen;
      }
      if (!uget) {
        uc = fetchingUcode(ucodelen);
        cookies.set('ucode', uc, cookieOpts);
      }
      setUcode((preState) => ({
          ...preState,
          str: uc
      }));
    };

    checkUcode();
    console.log(ucode.str);
  }, [ucode]);
*/

  useEffect(() => {
    //if (root === null) {
    initCookies();
  }, []);

  let showClass;
  if (shown) {
    showClass=`${style.cookiediv} ${style.shown}`;
  } else {
    showClass=`${style.cookiediv}`
  }
  //console.log("showClass: " + showClass + " when isShown is: " + shown);
/*
    <Fragment>
      <div>
        <button onClick={() => setWithUcode()}>Sign In</button>
      </div>
    </Fragment>
*/
  return(
      <div id='useCookies' class={showClass} isShown={shown} ref={cookieRef} />
  );
};
export default UserCookies;
