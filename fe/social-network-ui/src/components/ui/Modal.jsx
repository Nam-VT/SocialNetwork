import { useEffect, useRef } from 'react';
import '../../styles/Modal.css'; // Đường dẫn tương đối, bạn điều chỉnh theo dự án

const Modal = ({ children, onClose, title, isOpen = true, className = '' }) => {
    const modalRef = useRef(null);
    const contentRef = useRef(null);

    // Đóng modal khi nhấn Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        document.body.classList.add('modal-open'); // Khóa scroll body

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.classList.remove('modal-open');
        };
    }, [isOpen, onClose]);

    // Focus trap: focus phần tử đầu tiên có thể focus khi mở modal
    useEffect(() => {
        if (!isOpen || !contentRef.current) return;

        const focusableElements = contentRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        if (firstElement) {
            firstElement.focus();
        }
    }, [isOpen]);

    // Ngăn đóng modal khi click vào nội dung modal
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    // Đóng modal khi click ra ngoài vùng nội dung
    const handleOverlayClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            ref={modalRef}
            onClick={handleOverlayClick}
        >
            <div
                className={`modal-content ${className}`}
                onClick={handleContentClick}
                ref={contentRef}
                aria-live="polite"
            >
                <div className="modal-header">
                    <h2 id="modal-title" className="modal-title">{title}</h2>
                    <button
                        onClick={onClose}
                        className="modal-close"
                        aria-label="Close modal"
                        type="button"
                    >
                        <svg
                            className="close-icon"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default Modal;