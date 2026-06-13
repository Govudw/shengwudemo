export function getInternalPathname(pathname: string, basePath = '') {
  const normalizedBasePath = normalizeAppBasePath(basePath)

  if (
    normalizedBasePath &&
    (pathname === normalizedBasePath ||
      pathname.startsWith(`${normalizedBasePath}/`))
  ) {
    const internalPath = pathname.slice(normalizedBasePath.length)

    return internalPath || '/'
  }

  return pathname || '/'
}

export function getExternalPath(path: string, basePath = '') {
  const normalizedBasePath = normalizeAppBasePath(basePath)

  if (!normalizedBasePath) {
    return path
  }

  if (path === '/') {
    return `${normalizedBasePath}/`
  }

  return `${normalizedBasePath}${path}`
}

export function normalizeAppBasePath(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.trim()

  if (!trimmedBaseUrl || trimmedBaseUrl === '/') {
    return ''
  }

  const basePath = trimmedBaseUrl.startsWith('/')
    ? trimmedBaseUrl
    : `/${trimmedBaseUrl}`

  return basePath.replace(/\/+$/, '')
}
