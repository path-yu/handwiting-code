import React, { useContext } from 'react';
import { RouterContext } from './RouterContext';

export default function Link({to,children,...resetProps}) {
    const context = useContext(RouterContext);
    const handleClick = e => {
        //阻止a标签默认事件
        e.preventDefault();
        context.history.push(to);
    }
    return (
        <a href={to} {...resetProps} onClick={handleClick}>{children}</a>
    );
}
