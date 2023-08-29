export interface BaseProps {
  className: string
  [key: string]: unknown
}

export type OrNull<T> = T | null

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underline?: boolean
  text: string
}

export enum ElementTextAlign {
  left = "left",
  center = "center",
  right = "right",
  justify = "justify"
}



// 节点类型
export enum ElementType{
  blockQuote = "block-quote", // 引用
  headingOne = "heading-one", // 标题一
  headingTwo = "heading-two", // 标题二
  headingThree = "heading-three", // 标题三
  headingFour = "heading-four", // 标题四
  headingFive = "heading-five", // 标题五
  headingSix = "heading-six", // 标题六
  bulletedList = "bulleted-list",  // 无序列表
  numberedList = "numbered-list",  // 有序列表
  listItem = "list-item",  // 列表item
  paragraph = "paragraph",  // 段落 p
  checkListItem ="check-list-item",
  editableVoid = "editable-void",
  image = "image" // 图片
} 

export enum BolckFormatType {
  blockQuote = ElementType.blockQuote,
  headingOne = ElementType.headingOne,
  headingTwo = ElementType.headingTwo,
  headingThree = ElementType.headingThree,
  headingFour = ElementType.headingFour,
  headingFive = ElementType.headingFive,
  headingSix = ElementType.headingSix,
  bulletedList = ElementType.bulletedList,
  numberedList = ElementType.numberedList,
  left = ElementTextAlign.left,
  center = ElementTextAlign.center,
  right = ElementTextAlign.right,
  justify = ElementTextAlign.justify,

}

export type BlockQuoteElement = {
  type: ElementType.blockQuote
  align?: ElementTextAlign
  children: CustomText[]
}

export type HeadingOneElement = {
  type: ElementType.headingOne
  align?: ElementTextAlign
  children: CustomText[]
}

export type HeadingTwoElement = {
  type: ElementType.headingTwo
  align?: ElementTextAlign
  children: CustomText[]
}

export type ImageElement = {
  type: ElementType.image
  url: string
  children: CustomText[]
}

export type BulletedListElement = {
  type: ElementType.bulletedList
  align?: ElementTextAlign
  children: CustomText[]
}
export type NumberedListElement = {
  type: ElementType.numberedList
  align?: ElementTextAlign
  children: CustomText[]
}

export type ListItemElement = { 
  type: ElementType.listItem
  children: CustomText[] 
}

export type ParagraphElement = {
  type: ElementType.paragraph
  align?: ElementTextAlign
  children: CustomText[]
}

export type CustomElement =
  | BlockQuoteElement
  | HeadingOneElement
  | HeadingTwoElement
  | ImageElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | ParagraphElement