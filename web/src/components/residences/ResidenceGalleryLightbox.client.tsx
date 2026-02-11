"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export default function ResidenceGalleryLightbox({ images, title }: Props) {
  const gallery = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openAt = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);
  const hasImages = gallery.length > 0;

  const goNext = () => {
    if (!hasImages) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % gallery.length;
    });
  };

  const goPrev = () => {
    if (!hasImages) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + gallery.length) % gallery.length;
    });
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, gallery.length]);

  if (!hasImages) {
    return null;
  }

  const gridImages = gallery.length > 0 ? gallery : ["/branding/icon-proposals.svg"];
  while (gridImages.length < 5) gridImages.push(gridImages[0]);

  return (
    <>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 rounded-3xl overflow-hidden">
        <div className="relative lg:col-span-2 lg:row-span-2 h-80 lg:h-full w-full">
          <img
            src={gridImages[0]}
            alt={title}
            className="h-full w-full object-cover pointer-events-none"
            loading="eager"
          />
          <button
            type="button"
            onClick={() => openAt(0)}
            className="absolute inset-0 z-10 cursor-zoom-in focus:outline-none"
            aria-label={`Open ${title} photo 1`}
          />
        </div>
        {gridImages.slice(1, 5).map((img, i) => (
          <div key={`${img}-${i}`} className="relative h-40 lg:h-full w-full">
            <img
              src={img}
              alt={`${title} photo ${i + 2}`}
              className="h-full w-full object-cover pointer-events-none"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => openAt(i + 1)}
              className="absolute inset-0 z-10 cursor-zoom-in focus:outline-none"
              aria-label={`Open ${title} photo ${i + 2}`}
            />
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-blue-100 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">All photos</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((img, i) => (
            <div key={`${img}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
              <img
                src={img}
                alt={`${title} gallery photo ${i + 1}`}
                className="h-full w-full object-cover pointer-events-none"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => openAt(i)}
                className="absolute inset-0 z-10 cursor-zoom-in focus:outline-none"
                aria-label={`Open ${title} gallery photo ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </section>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900"
            aria-label="Close gallery"
          >
            Close
          </button>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900"
            aria-label="Previous photo"
          >
            Prev
          </button>
          <div className="max-h-[85vh] w-full max-w-5xl">
            <img
              src={gallery[activeIndex]}
              alt={`${title} photo ${activeIndex + 1}`}
              className="h-full w-full object-contain"
              loading="eager"
            />
          </div>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900"
            aria-label="Next photo"
          >
            Next
          </button>
          <div className="absolute bottom-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
            {activeIndex + 1} / {gallery.length}
          </div>
        </div>
      )}
    </>
  );
}
