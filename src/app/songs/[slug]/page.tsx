import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SongDetailClient from '@/components/songs/song-detail-client'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'

interface PageProps {
  params: {
    slug: string
  }
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
  const song = await getSong(params.slug)

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
  const song = await getSong(params.slug)

  if (!song) {
    notFound()
  }

  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <SongDetailClient song={song} />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

