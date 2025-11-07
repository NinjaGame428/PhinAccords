import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SongDetailClient from '@/components/songs/song-detail-client'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getSong(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/songs/${slug}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.song
  } catch (error) {
    console.error('Error fetching song:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const song = await getSong(slug)

  if (!song) {
    return {
      title: 'Song Not Found',
    }
  }

  return {
    title: `${song.title} - PhinAccords`,
    description: song.description || `Learn to play ${song.title} by ${song.artist || 'Unknown Artist'}`,
  }
}

export default async function SongDetailPage({ params }: PageProps) {
  const { slug } = await params
  const song = await getSong(slug)

  if (!song) {
    notFound()
  }

  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title={song.title}
            subtitle={song.description || `Learn to play ${song.title} by ${song.artist || 'Unknown Artist'}`}
            page="Song Details"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <SongDetailClient song={song} />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

