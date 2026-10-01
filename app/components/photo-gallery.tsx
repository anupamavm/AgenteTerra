"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
	id: number;
	url: string;
};

export function PhotoGallery({
	images,
	alt,
}: Readonly<{
	images: GalleryImage[];
	alt: string;
}>) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [zoom, setZoom] = useState(1);

	useEffect(() => {
		if (activeIndex === null) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setActiveIndex(null);
			if (event.key === "ArrowLeft") {
				setActiveIndex((index) =>
					index === null ? null : (index + images.length - 1) % images.length,
				);
			}
			if (event.key === "ArrowRight") {
				setActiveIndex((index) =>
					index === null ? null : (index + 1) % images.length,
				);
			}
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeIndex, images.length]);

	const openImage = (index: number) => {
		setZoom(1);
		setActiveIndex(index);
	};

	const changeImage = (index: number) => {
		setZoom(1);
		setActiveIndex((index + images.length) % images.length);
	};

	return (
		<>
			<div className="detail-gallery">
				{images.map((image, index) => (
					<button
						key={image.id}
						className="detail-gallery-photo"
						type="button"
						aria-label={`View photo ${index + 1} larger`}
						onClick={() => openImage(index)}>
						<img
							src={image.url}
							alt={alt}
						/>
					</button>
				))}
			</div>

			{activeIndex !== null && (
				<div className="photo-lightbox">
					<div className="photo-lightbox-toolbar">
						<span>
							{activeIndex + 1} / {images.length}
						</span>
						<div className="photo-lightbox-controls">
							<button
								type="button"
								aria-label="Zoom out"
								title="Zoom out"
								disabled={zoom <= 1}
								onClick={() => setZoom((value) => Math.max(1, value - 0.5))}>
								−
							</button>
							<span className="photo-zoom-level">
								{Math.round(zoom * 100)}%
							</span>
							<button
								type="button"
								aria-label="Zoom in"
								title="Zoom in"
								disabled={zoom >= 4}
								onClick={() => setZoom((value) => Math.min(4, value + 0.5))}>
								+
							</button>
							<button
								type="button"
								aria-label="Reset zoom"
								title="Reset zoom"
								disabled={zoom === 1}
								onClick={() => setZoom(1)}>
								1:1
							</button>
							<button
								type="button"
								aria-label="Close photo viewer"
								title="Close"
								onClick={() => setActiveIndex(null)}>
								×
							</button>
						</div>
					</div>
					<div className="photo-lightbox-stage">
						<button
							className="photo-step photo-step-previous"
							type="button"
							aria-label="Previous photo"
							onClick={() => changeImage(activeIndex - 1)}>
							‹
						</button>
						<img
							className="photo-lightbox-image"
							src={images[activeIndex].url}
							alt={alt}
							draggable={false}
							style={{ transform: `scale(${zoom})` }}
						/>
						<button
							className="photo-step photo-step-next"
							type="button"
							aria-label="Next photo"
							onClick={() => changeImage(activeIndex + 1)}>
							›
						</button>
					</div>
				</div>
			)}
		</>
	);
}
