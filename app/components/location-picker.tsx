"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

const defaultLocation = { latitude: 6.9271, longitude: 79.8612 };

export function LocationPicker() {
	const mapElement = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const markerRef = useRef<MapLibreMarker | null>(null);
	const mountedRef = useRef(true);
	const [location, setLocation] = useState(defaultLocation);
	const [placeName, setPlaceName] = useState("Colombo, Sri Lanka");
	const [isResolving, setIsResolving] = useState(false);

	async function resolvePlace(next: { latitude: number; longitude: number }) {
		if (
			!mountedRef.current ||
			!Number.isFinite(next.latitude) ||
			!Number.isFinite(next.longitude)
		)
			return;
		setIsResolving(true);
		try {
			const response = await fetch(
				`https://photon.komoot.io/reverse?lat=${next.latitude}&lon=${next.longitude}`,
			);
			if (response.ok && mountedRef.current) {
				const result = (await response.json()) as {
					features?: Array<{ properties?: Record<string, string> }>;
				};
				const properties = result.features?.[0]?.properties;
				const name = [
					properties?.name,
					properties?.city ?? properties?.town ?? properties?.village,
					properties?.state,
					properties?.country,
				]
					.filter(Boolean)
					.join(", ");
				setPlaceName(name || "Pinned location");
			}
		} catch {
			if (mountedRef.current) setPlaceName("Pinned location");
		} finally {
			if (mountedRef.current) setIsResolving(false);
		}
	}

	useEffect(() => {
		mountedRef.current = true;
		if (!mapElement.current || mapRef.current) return;
		let disposed = false;
		void import("maplibre-gl").then((maplibregl) => {
			if (disposed || !mapElement.current) return;
			maplibregl.setWorkerUrl(
				"https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl-worker.mjs",
			);
			const map = new maplibregl.Map({
				container: mapElement.current,
				style: "https://tiles.openfreemap.org/styles/bright",
				center: [defaultLocation.longitude, defaultLocation.latitude],
				zoom: 12,
				attributionControl: false,
			});
			map.addControl(new maplibregl.NavigationControl(), "top-right");
			map.addControl(new maplibregl.AttributionControl({ compact: true }));
			const marker = new maplibregl.Marker({ color: "#18231f" })
				.setLngLat([defaultLocation.longitude, defaultLocation.latitude])
				.addTo(map);
			map.on("click", (event) => {
				const next = {
					latitude: Number(event.lngLat.lat.toFixed(6)),
					longitude: Number(event.lngLat.lng.toFixed(6)),
				};
				marker.setLngLat([next.longitude, next.latitude]);
				setLocation(next);
			});
			map.on("load", () => map.resize());
			mapRef.current = map;
			markerRef.current = marker;
			void resolvePlace(defaultLocation);
		});
		return () => {
			mountedRef.current = false;
			disposed = true;
			mapRef.current?.remove();
			mapRef.current = null;
			markerRef.current = null;
		};
	}, []);

	useEffect(() => {
		mapRef.current?.setCenter([location.longitude, location.latitude]);
		markerRef.current?.setLngLat([location.longitude, location.latitude]);
		const timer = window.setTimeout(() => void resolvePlace(location), 450);
		return () => window.clearTimeout(timer);
	}, [location.latitude, location.longitude]);

	function useDeviceLocation() {
		navigator.geolocation?.getCurrentPosition((position) => {
			const next = {
				latitude: Number(position.coords.latitude.toFixed(6)),
				longitude: Number(position.coords.longitude.toFixed(6)),
			};
			mapRef.current?.setCenter([next.longitude, next.latitude]);
			mapRef.current?.setZoom(15);
			setLocation(next);
		});
	}

	return (
		<div className="location-picker">
			<div className="map-toolbar">
				<span>Click the map to place the pin</span>
				<button
					type="button"
					className="text-button"
					onClick={useDeviceLocation}>
					Use my location
				</button>
			</div>
			<div className="selected-place">
				<span>Selected location</span>
				<strong>{isResolving ? "Finding place..." : placeName}</strong>
			</div>
			<div
				className="map-canvas"
				ref={mapElement}
			/>
			<div className="coordinate-fields">
				<label>
					Latitude
					<input
						name="latitude"
						value={location.latitude}
						onChange={(event) =>
							setLocation({ ...location, latitude: Number(event.target.value) })
						}
						required
						type="number"
						min="-90"
						max="90"
						step="any"
					/>
				</label>
				<label>
					Longitude
					<input
						name="longitude"
						value={location.longitude}
						onChange={(event) =>
							setLocation({
								...location,
								longitude: Number(event.target.value),
							})
						}
						required
						type="number"
						min="-180"
						max="180"
						step="any"
					/>
				</label>
			</div>
		</div>
	);
}
