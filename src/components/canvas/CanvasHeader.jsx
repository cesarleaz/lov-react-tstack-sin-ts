import { Input } from '@/components/ui/input'
import CanvasExport from './CanvasExport'
import TopMenu from '../TopMenu'
const CanvasHeader = ({ canvasName, canvasId, onNameChange, onNameSave }) => {
  return (
    <TopMenu
      middle={
        <Input
          className="text-sm text-muted-foreground text-center bg-transparent border-none shadow-none w-fit h-7 hover:bg-primary-foreground transition-all"
          value={canvasName}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameSave}
        />
      }
      right={<CanvasExport />}
    />
  )
}
export default CanvasHeader
