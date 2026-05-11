'use client';

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      {/* Sticky header skeleton */}
      <div
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0"
        style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}
      >
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-4 w-12 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
            <div className="h-4 w-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
            <div className="h-4 w-24 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
          </div>
          <div className="h-4 w-16 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-5 py-4 md:px-10 md:py-6">
        {/* Main card skeleton */}
        <div
          className="relative overflow-hidden rounded-[2.25rem] border"
          style={{
            background: 'linear-gradient(180deg, rgba(253,252,245,0.97) 0%, rgba(250,237,205,0.72) 100%)',
            borderColor: 'rgba(212,163,115,0.22)',
            boxShadow: '0 24px 72px rgba(212,163,115,0.12)',
          }}
        >
          {/* Bronze top accent */}
          <div className="h-1 w-full" style={{ backgroundColor: 'var(--bronze)' }} />

          <div className="relative px-5 py-5 md:px-10 md:py-7">
            {/* Header section */}
            <div className="border-b pb-6 md:pb-7" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div
                  className="h-6 w-20 rounded-full skeleton-pulse"
                  style={{ backgroundColor: 'rgba(204,213,174,0.12)', border: '1px solid rgba(204,213,174,0.25)' }}
                />
              </div>
              <div className="h-8 w-40 rounded-xl mb-3 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
              {/* Step progress skeleton */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                  <div className="h-3 w-10 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                </div>
                <div className="flex-1 max-w-[3rem]">
                  <div className="h-0.5 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full skeleton-pulse"
                    style={{ backgroundColor: 'rgba(212,163,115,0.06)', border: '1px solid rgba(212,163,115,0.15)' }}
                  />
                  <div className="h-3 w-16 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                </div>
              </div>
            </div>

            {/* Browse prompts section */}
            <section className="py-5 md:py-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                  <div className="h-4 w-24 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                </div>
              </div>
              {/* Select dropdown skeleton */}
              <div
                className="w-full rounded-[1.15rem] border px-4 py-3.5"
                style={{
                  borderColor: 'rgba(212,163,115,0.20)',
                  backgroundColor: 'rgba(255,253,246,0.70)',
                  maxWidth: '42rem',
                }}
              >
                <div className="h-4 w-32 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
              </div>
            </section>

            {/* Writing section */}
            <section className="border-t py-5 md:py-6" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
              {/* Constrained writing zone */}
              <div
                className="rounded-[1.5rem] mx-auto"
                style={{
                  maxWidth: '760px',
                  backgroundColor: 'rgba(255,253,246,0.88)',
                  boxShadow: '0 0 0 1px rgba(212,163,115,0.14), 0 4px 24px rgba(212,163,115,0.07)',
                  minHeight: '360px',
                }}
              >
                <div className="px-5 py-5">
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    <div className="h-4 w-11/12 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                    <div className="h-4 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    <div className="h-4 w-4/5 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                    <div className="h-4 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    <div className="h-4 w-3/4 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                    <div className="h-4 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    <div className="h-4 w-5/6 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                  </div>
                </div>
                {/* Word count pill skeleton */}
                <div className="flex items-center justify-end px-1 pt-3">
                  <div
                    className="h-8 w-24 rounded-full skeleton-pulse"
                    style={{ backgroundColor: 'rgba(212,163,115,0.12)', border: '1px solid rgba(212,163,115,0.2)' }}
                  />
                </div>
              </div>
            </section>

            {/* Enrich section */}
            <section className="border-t py-5 md:py-6" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                  <div className="space-y-2">
                    <div className="h-3 w-12 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                    <div className="h-5 w-36 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                  </div>
                </div>
                <div className="flex-1 h-px skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.95fr)]">
                {/* Photos card skeleton */}
                <div
                  className="rounded-[1.4rem] border p-5 skeleton-pulse"
                  style={{
                    backgroundColor: 'rgba(250,237,205,0.28)',
                    borderColor: 'rgba(212,163,115,0.16)',
                  }}
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                      <div className="h-3 w-48 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                    </div>
                    <div className="h-10 w-28 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                  </div>
                  {/* Drop zone skeleton */}
                  <div
                    className="rounded-2xl border-2 border-dashed h-28 flex items-center justify-center"
                    style={{ borderColor: 'rgba(212,163,115,0.2)', backgroundColor: 'rgba(250,237,205,0.2)' }}
                  >
                    <div className="h-4 w-32 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                  </div>
                </div>

                {/* Audio card skeleton */}
                <div
                  className="rounded-[1.4rem] border p-5 skeleton-pulse"
                  style={{
                    backgroundColor: 'rgba(255,253,246,0.72)',
                    borderColor: 'rgba(212,163,115,0.16)',
                  }}
                >
                  <div className="space-y-1.5 mb-4">
                    <div className="h-4 w-24 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                    <div className="h-3 w-40 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="h-10 w-28 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.15)' }} />
                    <div className="h-10 w-28 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.15)' }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Save bar skeleton */}
            <div
              className="sticky bottom-0 -mx-5 px-5 py-4 md:-mx-9 md:px-9 md:py-4 mt-6"
              style={{
                background: 'linear-gradient(to top, rgba(253,252,245,0.99) 0%, rgba(253,252,245,0.97) 100%)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(212,163,115,0.22)',
                boxShadow: '0 -8px 32px rgba(212,163,115,0.08)',
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="h-4 w-32 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
                  <div className="h-10 w-20 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)', border: '1px solid rgba(212,163,115,0.15)' }} />
                  <div className="h-11 w-32 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}