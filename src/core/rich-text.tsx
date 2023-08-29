import { useCallback, useEffect, useMemo, useState } from 'react'
import isHotkey from 'is-hotkey'
import { Transforms, createEditor } from 'slate'
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react'
import { withHistory } from 'slate-history'
import { Toolbar } from './components/Toolbar'
import './rich-text.css'
import { normalizeToJSON, serializeToHTML, toggleMark, withCustom } from './utils'
import { BadgeComponent, EditableButtonComponent, ImageComponent, LinkComponent } from './ElementNodes'
import { AddLinkButton, BlockButton, InsertImageButton, MarkButton, RemoveLinkButton, ToggleEditableButtonButton } from './MenuButtons'

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
]

const RichText = ({
  placeholder,
  hiddenTool,
  textAreaStyle,
  readOnly,
  value,
  onChange,
}: {
  placeholder?: string
  textAreaStyle?: React.CSSProperties
  hiddenTool?: boolean
  readOnly?: boolean
  value?: string
  onChange?: (val: any[]) => void
}) => {
  const editor = useMemo(() => withCustom(withHistory(withReact(createEditor()))), [])
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])
  const [loading, serLoading] = useState(true)

  const [defaultValue, setDefaultValue] = useState<any[]>(() => initialValue)

  useEffect(() => {
    try {
      const nodes = normalizeToJSON(value || '') || initialValue
      setDefaultValue(nodes)
      console.log(nodes)
    } catch (error) {
      //
    }
    serLoading(false)
  }, [])

  return loading ? (
    <div
      style={{
        minHeight: '100px',
        padding: '4px',
        overflow: 'scroll',
        ...textAreaStyle,
      }}>
      loading
    </div>
  ) : (
    <Slate
      editor={editor}
      initialValue={defaultValue}
      onChange={(value) => {
        onChange?.(value)
        // const htmlstirng = serializeToHTML(value)
        // localStorage.setItem('htmlstirng', htmlstirng)
        // const htmlDom = document.querySelector('#html')
        // htmlDom && (htmlDom.innerHTML = htmlstirng)
        // const nodes = normalizeToJSON(htmlstirng)
        // console.log(nodes)
      }}>
      {readOnly ? null : hiddenTool ? null : (
        <Toolbar>
          <MarkButton format="bold" icon="format_bold" />
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
          <BlockButton format="justify" icon="format_align_justify" />
          <InsertImageButton />
          <AddLinkButton />
          <RemoveLinkButton />
          {/* <ToggleEditableButtonButton /> */}
        </Toolbar>
      )}
      <Editable
        style={{
          minHeight: '100px',
          padding: '4px',
          overflow: 'scroll',
          ...textAreaStyle,
        }}
        readOnly={readOnly}
        className="border-0 rich-text"
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
        renderLeaf={renderLeaf}
        renderElement={renderElement}
        placeholder={placeholder || 'Enter some text...'}
      />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    case 'link':
      return <LinkComponent {...props} />
    case 'button':
      return <EditableButtonComponent {...props} />
    case 'badge':
      return <BadgeComponent {...props} />
    case 'image':
      return <ImageComponent {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

// const initialValue: any[] = [
//   {
//     type: 'paragraph',
//     children: [
//       {
//         text: '加粗',
//         bold: true,
//       },
//       {
//         text: '斜体',
//         italic: true,
//       },
//       {
//         text: '下划',
//         underline: true,
//       },
//       {
//         text: '线',
//       },
//       {
//         text: ' code  ',
//         code: true,
//       },
//       {
//         type: 'link',
//         url: 'http:www.baidu.com',
//         children: [
//           {
//             code: true,
//             text: '链接',
//           },
//         ],
//       },
//       {
//         text: '',
//       },
//     ],
//   },
//   {
//     type: 'heading-two',
//     children: [
//       {
//         code: true,
//         text: 'H1',
//       },
//     ],
//   },
//   {
//     type: 'heading-two',
//     children: [
//       {
//         text: 'H2',
//       },
//     ],
//   },
//   {
//     type: 'image',
//     url: 'https://source.unsplash.com/zOwZKwZOZq8',
//     children: [
//       {
//         text: '',
//       },
//     ],
//   },
// ]

export default RichText
