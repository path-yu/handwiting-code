import React, { Component } from "react";
import { RouterContext } from "./RouterContext";
export default class Router extends Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }
  constructor(props) {
    super(props);
    this.state = { location: props.history.location, isRender: false };
    // 监听路由
    this.unListen = props.history.listen((location) => {
      if (this.state.isRender) {
        this.setState({ location });
      }
    });
  }
  componentWillUnmount() {
    if (this.unListen) {
      this.unListen();
    }
  }
  componentDidMount() {
    this.state.isRender = true;
  }
  render() {
    return (
      <RouterContext.Provider
        value={{
          history: this.props.history,
          location: this.state.location,
          match:Router.computeRootMatch
        }}
      >
        {this.props.children}
      </RouterContext.Provider>
    );
  }
}
