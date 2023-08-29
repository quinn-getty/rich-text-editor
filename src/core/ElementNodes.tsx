import { css } from '@emotion/css'
import { ReactEditor, useFocused, useSelected, useSlateStatic } from 'slate-react'
import Button from './components/Button'
import Icon from './components/Icon'
import { Transforms } from 'slate'

export const ImageComponent = ({ attributes, children, element }: any) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}>
        <img
          src={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            display: ${selected && focused ? 'inline' : 'none'};
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}>
          <Icon>delete</Icon>
        </Button>
      </div>
    </div>
  )
}

export const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    className={css`
      font-size: 0;
    `}>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
)

export const LinkComponent = ({ attributes, children, element }: any) => {
  const selected = useSelected()
  return (
    <a
      {...attributes}
      href={element.url}
      className={
        selected
          ? css`
              box-shadow: 0 0 0 3px #ddd;
            `
          : ''
      }>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  )
}

export const EditableButtonComponent = ({ attributes, children }: any) => {
  return (
    /*
      Note that this is not a true button, but a span with button-like CSS.
      True buttons are display:inline-block, but Chrome and Safari
      have a bad bug with display:inline-block inside contenteditable:
      - https://bugs.webkit.org/show_bug.cgi?id=105898
      - https://bugs.chromium.org/p/chromium/issues/detail?id=1088403
      Worse, one cannot override the display property: https://github.com/w3c/csswg-drafts/issues/3226
      The only current workaround is to emulate the appearance of a display:inline button using CSS.
    */
    <span
      {...attributes}
      onClick={(ev) => ev.preventDefault()}
      // Margin is necessary to clearly show the cursor adjacent to the button
      className={css`
        margin: 0 0.1em;

        background-color: #efefef;
        padding: 2px 6px;
        border: 1px solid #767676;
        border-radius: 2px;
        font-size: 0.9em;
      `}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  )
}

export const BadgeComponent = ({ attributes, children, element }: any) => {
  const selected = useSelected()

  return (
    <span
      {...attributes}
      contentEditable={false}
      className={css`
        background-color: green;
        color: white;
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 0.9em;
        ${selected && 'box-shadow: 0 0 0 3px #ddd;'}
      `}
      data-playwright-selected={selected}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  )
}
