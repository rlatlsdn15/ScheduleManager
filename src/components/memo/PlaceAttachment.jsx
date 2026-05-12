import React from 'react';

function PlaceAttachment({ savedPlaces, attachedPlaces, onTogglePlace }) {
    return (
        <div className="memo-place-zone">
            <div className="memo-place-header">
                <div className="memo-place-title">장소 추가 (저장된 장소에서 선택)</div>
            </div>
            <div className="memo-place-list">
                {savedPlaces.length === 0 ? (
                    <div className="empty-list" style={{ padding: '12px 16px', fontSize: '0.78rem' }}>저장된 장소가 없습니다.</div>
                ) : (
                    savedPlaces.map(place => {
                        const isOn = attachedPlaces.includes(place.id);
                        return (
                            <div 
                                key={place.id} 
                                className={`memo-place-item ${isOn ? 'attached' : ''}`} 
                                onClick={() => onTogglePlace(place.id)}
                            >
                                <span className="memo-place-check">{isOn ? '✔' : '○'}</span>
                                <span className="memo-place-item-name">{place.place_name}</span>
                                <span className="memo-place-item-addr">{place.address_name}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default PlaceAttachment;
