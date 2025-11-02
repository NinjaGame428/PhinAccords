'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SimpleSongEditor } from '@/components/admin/SimpleSongEditor';
import { AdminLayout } from '@/components/admin/AdminLayout';

const SongEditPage = () => {
  const params = useParams();
  const [songIdentifier, setSongIdentifier] = useState<string>('');

  useEffect(() => {
    // Support both slug and id (UUID) - the API handles both
    if (params?.slug) {
      const identifier = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      setSongIdentifier(identifier);
    }
  }, [params]);

  if (!songIdentifier) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Loading song...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SimpleSongEditor songSlug={songIdentifier} />
    </AdminLayout>
  );
};

export default SongEditPage;
