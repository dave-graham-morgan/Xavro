import React, { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch } from '../../utils/authFetch';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Lightbox ──────────────────────────────────────────────────────────────────

const Lightbox = ({ images, startIndex, onClose, onSetPrimary, onDelete }) => {
    const [idx, setIdx] = useState(startIndex);
    const img = images[idx];
    if (!img) return null;

    const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
    const next = () => setIdx(i => (i + 1) % images.length);

    const handleKey = useCallback((e) => {
        if (e.key === 'ArrowLeft')  prev();
        if (e.key === 'ArrowRight') next();
        if (e.key === 'Escape')     onClose();
    }, [idx]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">

                {/* Image + side arrows */}
                <div className="relative w-full flex items-center justify-center">
                    {/* Prev */}
                    {images.length > 1 && (
                        <button
                            onClick={prev}
                            className="absolute left-0 -translate-x-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                    )}

                    <img
                        src={img.image_url}
                        alt={img.alt_text || 'Room photo'}
                        className="max-h-[70vh] max-w-full rounded-xl shadow-2xl object-contain"
                    />

                    {/* Next */}
                    {images.length > 1 && (
                        <button
                            onClick={next}
                            className="absolute right-0 translate-x-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    )}

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>

                    {/* Primary badge */}
                    {img.is_primary && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#c9a84c] text-[#0f172a] text-xs font-semibold px-2 py-0.5 rounded-full">
                            <StarIcon size={10} />
                            Primary
                        </div>
                    )}
                </div>

                {/* Counter + actions */}
                <div className="mt-4 flex items-center gap-4">
                    {images.length > 1 && (
                        <span className="text-white/50 text-sm tabular-nums">
                            {idx + 1} / {images.length}
                        </span>
                    )}
                    {!img.is_primary && (
                        <button
                            onClick={() => { onSetPrimary(img.id); onClose(); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-xs font-semibold rounded transition-colors"
                        >
                            <StarIcon size={11} />
                            Make Primary
                        </button>
                    )}
                    <button
                        onClick={() => { onDelete(img.id); onClose(); }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-red-500 text-white text-xs font-semibold rounded transition-colors"
                    >
                        Remove
                    </button>
                </div>

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="flex gap-1.5 mt-4">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const StarIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

const RoomImageEditor = ({ roomId }) => {
    const [images, setImages]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [uploading, setUploading]     = useState(false);
    const [error, setError]             = useState(null);
    const [lightboxIdx, setLightboxIdx] = useState(null); // null = closed
    const fileInputRef = useRef(null);

    const load = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}api/rooms/${roomId}/images`);
            const data = await res.json();
            setImages(data);
        } catch {
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [roomId]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        setUploading(true);
        setError(null);
        try {
            const form  = new FormData();
            form.append('file', file);
            const token = localStorage.getItem('token');
            const res   = await fetch(`${API}api/rooms/${roomId}/images/upload`, {
                method:  'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body:    form,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setImages(prev => [...prev, data]);
        } catch (e) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            const res = await authFetch(`${API}api/rooms/images/${imageId}/primary`, { method: 'PUT' });
            if (!res.ok) throw new Error('Failed to set primary');
            setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDelete = async (imageId) => {
        try {
            const res = await authFetch(`${API}api/rooms/images/${imageId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete image');
            const removed   = images.find(img => img.id === imageId);
            const remaining = images.filter(img => img.id !== imageId);
            if (removed?.is_primary && remaining.length > 0) {
                await handleSetPrimary(remaining[0].id);
            } else {
                setImages(remaining);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-6">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Room Photos</h2>
                        <p className="text-xs text-slate-400 mt-0.5">The primary photo is shown first to customers.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                Uploading…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Add Photo
                            </>
                        )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>

                <div className="p-6">
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    {loading ? (
                        <p className="text-sm text-slate-400">Loading photos…</p>
                    ) : images.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-lg p-10 text-center cursor-pointer hover:border-[#c9a84c]/50 hover:bg-slate-50 transition-colors"
                        >
                            <svg className="mx-auto mb-3 text-slate-300" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <p className="text-sm text-slate-400">Click to add the first photo</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div
                                    key={img.id}
                                    className={`relative group rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                                        img.is_primary ? 'border-[#c9a84c]' : 'border-slate-200'
                                    }`}
                                    onClick={() => setLightboxIdx(i)}
                                >
                                    <div className="aspect-square bg-slate-100">
                                        <img
                                            src={img.image_url}
                                            alt={img.alt_text || 'Room photo'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {img.is_primary && (
                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#c9a84c] text-[#0f172a] text-xs font-semibold px-2 py-0.5 rounded-full">
                                            <StarIcon size={10} />
                                            Primary
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">Click to preview</span>
                                    </div>

                                    {/* Delete X */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                        title="Remove photo"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            ))}

                            {/* Upload tile */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a84c]/50 hover:bg-slate-50 transition-colors text-slate-300 hover:text-slate-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span className="text-xs mt-1">Add photo</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <Lightbox
                    images={images}
                    startIndex={lightboxIdx}
                    onClose={() => setLightboxIdx(null)}
                    onSetPrimary={handleSetPrimary}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
};

export default RoomImageEditor;
