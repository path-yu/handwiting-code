// import React from 'react'
// import ReactDOM from 'react-dom'
import React from './core/index';
import './index.css';
const ReactDOM = React;
class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }
  handleClick = () => {
    this.setState({
      count: this.state.count + 1,
    });
  };
  render() {
    return (
      <div>
        <p>{this.props.hello}</p>
        <h1>这是类组件,</h1>
        <h2 onClick={this.handleClick}>{this.state.count}</h2>
      </div>
    );
  }
}
Demo = React.useComponent(Demo);
function App(props) {
  const [count, setCount] = React.useState(1);
  console.log(count);
  return (
    <div id="container" className="red">
      <h1>
        {props.title}, {count}
        <Demo hello={'我是父组件传递给类子组件的props'}></Demo>
      </h1>
      <button onClick={() => setCount(count + 1)}>累加</button>
      <hr />
    </div>
  );
}

const ele = <div>
  <p>hello</p>
  <a href="www.baidu.com">百度一下</a>
</div>
ReactDOM.render(<App title='hello react' />, document.getElementById("root"));
