import { useMemo, useState } from 'react'
import { createEditor, Descendant, Text, Node } from 'slate'
import escapeHtml from 'escape-html'
import { Editable, Slate, withReact } from 'slate-react'
// Define a serializing function that takes a value and returns a string.
const serialize = (value: Descendant[]) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join('\n')
  )
}

const serializeItem = (node?: Descendant) => {
  if (Text.isText(node)) {
    const string = escapeHtml(node.text)
    // if (node.bold) {
    //   string = `<strong>${string}</strong>`
    // }
    console.log(string)
    return string
  }
  console.log(node)
  const children = serializeHTML(node?.children)
  switch (node?.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`
    case 'paragraph':
      return `<p>${children}</p>`
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

const serializeHTML = (nodes?: Descendant[]): string => {
  const result = ''
  nodes?.map((n) => serializeItem(n)).join('')
  return result
}
// if (Text.isText(node)) {
//   let string = escapeHtml(node.text)
//   if (node.bold) {
//     string = `<strong>${string}</strong>`
//   }
//   return string
// }
// const children = node.children?.map((n) => serialize(n)).join('')
// switch (node.type) {
//   case 'quote':
//     return `<blockquote><p>${children}</p></blockquote>`
//   case 'paragraph':
//     return `<p>${children}</p>`
//   case 'link':
//     return `<a href="${escapeHtml(node.url)}">${children}</a>`
//   default:
//     return children
// }
// }

// Define a deserializing function that takes a string and returns a value.
const deserialize = (string: string): Descendant[] => {
  // Return a value array of children derived by splitting the string.
  // return string.split('\n').map((line) => {
  //   return {
  //     children: [{ text: line }],
  //   }
  // })
  return JSON.parse(string)
}

const PasteHtmlExample = () => {
  const [editor] = useState(() => withReact(createEditor()))
  // Use our deserializing function to read the data from Local Storage.
  const initialValue = useMemo(() => deserialize(localStorage.getItem('content') || '') as Descendant[], [])
  console.log(initialValue)

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        console.log(serializeHTML(value))

        const isAstChange = editor.operations.some((op) => 'set_selection' !== op.type)
        if (isAstChange) {
          // Serialize the value and save the string value to Local Storage.
          localStorage.setItem('content', serialize(value))
        }
      }}>
      <Editable />
    </Slate>
  )
}

export default PasteHtmlExample
