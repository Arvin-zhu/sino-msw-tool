import { useCallback, useEffect, useRef, useState } from 'react';

type posType = { posX: number; posY: number };
export const useDrag = (isClickCallback: () => void) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<posType | null>(null);
  const initPos = useRef<(posType & { offsetInitX?: number; offsetInitY?: number }) | null>(null);
  const isDragRef = useRef(false);
  const handlePosition = useCallback((e: any) => {
    setPos((prePos) => ({
      posX: e.pageX - initPos.current.posX + (prePos?.posX || initPos.current.offsetInitX),
      posY: e.pageY - initPos.current.posY + (prePos?.posY || initPos.current.offsetInitY),
    }));
    initPos.current = {
      posX: e.pageX,
      posY: e.pageY,
    };
  }, []);
  const onMouseDown = useCallback((e: any) => {
    initPos.current = {
      posX: e.pageX,
      posY: e.pageY,
      offsetInitX: e.pageX - e.target.offsetWidth / 2,
      offsetInitY: e.pageY - e.target.offsetHeight / 2,
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseUp);
  }, []);
  const onMouseMove = useCallback((e: any) => {
    document.body.style.userSelect = 'none';
    isDragRef.current = true;
    handlePosition(e);
  }, []);
  const onMouseUp = useCallback((e?: any) => {
    e?.target.className.includes('msw_container_circle') &&
      !isDragRef.current &&
      isClickCallback?.();
    document.body.style.userSelect = 'auto';
    isDragRef.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseUp);
  }, []);
  useEffect(() => {
    dragRef.current?.addEventListener('mousedown', onMouseDown);
    return () => {
      onMouseUp();
    };
  }, []);
  return {
    dragRef,
    pos,
  };
};
