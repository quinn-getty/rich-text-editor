// import IFrameExample from '../core'
import IFrameExample from '../core'
import PasteHtmlExample from '../core/paste-html'
import RichTextExample from '../core/rich-text'

const Demo = () => {
  return (
    <>
      <IFrameExample />
      <div className="w-full h-1 my-5 py-5 bg-black">--------</div>
      <PasteHtmlExample />
      <div className="w-full h-1 my-5 py-5 bg-black">--------</div>
      <RichTextExample />
      <div id="html" className="p-2 bg-slate-500 w-full"></div>
    </>
  )
}

export default Demo
