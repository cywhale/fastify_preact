
export default async function sessionInfo(url, action, userCallback, method='POST', body={action: action}) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    try {
      await fetch(url, {
        method: method,
        mode: 'same-origin',
        redirect: 'follow',
        credentials: 'include',
        withCredentials: true,
        headers: headers,
        body: JSON.stringify(body)
        //{
        //action: action
          //cookies: 'ucode',
          //value: ucstr
        //})
      })
      .then((res) => {
        //console.log("Debug get cookie response: ", res);
        return(
          userCallback((preState) => ({
            ...preState,
            //res: res,
            session: action,
          }))
        )
      });
    } catch(err) {
      console.log("Auth failed when ", action, err);
    }
  };

