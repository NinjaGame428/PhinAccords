import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import ResourceDetailClient from '@/components/resources/resource-detail-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getResource(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/resources?slug=${slug}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.resources?.[0] || null
  } catch (error) {
    console.error('Error fetching resource:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)

  if (!resource) {
    return {
      title: 'Resource Not Found',
    }
  }

  return {
    title: `${resource.title} - PhinAccords`,
    description: resource.description || `Download ${resource.title} - ${resource.category} resource`,
  }
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const resource = await getResource(slug)

  if (!resource) {
    notFound()
  }

  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title={resource.title}
            subtitle={resource.description || `Download ${resource.title} - ${resource.category} resource`}
            page="Resource Details"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <ResourceDetailClient resource={resource} />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

