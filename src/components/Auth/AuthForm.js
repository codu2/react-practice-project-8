import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthContext from '../../store/auth-context';

import classes from './AuthForm.module.css';

const AuthForm = () => {
  const navigate = useNavigate();

  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = event => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    setIsLoading(true);

    let url;
    if(isLogin) {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[YOUR API KEY]';
    } else {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[YOUR API KEY]';
    }

    fetch(url, {
        method : 'POST',
        body : JSON.stringify({
          email : enteredEmail,
          password: enteredPassword,
          returnSecureToken: true
        }),
        headers : {
          'Content-Type' : 'application/json'
        }
      }).then((response) => {
          setIsLoading(false);
          if(response.ok) {
            return response.json();
          } else {
            return response.json().then(data => {
              let errorMessage = 'Authentication failed!';
              //if(data && data.error && data.error.message) {
              //  errorMessage = data.error.message;
              //}
              throw new Error(errorMessage);
            })
          }
        }
      ).then((data) => {
        console.log(data);
        const expirationTime = new Date(new Date().getTime() + (+data.expiresIn * 1000));
        //expiresIn: "3600", 현재 시간의 밀리초와 만료시간의 밀리초를 더해서 날짜 객체로 만든 다음 문자열로 바꿔서 파라미터로 넣어줌. data.expiresIn은 문자열이므로 +를 붙여 숫자로 변환해줌. 거기에 1000을 곱해 밀리초로 만들어줌
        authCtx.login(data.idToken, expirationTime.toISOString());
        navigate('/');
      }).catch(error => {
        alert(error.message);
      })
  }

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input ref={emailInputRef} type='email' id='email' required />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input ref={passwordInputRef} type='password' id='password' required />
        </div>
        <div className={classes.actions}>
          {!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
          {isLoading && <p>Sending request...</p>}
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
