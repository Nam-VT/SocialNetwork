import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SearchInput.css';

const SearchInput = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
            setQuery(''); // Clear input after search
        }
    };

    const handleClear = () => {
        setQuery('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    const isEmpty = !query.trim();

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
                <button 
                    type="submit" 
                    className="search-button"
                    disabled={isEmpty}
                    aria-label="Submit search"
                >
                    🔍
                </button>
            </div>
            <small className="search-hint">Press Enter to search, Escape to clear.</small>
        </form>
    );
};

export default SearchInput;