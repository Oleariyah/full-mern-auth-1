import React, { useRef } from 'react'
import { Auth, Activation, ResetPassword } from "./pages";
import { Route, Switch } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import './styles/App.css';

function App() {
  const ref = useRef(null)

  return (
    <div className="container">
      <LoadingBar color='#0366d6' ref={ref} />
      <Switch>
        <Route exact path="/" render={() => <Auth />} />
        <Route exact path="/activate" render={() => <Activation />} />
        <Route exact path="/reset" render={() => <ResetPassword />} />
      </Switch>
    </div>
  );
}

export default App;
