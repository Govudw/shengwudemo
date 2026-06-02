import { DatabaseIcon, ShareIcon } from './icons'

type AttachmentAction = 'asset' | 'upload'

type AttachmentMenuProps = {
  id: string
  onSelect: (action: AttachmentAction) => void
}

function AttachmentMenu({ id, onSelect }: AttachmentMenuProps) {
  return (
    <div id={id} className="attachment-menu" role="menu" aria-label="添加上下文">
      <button
        type="button"
        className="attachment-menu__item"
        role="menuitem"
        onClick={() => onSelect('asset')}
      >
        <DatabaseIcon className="attachment-menu__icon" />
        <span>从资产添加</span>
      </button>
      <button
        type="button"
        className="attachment-menu__item"
        role="menuitem"
        onClick={() => onSelect('upload')}
      >
        <ShareIcon className="attachment-menu__icon" />
        <span>上传文件或图片</span>
      </button>
    </div>
  )
}

export type { AttachmentAction }
export default AttachmentMenu
