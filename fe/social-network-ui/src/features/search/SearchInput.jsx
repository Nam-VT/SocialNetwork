import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SearchInput.css';

const SearchInput = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const isEmpty = !query.trim();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!isEmpty) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery(''); 
        }
    };

    const handleClear = () => {
        setQuery('');
        document.getElementById('search-input')?.focus(); // Focus lại input sau khi clear
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <form onSubmit={handleSearch} className="search-form" role="search" aria-label="Search form">
            <div className="search-input-group">
                <label htmlFor="search-input" className="sr-only">Search</label>
                <input 
                    id="search-input"
                    type="search" 
                    placeholder="Search chats, users, or messages..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className={`search-input ${isEmpty ? '' : 'has-content'}`}
                    aria-label="Enter search query"
                    autoComplete="off"
                />
                
                {/* Nút Clear chỉ hiện khi có nội dung */}
                {query && (
                    <button 
                        type="button" 
                        onClick={handleClear} 
                        className="clear-button"
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
                
                {/* Nút Search */}
                <button 
                    type="submit" 
                    className="search-button"
                    disabled={isEmpty}
                    aria-label="Submit search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>
            {/* Gợi ý phím tắt (ẩn trên mobile nếu cần bằng CSS) */}
            <small className="search-hint">Press Enter to search, Escape to clear.</small>
        </form>
    );
};

export default SearchInput;