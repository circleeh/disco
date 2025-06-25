import React, { useEffect } from 'react';
import VinylForm from '../forms/VinylForm';
import { VinylRecord } from '../../types/vinyl';

interface EditVinylModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: VinylRecord | null;
    onSubmit: (data: any) => void;
    loading?: boolean;
}

const EditVinylModal: React.FC<EditVinylModalProps> = ({
    isOpen,
    onClose,
    record,
    onSubmit,
    loading = false,
}) => {
    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !record) return null;

    // Ensure the record has a valid format value
    const validFormats = ['LP', 'EP', '7" Single', '10" Single', '12" Single', '10" EP', '12" EP', '12" LP'];
    const sanitizedRecord = {
        ...record,
        format: validFormats.includes(record.format) ? record.format : 'LP'
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-midcentury-charcoal">
                            Edit Record
                        </h2>
                        <p className="text-sm text-midcentury-olive mt-1">
                            {sanitizedRecord.albumName} by {sanitizedRecord.artistName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-midcentury-charcoal hover:text-midcentury-burntOrange transition-colors"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <VinylForm
                        initial={sanitizedRecord}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditVinylModal;
