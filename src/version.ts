import { el } from '@zero-dependency/dom'

const buildDate = new Intl.DateTimeFormat('ru', {
  dateStyle: 'long',
  timeStyle: 'long'
}).format(new Date(__BUILD_DATE__))

export const version = el('span', {
  title: buildDate,
  className: 'version'
}, `Version ${__VERSION__}`)
