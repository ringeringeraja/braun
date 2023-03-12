import webpack from 'webpack'
import { readFile } from 'fs/promises'

export type LoaderOptions = {
  tag?: string
  ensureList?: Array<string>
}

const icons = new Map<string, boolean>()

const emitFile = async (loaderContext: webpack.LoaderContext<LoaderOptions>, iconName: string) => {

  const [style, filename] = iconName.includes(':')
    ? iconName.split(':')
    : ['line', iconName]

  console.log(`static/${style}/${filename}.svg`)

  const content = await readFile(`${__dirname}/../icons/${style}/${filename}.svg`)
  return loaderContext.emitFile(`static/icons/${style}/${filename}.svg`, content)
}

export default function iconLoader(this: webpack.LoaderContext<LoaderOptions>, source: string) {
  const loaderContext = this

  const options = loaderContext.getOptions()
  const regex = new RegExp(`<${options.tag}([^>]*)[^:]name="([^"]+)"`, 'mg')

  if( options.ensureList && !icons.size ) {
    options.ensureList.forEach((iconName) => {
      icons.set(iconName, true)
      emitFile(loaderContext, iconName)
    })
  }

  let match: Array<string>|null
  while( match = regex.exec(source) ) {
    const iconName = match[2]
    if( !icons.has(iconName) ) {
      icons.set(iconName, true)
      emitFile(loaderContext, iconName)
    }
  }

  return source
}
