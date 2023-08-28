import { PropsWithChildren, Ref, forwardRef } from 'react'
import { BaseProps } from '../type'

export const Menu = forwardRef(({ className, ...props }: PropsWithChildren<BaseProps>, ref?: Ref<HTMLDivElement>) => (
  <div
    {...props}
    data-test-id="menu"
    ref={ref}
    className={`${className || ''} flex flex-wrap gap-1 `}
    //   className={cx(
    //     className,
    //     css`
    //       & > * {
    //         display: inline-block;
    //       }

    //       & > * + * {
    //         margin-left: 15px;
    //       }
    //     `
    //   )}
  />
))

export default Menu
