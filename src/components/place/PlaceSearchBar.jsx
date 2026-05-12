import React from 'react';

function PlaceSearchBar({ keyword, setKeyword, onSearch, searchResults, isOverlayOpen, onSelectPlace }) {
    return (
        <div className="map-search-bar">
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder="장소를 검색하세요..."
            />
            <button onClick={onSearch}>검색</button>

            {isOverlayOpen && (
                <div className="search-results-overlay" style={{ display: 'block' }}>
                    {searchResults.map((p, i) => (
                        <div key={i} className="search-result-item" onClick={() => onSelectPlace(p)}>
                            <div className="sr-name">{p.place_name}</div>
                            <div className="sr-addr">{p.road_address_name || p.address_name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PlaceSearchBar;
