//import { h } from 'preact';
import style from './style.css';
import MultiSelectSort from 'async!../../components/MultiSelectSort';
import { UserContextProvider } from "../../components/UserHandler/UserContext";
import UserCookies from 'async!../../components/UserHandler/UserCookies';
import UserHandler from 'async!../../components/UserHandler';

const Home = () => (
	<div class={style.home}>
	     <h1>Home</h1>
	     <p>This is the Home component.</p>
             <div style="max-width:50%;"><MultiSelectSort /></div>
             <UserContextProvider>
                <UserHandler />
             </UserContextProvider>
             <UserCookies />
	</div>
);

export default Home;
