import React from 'react';

const UnsavedChangesModal = ({ blocker }) => {
    if (blocker.state !== 'blocked') return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => blocker.reset()} />
            <div className="relative z-10 bg-white rounded-lg shadow-xl border border-slate-200 p-6 max-w-sm w-full">
                <h3 className="text-base font-semibold text-slate-800 mb-2">Unsaved changes</h3>
                <p className="text-sm text-slate-500 mb-5">
                    You have unsaved changes. If you leave now they'll be lost.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => blocker.reset()}
                        className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded transition-colors"
                    >
                        Stay
                    </button>
                    <button
                        onClick={() => blocker.proceed()}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
                    >
                        Leave anyway
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnsavedChangesModal;
