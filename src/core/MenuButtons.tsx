import isUrl from 'is-url'
import Button from './components/Button'
import Icon from './components/Icon'
import {
  TEXT_ALIGN_TYPES,
  insertButton,
  insertImage,
  insertLink,
  isBlockActive,
  isButtonActive,
  isLinkActive,
  isMarkActive,
  toggleBlock,
  toggleMark,
  unwrapButton,
  unwrapLink,
} from './utils'
import { useSlate, useSlateStatic } from 'slate-react'

export const InsertImageButton = () => {
  const editor = useSlateStatic()

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // const file = e.target.files?.[0]
    // if (!file) {
    //   return
    // }
    // toast({ description: 'uploading image', status: 'loading' })
    // const res = await uploadFile(file)
    // if (res.data.data) {
    //   toast.closeAll()
    //   toast({ description: 'upload success', status: 'success' })
    //   insertImage(editor as any, res.data.data)
    // } else {
    //   toast.closeAll()
    //   toast({ description: res.data.msg || 'upload error', status: 'error' })
    // }
  }

  return (
    <>
      <Button
        onMouseDown={(event: any) => {
          event.preventDefault()
          const url = window.prompt('Enter the URL of the image:')
          if (url && !isUrl(url)) {
            alert('URL is error')
            return
          }
          url && insertImage(editor, url)
        }}>
        <label htmlFor="edit-images-input">
          <Icon>image</Icon>
          {/* <input onChange={onChange} type="file" accept="image/*" id="edit-images-input" name="edit-images-input" hidden /> */}
        </label>
      </Button>
      <input />
    </>
  )
}

export const AddLinkButton = () => {
  const editor = useSlate()
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: any) => {
        event.preventDefault()
        const url = window.prompt('Enter the URL of the link:')
        if (!url) return
        insertLink(editor, url)
      }}>
      <Icon>link</Icon>
    </Button>
  )
}

export const ToggleEditableButtonButton = () => {
  const editor = useSlate()
  return (
    <Button
      active
      onMouseDown={(event: any) => {
        event.preventDefault()
        if (isButtonActive(editor)) {
          unwrapButton(editor)
        } else {
          insertButton(editor)
        }
      }}>
      <Icon>smart_button</Icon>
    </Button>
  )
}

export const RemoveLinkButton = () => {
  const editor = useSlate()

  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: any) => {
        event.preventDefault()
        if (isLinkActive(editor)) {
          unwrapLink(editor)
        }
      }}>
      <Icon>link_off</Icon>
    </Button>
  )
}

export const MarkButton = ({ format, icon }: { format: string; icon: string }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}>
      <Icon>{icon}</Icon>
    </Button>
  )
}

export const BlockButton = ({ format, icon }: { format: string; icon: string }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type')}
      onMouseDown={(event: any) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}>
      <Icon>{icon}</Icon>
    </Button>
  )
}
