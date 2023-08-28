import React, { useCallback, useMemo } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'

import { Editor, Transforms, createEditor, Descendant, Text, Node, Element as SlateElement, node } from 'slate'
import { withHistory } from 'slate-history'
import { Toolbar } from './components/Toolbar'
import Button from './components/Button'
import Icon from './components/Icon'
import escapeHtml from 'escape-html'

const serializeToHTML = (nodes?: Descendant[]): string => {
  return (
    nodes
      ?.map((node) => {
        if (Text.isText(node)) {
          let string = `<span data-slate-string="true">${escapeHtml(node.text)}</span>`
          if (node.bold) {
            string = `<strong>${string}</strong>`
          }

          if (node.code) {
            string = `<code>${string}</code>`
          }

          if (node.italic) {
            string = `<em>${string}</em>`
          }

          if (node.underline) {
            string = `<u>${string}</u>`
          }
          return `<span data-slate-node="text">${string}</span>`
        }
        const style = `text-align: ${node.align || ''};`
        const children = serializeToHTML(node.children)
        switch (node.type) {
          case 'block-quote':
            return `<blockquote data-slate-node="element" style="${style}">${children}</blockquote>`
          case 'bulleted-list':
            return `<ul data-slate-node="element" style="${style}">${children}</ul>`
          case 'numbered-list':
            return `<ol data-slate-node="element" style="${style}">${children}</ol>`
          case 'list-item':
            return `<li data-slate-node="element" style="${style}">${children}</li>`
          case 'heading-one':
            return `<h1 data-slate-node="element" style="${style}">${children}</h1>`
          case 'heading-two':
            return `<h2 data-slate-node="element" style="${style}">${children}</h2>`
          default:
            return `<p data-slate-node="element" style="${style}">${children}</p>`
        }
      })
      .join('') || ''
  )
}

const normalizeToJSON = (htmlStirng: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlStirng, 'text/html')
  const getElement = (element: HTMLElement) => {
    const align = element.style.textAlign
    const tagName = element.tagName.toLowerCase()
    const children = elementsParse(element.childNodes)
    switch (tagName) {
      case 'blockquote':
        return { type: 'block-quote', children, align }
      case 'ul':
        return { type: 'bulleted-list', children, align }
      case 'ol':
        return { type: 'numbered-list', children, align }
      case 'li':
        return { type: 'list-item', children, align }
      case 'h1':
        return { type: 'heading-one', children, align }
      case 'h2':
        return { type: 'heading-two', children, align }
      default:
        return { type: 'paragraph', children, align }
    }
  }
  const elementsParse = (nodes: NodeListOf<ChildNode>) => {
    console.log(nodes)
    const result: any[] = []
    nodes.forEach((element) => {
      if (element instanceof HTMLElement) {
        console.log(element.dataset.slateNode)
        if (element.dataset.slateNode === 'element') {
          result.push(getElement(element))
        } else if (element.dataset.slateNode === 'text') {
          const text = element.textContent
          const bold = element.getElementsByTagName('strong').length > 0
          const code = element.getElementsByTagName('code').length > 0
          const italic = element.getElementsByTagName('em').length > 0
          const underline = element.getElementsByTagName('u').length > 0
          return result.push({ text, bold, code, italic, underline })
        } else {
          return {
            text: element.textContent,
          }
        }
      }
    })
    return result
  }
  return elementsParse(doc.body.childNodes)
}

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const RichTextExample = () => {
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        const htmlstirng = serializeToHTML(value)
        const htmlDom = document.querySelector('#html')
        htmlDom && (htmlDom.innerHTML = htmlstirng)
        const node = normalizeToJSON(htmlstirng)
        // console.log(value)
        console.log(node)
      }}>
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
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
      />
    </Slate>
  )
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type')
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
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
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf }) => {
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

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type')}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}>
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}>
      <Icon>{icon}</Icon>
    </Button>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This is editable ',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
      {
        text: 'rich',
        bold: true,
        code: false,
        italic: false,
        underline: false,
      },
      {
        text: ' text, ',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
      {
        text: 'much',
        bold: false,
        code: false,
        italic: true,
        underline: false,
      },
      {
        text: ' better than a ',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
      {
        text: '<textarea>',
        bold: false,
        code: true,
        italic: false,
        underline: false,
      },
      {
        text: '!',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
    ],
    align: '',
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
      {
        text: 'bold',
        bold: true,
        code: false,
        italic: false,
        underline: false,
      },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
    ],
    align: '',
  },
  {
    type: 'block-quote',
    children: [
      {
        text: 'A wise quote.',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
    ],
    align: '',
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try it out for yourself!',
        bold: false,
        code: false,
        italic: false,
        underline: false,
      },
    ],
    align: 'center',
  },
]
// [
//   {
//     type: 'paragraph',
//     children: [
//       { text: 'This is editable ' },
//       { text: 'rich', bold: true },
//       { text: ' text, ' },
//       { text: 'much', italic: true },
//       { text: ' better than a ' },
//       { text: '<textarea>', code: true },
//       { text: '!' },
//     ],
//   },
//   {
//     type: 'paragraph',
//     children: [
//       {
//         text: "Since it's rich text, you can do things like turn a selection of text ",
//       },
//       { text: 'bold', bold: true },
//       {
//         text: ', or add a semantically rendered block quote in the middle of the page, like this:',
//       },
//     ],
//   },
//   {
//     type: 'block-quote',
//     children: [{ text: 'A wise quote.' }],
//   },
//   {
//     type: 'paragraph',
//     align: 'center',
//     children: [{ text: 'Try it out for yourself!' }],
//   },
// ]

export default RichTextExample
