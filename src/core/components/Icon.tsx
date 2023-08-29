import { Ref, PropsWithChildren, forwardRef } from 'react'
import { BaseProps } from '../type'
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdCode,
  MdLooksOne,
  MdLooksTwo,
  MdFormatQuote,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  // MdDeleteOutline,
  MdImage,
  MdDelete,
  MdLink,
  MdLinkOff,
  MdOutlineSmartButton,
} from 'react-icons/md'

{
  /* <MarkButton format="bold" icon="format_bold" />
<MarkButton format="italic" icon="format_italic" />
<MarkButton format="underline" icon="format_underlined" />
<MarkButton format="code" icon="code" />
<BlockButton format="heading-one" icon="looks_one" />
<BlockButton format="heading-two" icon="looks_two" />
<BlockButton format="block-quote" icon="format_quote" />
<BlockButton format="numbered-list" icon="format_list_numbered" />
<BlockButton format="bulleted-list" icon="format_list_bulleted" />
<BlockButton format="left" icon="format_align_left" />
<BlockButton format="center" icon="format_align_center" />
<BlockButton format="right" icon="format_align_right" />
<BlockButton format="justify" icon="format_align_justify" /> */
}

export const Icon = forwardRef(({ className, name, children, ...props }: PropsWithChildren<BaseProps>, ref?: Ref<HTMLSpanElement>) => {
  const getIcon = () => {
    switch (children || name) {
      case 'format_bold':
        return <MdFormatBold />
      case 'format_italic':
        return <MdFormatItalic />
      case 'format_underlined':
        return <MdFormatUnderlined />
      case 'code':
        return <MdCode />
      case 'looks_one':
        return <MdLooksOne />
      case 'looks_two':
        return <MdLooksTwo />
      case 'format_quote':
        return <MdFormatQuote />
      case 'format_list_numbered':
        return <MdFormatListBulleted />
      case 'format_list_bulleted':
        return <MdFormatListNumbered />
      case 'format_align_left':
        return <MdFormatAlignLeft />
      case 'format_align_center':
        return <MdFormatAlignCenter />
      case 'format_align_right':
        return <MdFormatAlignRight />
      case 'format_align_justify':
        return <MdFormatAlignJustify />
      case 'image':
        return <MdImage />
      case 'delete':
        return <MdDelete />
      case 'link':
        return <MdLink />
      case 'link_off':
        return <MdLinkOff />
      case 'smart_button':
        return <MdOutlineSmartButton />
    }
  }
  return (
    <span {...props} ref={ref} className={`material-icons ${className} align-text-bottom`}>
      {getIcon()}
    </span>
  )
})

export default Icon
