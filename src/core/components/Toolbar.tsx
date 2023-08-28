import { PropsWithChildren, Ref, forwardRef } from 'react'
import { BaseProps } from '../type'
import Menu from './Menu'

export const Toolbar = forwardRef(({ className, ...props }: PropsWithChildren<BaseProps>, ref?: Ref<HTMLDivElement>) => (
  <Menu {...props} ref={ref} className={`${className} relative pt-0.5 py-5 pb-4 my-5 mb-5 border-b-[#eee] border-b-2`} />
))
