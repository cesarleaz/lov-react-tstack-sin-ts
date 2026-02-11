import {
  ArrowUpRight,
  Circle,
  Hand,
  Image,
  Link,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type
} from 'lucide-react'
const icons = {
  hand: Hand,
  selection: MousePointer2,
  rectangle: Square,
  ellipse: Circle,
  arrow: ArrowUpRight,
  line: Minus,
  freedraw: Pencil,
  text: Type,
  image: Image,
  embeddable: Link
}
export const toolShortcuts = {
  hand: 'H',
  selection: 'V',
  rectangle: 'R',
  ellipse: 'O',
  arrow: 'A',
  line: 'L',
  freedraw: 'P',
  text: 'T',
  image: '9',
  embeddable: ''
}
export default icons
