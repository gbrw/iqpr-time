'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function SwaggerClient() {
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/openapi.json`
      : '/openapi.json'

  return (
    <SwaggerUI
      url={baseUrl}
      docExpansion="list"
      defaultModelsExpandDepth={-1}
      filter={true}
      showExtensions={true}
      tryItOutEnabled={true}
    />
  )
}
