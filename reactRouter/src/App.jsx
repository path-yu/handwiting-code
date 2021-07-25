import React from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Route, Switch } from './react-router-dom';

function Home(){
  return <div>home</div>
}
function User() {
  return <div>User</div>;
}
function App() {
 
  return (
    <div className="App">
      <Router>
        <Link to="/">首页</Link>
        <div>43</div>
        <Link to="/user">用户中心</Link>
        <Switch>
          <Route exact path="/" component={Home}></Route>
          <Route path="/user" children={User}></Route>
          <Route>
            <div>404</div>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
function Detail(props) {
  console.log("Detail props", props); //sy-log
  return <div>Detail</div>;
}

function children(props) {
  console.log("children props", props); //sy-log

  return <div>children</div>;
}

function render(props) {
  console.log("render props", props); //sy-log
  return <div>render</div>;
}

export default App
