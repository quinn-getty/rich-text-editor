import React, { PropsWithChildren, Ref } from 'react'
import { BaseProps } from '../type'

const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean
        reversed: boolean
      } & BaseProps
    >,
    ref?: Ref<HTMLSpanElement>
  ) => (
    <span
      {...props}
      ref={ref}
      className={`${className || ''} cursor-pointer p-1 rounded ${
        reversed ? (active ? 'text-white' : 'text-[#aaa]') : active ? 'text-black bg-slate-300' : 'text-[#ccc]'
      }`}
    />
  )
)
export default Button
