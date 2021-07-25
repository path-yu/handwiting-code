import React from "react";
import matchPath from "./matchPath";
import { RouterContext } from "./RouterContext";

export default function Route(props) {
  return (
    <RouterContext.Consumer>
      {(context) => {
        const { location } = context;
        const { path, component, render, children, computeMatch } = props;
        const match = computeMatch
          ? computeMatch
          : path
          ? matchPath(location.pathname, props)
          : context.match;
        const newProps = { ...context, location, match };
        // children => component => render
        //match children 》 component》 render 》null
        // 不match children(function) > null
        return match
          ? children
            ? typeof children === "function"
              ? children(newProps)
              : children
            : component
            ? React.createElement(component, newProps)
            : render
            ? render(newProps)
            : null
          : typeof children === "function"
          ? children(newProps)
          : null;
      }}
    </RouterContext.Consumer>
  );
}
