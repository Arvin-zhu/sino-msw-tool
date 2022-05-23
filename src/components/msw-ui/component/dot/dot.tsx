import React from 'react';
import './index.less';

export const MswDot = (props: {
  color: string;
  style?: React.CSSProperties;
}) => {
  const { color, style } = props;
  return (
    <span
      className="msw_dot"
      style={{ ...style, ...{ background: color } }}
    ></span>
  );
};
