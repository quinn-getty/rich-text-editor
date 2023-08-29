import { Transforms, Editor, Range, Element as SlateElement } from 'slate'
import { ButtonElement, CustomEditor, ImageElement, LinkElement } from "./custom-types"
import isUrl from 'is-url'
import escapeHtml from 'escape-html'

export const withCustom = (editor: CustomEditor) => {
  const { insertData, insertText, isVoid, isInline, isElementReadOnly, isSelectable } = editor

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.isInline = (element) => ['link', 'button', 'badge'].includes(element.type) || isInline(element)

  editor.isElementReadOnly = (element) => element.type === 'badge' || isElementReadOnly(element)

  editor.isSelectable = (element) => element.type !== 'badge' && isSelectable(element)

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = (data) => {

    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url as string)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export const insertImage = (editor: CustomEditor, url: string) => {
  const text = { text: '' }
  const image: ImageElement = { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
}

export const insertLink = (editor: CustomEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}

export const insertButton = (editor: CustomEditor) => {
  if (editor.selection) {
    wrapButton(editor)
  }
}

export  const isLinkActive = (editor: CustomEditor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
  return !!link
}

export const isButtonActive = (editor: CustomEditor) => {
  const [button] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'button',
  })
  return !!button
}

export const isMarkActive = (editor:CustomEditor, format: unknown) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

export const toggleMark = (editor:CustomEditor, format: string) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const LIST_TYPES = ['numbered-list', 'bulleted-list']
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const isBlockActive = (editor: CustomEditor, format: any, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )
  return !!match
}

export const toggleBlock = (editor: CustomEditor, format:any) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
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


export const unwrapLink = (editor: CustomEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
}

export const unwrapButton = (editor: CustomEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'button',
  })
}

const wrapLink = (editor: CustomEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

const wrapButton = (editor: CustomEditor) => {
  if (isButtonActive(editor)) {
    unwrapButton(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const button: ButtonElement = {
    type: 'button',
    children: isCollapsed ? [{ text: 'Edit me!' }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, button)
  } else {
    Transforms.wrapNodes(editor, button, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

const getElementChildren = (nodes?: any[]):string => {
  return (
    nodes
      ?.map((node) => {
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

        if(node.type === "link"){
          return `<a data-slate-node="element" data-slate-inline="true" href="${node.url}">${getElementChildren(node.children)}</a>`
        } else if(node.type ==='list-item'){
          return `<li data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(node.children)}</li>`
        } else {
          return `<span data-slate-node="text">${string}</span>`
        }
      })
      .join('') || '<span data-slate-node="text"> </span>'
  )
}

export const serializeToHTML = (nodes?: any[]): string => {
  return (
    nodes
      ?.map((node) => {
        switch (node.type) {
          case 'block-quote':
            return `<blockquote data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(
              node.children
            )}</blockquote>`
          case "bulleted-list":
            return `<ul data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(node.children)}</ul>`
          case 'numbered-list':
            return `<ol data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(node.children)}</ol>`
          case 'list-item':
            return `<li data-slate-node="element" >${getElementChildren(node.children)}</li>`
          case 'heading-one':
            return `<h1 data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(node.children)}</h1>`
          case 'heading-two':
            return `<h2 data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(node.children)}</h2>`
          case "image":
            return `<img data-slate-node="element" src=${node.url} ></img>`
          default:
            return `<p data-slate-node="element" style="text-align: ${node?.align || ''};">${getElementChildren(node.children)}</p>`
        }
      })
      .join('') || ''
  )
}

export const normalizeToJSON = (htmlStirng: string) => {
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
      case 'img':
        return { type: 'image', children, url: element.getAttribute("src") }
      case 'a':
        return { type: 'link', children, url: element.getAttribute("href") }
      default:
        return { type: 'paragraph', children,align,  }
    }
  }
  const elementsParse = (nodes: NodeListOf<ChildNode>) => {
    const result: any[] = []
    nodes.forEach((element) => {
      if (element instanceof HTMLElement) {
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

