import clsx from 'clsx';
import React, { ChangeEvent, useRef } from 'react';
import './index.less';

export const Input = (props: {
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { onChange, value, placeholder, style, className } = props;
  return (
    <input
      value={value}
      ref={inputRef}
      onChange={(e) => onChange?.(e)}
      placeholder={placeholder}
      style={style}
      className={clsx('msw-input', className)}
    />
  );
};
