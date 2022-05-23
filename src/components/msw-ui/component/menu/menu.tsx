import React from 'react';
import './index.less';

export const Menu = (props: {
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) => {
  const { options, onChange } = props;
  return (
    <>
      {options?.map((im) => {
        return (
          <div
            className="msw_menu_item"
            onClick={() => onChange(im.value)}
            key={im.value}
          >
            {im.label}
          </div>
        );
      })}
    </>
  );
};
