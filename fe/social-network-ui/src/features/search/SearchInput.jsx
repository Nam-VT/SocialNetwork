import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SearchInput.css';

const SearchInput = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
                <input 
                    type="search" 
                    placeholder="Search people or posts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-btn">🔍</button>
            </div>
        </form>
    );
};

export default SearchInput;