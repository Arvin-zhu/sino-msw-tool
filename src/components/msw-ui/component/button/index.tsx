import React from 'react';
import './index.less';
//@ts-ignore
import loadingIcon from '../../images/loading.png';
import clsx from 'clsx';
export const Button: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle';
  className?: string;
  style?: React.CSSProperties;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}> = props => {
  const {
    isLoading,
    disabled,
    className,
    onClick,
    style = {},
    size = 'middle'
  } = props;
  return (
    <button
      style={{ ...style }}
      className={clsx('msw_btn', className || '', {
        msw_btn_disabled: isLoading || disabled,
        small: size === 'small'
      })}
      onClick={e => {
        !disabled && !isLoading && onClick(e);
      }}
    >
      <div className={clsx('msw_btn_content_wrap')}>
        {isLoading && (
          <img
            className={'loading'}
            style={{ width: 14, marginRight: 5 }}
            src={loadingIcon}
            alt={''}
          />
        )}
        {props.children}
      </div>
    </button>
  );
};
