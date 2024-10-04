import { el } from '@zero-dependency/dom'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!
const title = el('h1', { className: 'title' }, 'ruDimbo Engine')
app.append(title)
