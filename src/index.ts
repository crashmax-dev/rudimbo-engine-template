import { el } from '@zero-dependency/dom'
import { version } from './version'
import './engine'
import '@/style.scss'

const app = document.querySelector<HTMLDivElement>('#app')!
const title = el('h1', { className: 'title' }, 'solar-dust-template')
app.append(title, version)
