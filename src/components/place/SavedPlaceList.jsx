import React from 'react';

function SavedPlaceList({ savedPlaces, selectedPlace, onSelectPlace, onDelete }) {
    return (
        <div className="saved-places-zone">
            <div className="saved-places-header">
                <div className="saved-places-title">저장된 장소</div>
                <div className="saved-count">{savedPlaces.length}곳</div>
            </div>
            <div id="saved-places-list">
                {savedPlaces.length === 0 ? (
                    <div className="empty-list">아직 저장된 장소가 없습니다. ✦</div>
                ) : (
                    savedPlaces.map((p, idx) => (
                        <div
                            key={p.id}
                            className={`saved-place-item ${selectedPlace?.id === p.id ? 'active' : ''}`}
                            onClick={() => onSelectPlace(p)}
                        >
                            <div className="saved-place-idx">{String(idx + 1).padStart(2, '0')}</div>
                            <div className="saved-place-texts">
                                <div className="saved-place-name">{p.place_name}</div>
                                <div className="saved-place-addr">{p.address_name}</div>
                                {p.memo && <div className="saved-place-memo">✐ {p.memo}</div>}
                            </div>
                            <button className="delete-btn" onClick={(e) => onDelete(p.id, e)}>✕</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default SavedPlaceList;
