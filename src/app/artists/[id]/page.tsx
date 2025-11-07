import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ArtistDetailClient from '@/components/artists/artist-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getArtist(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/artists/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.artist
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const artist = await getArtist(id)

  if (!artist) {
    return {
      title: 'Artist Not Found',
    }
  }

  return {
    title: `${artist.name} - PhinAccords`,
    description: artist.bio || `Songs by ${artist.name}`,
  }
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const { id } = await params
  const artist = await getArtist(id)

  if (!artist) {
    notFound()
  }

  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ArtistDetailClient artist={artist} />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

