import { useCallback, useEffect, useRef } from 'react';

type posType = { posX: number; posY: number };
export const useDrag = () => {
  const dragRef = useRef<HTMLDivElement>(null);
  const pos = useRef<posType | null>(null);
  const initPos = useRef<posType | null>(null);
  const handlePosition = useCallback((e: any) => {
    console.log('===render=mo', initPos);
    pos.current = {
      posX: e.screenX - initPos.current.posX,
      posY: e.screenY - initPos.current.posY,
    };
  }, []);
  const onMouseDown = useCallback((e: any) => {
    const offsetLeft = e.target.getBoundingClientRect().left;
    const offsetTop = e.target.getBoundingClientRect().top;
    pos.current = {
      posX: offsetLeft,
      posY: offsetTop,
    };
    initPos.current = {
      posX: e.screenX,
      posY: e.screenY,
    };
    dragRef.current?.addEventListener('mousemove', onMouseMove);
    dragRef.current?.addEventListener('mouseup', onMouseUp);
    dragRef.current?.addEventListener('mouseleave', onMouseUp);
  }, []);
  const onMouseMove = useCallback((e: any) => {
    handlePosition(e);
  }, []);
  const onMouseUp = useCallback(() => {
    dragRef.current?.removeEventListener('mousemove', onMouseMove);
    dragRef.current?.removeEventListener('mouseup', onMouseUp);
    dragRef.current?.removeEventListener('mouseleave', onMouseUp);
  }, []);
  useEffect(() => {
    dragRef.current?.addEventListener('mousedown', onMouseDown);
    return () => {
      onMouseUp();
    };
  }, []);
  return {
    dragRef,
    pos: pos.current
      ? {
          posX: pos.current?.posX,
          posY: pos.current?.posY,
        }
      : pos.current,
  };
};
