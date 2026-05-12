import React, { useState, useEffect, useRef } from 'react';
import PlaceSearchBar from './place/PlaceSearchBar';
import PlaceMap from './place/PlaceMap';
import PlaceDetailPanel from './place/PlaceDetailPanel';
import SavedPlaceList from './place/SavedPlaceList';

function PlaceView({ 
    savedPlaces, 
    addSavedPlace, 
    deleteSavedPlace, 
    updateSavedPlacesList, 
    mapInfo, 
    updateMapInfo, 
    showToast,
    layout,       // 🌟 통합 레이아웃
    updateLayout, // 🌟 통합 업데이트
    onResizeStart
}) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [memoInput, setMemoInput] = useState('');
    const [myLocation, setMyLocation] = useState(null);

    const isLocating = useRef(false);
    const resizingType = useRef(null);

    // 🌟 리사이즈 핸들러
    const handleInnerResize = (type) => (e) => {
        resizingType.current = type;
        document.body.style.cursor = type === 'placeTopRatio' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizingType.current) return;
            const type = resizingType.current;
            
            if (type === 'placeSearchRatio') {
                const container = document.querySelector('.image-zone');
                const rect = container.getBoundingClientRect();
                updateLayout(type, (e.clientY - rect.top) / rect.height);
            } else {
                const container = document.querySelector('.text-container');
                const rect = container.getBoundingClientRect();
                if (type === 'placeTopRatio') {
                    updateLayout(type, (e.clientX - rect.left) / rect.width);
                } else if (type === 'placeVerticalRatio') {
                    updateLayout(type, (e.clientY - rect.top) / rect.height);
                }
            }
        };

        const handleMouseUp = () => {
            if (resizingType.current) {
                const type = resizingType.current;
                resizingType.current = null;
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
                updateLayout(type, layout[type], true);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [layout, updateLayout]);

    // ... (기존 useEffect 및 비즈니스 로직 유지)

    useEffect(() => {
        if (selectedPlace) setMemoInput(selectedPlace.memo || '');
        else setMemoInput('');
    }, [selectedPlace]);

    useEffect(() => {
        if (mapInfo.center.lat !== 37.5665 || isLocating.current) return;
        isLocating.current = true;
        const timer = setTimeout(() => showToast('위치 응답이 늦어 기본 위치로 시작합니다.'), 5000);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    clearTimeout(timer);
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setMyLocation(newPos);
                    updateMapInfo({ ...mapInfo, center: newPos });
                },
                () => clearTimeout(timer),
                { timeout: 4500 }
            );
        }
    }, [mapInfo, updateMapInfo, showToast]);

    const searchPlace = () => {
        if (!keyword.trim()) return;
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data);
                setIsOverlayOpen(true);
                updateMapInfo({ ...mapInfo, center: { lat: parseFloat(data[0].y), lng: parseFloat(data[0].x) } });
            } else {
                setIsOverlayOpen(false);
                showToast('검색 결과가 없습니다.');
            }
        });
    };

    const handleSelectPlace = (place) => {
        const lat = parseFloat(place.y || place.lat);
        const lng = parseFloat(place.x || place.lng);
        const addr = place.road_address_name || place.address_name;
        const saved = savedPlaces.find(p => p.place_name === place.place_name && p.address_name === addr);
        updateMapInfo({ ...mapInfo, center: { lat, lng } });
        setIsOverlayOpen(false);
        setKeyword(place.place_name);
        if (saved) setSelectedPlace(saved);
        else setSelectedPlace({ ...place, lat, lng, address_name: addr });
    };

    const handleMemoChange = (e) => {
        const newMemo = e.target.value;
        setMemoInput(newMemo);
        if (selectedPlace?.id) {
            updateSavedPlacesList(savedPlaces.map(p => p.id === selectedPlace.id ? { ...p, memo: newMemo } : p));
        }
    };

    const saveCurrentPlace = () => {
        if (!selectedPlace) return;
        const entry = { ...selectedPlace, id: Date.now(), memo: memoInput.trim(), savedAt: new Date().toLocaleDateString('ko-KR') };
        addSavedPlace(entry);
        setSelectedPlace(entry);
        showToast('저장 완료!');
    };

    const handleDeletePlace = (id, e) => {
        e.stopPropagation();
        const target = savedPlaces.find(p => p.id === id);
        if (target) {
            deleteSavedPlace(target);
            if (selectedPlace?.id === id) setSelectedPlace(null);
            showToast('삭제했습니다.');
        }
    };

    const isSaved = selectedPlace && savedPlaces.some(p => p.place_name === selectedPlace.place_name && p.address_name === selectedPlace.address_name);

    return (
        <div className="resize-group" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div className="image-zone" style={{ flex: layout.splitRatio, display: 'flex', flexDirection: 'column' }}>
                <div className="search-wrap" style={{ flex: layout.placeSearchRatio, minHeight: '40px', overflow: 'visible' }}>
                    <PlaceSearchBar 
                        keyword={keyword} setKeyword={setKeyword} onSearch={searchPlace}
                        searchResults={searchResults} isOverlayOpen={isOverlayOpen} onSelectPlace={handleSelectPlace}
                    />
                </div>
                <div className="resizer-v" onMouseDown={handleInnerResize('placeSearchRatio')}></div>
                <div id="map-container" style={{ flex: 1 - layout.placeSearchRatio }}>
                    <PlaceMap 
                        mapInfo={mapInfo} onMapDragEnd={(map) => updateMapInfo({ ...mapInfo, center: { lat: map.getCenter().getLat(), lng: map.getCenter().getLng() }, level: map.getLevel() })}
                        myLocation={myLocation} searchResults={searchResults} savedPlaces={savedPlaces} selectedPlace={selectedPlace} onSelectPlace={handleSelectPlace}
                    />
                </div>
            </div>

            <div className="resizer" onMouseDown={onResizeStart('splitRatio')}></div>

            <div className="text-container" style={{ flex: 1 - layout.splitRatio, display: 'flex', flexDirection: 'column' }}>
                <div className="place-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="place-top" style={{ display: 'flex', flex: layout.placeVerticalRatio }}>
                        <div className="place-info-col" style={{ flex: layout.placeTopRatio }}>
                             <PlaceDetailPanel selectedPlace={selectedPlace} onSave={saveCurrentPlace} isSaved={isSaved} isOnlyInfo={true} />
                        </div>
                        <div className="resizer" onMouseDown={handleInnerResize('placeTopRatio')}></div>
                        <div className="memo-col" style={{ flex: 1 - layout.placeTopRatio }}>
                             <div className="place-info-label">메모</div>
                             <textarea value={memoInput} onChange={handleMemoChange} style={{ flex: 1, height: '100%' }} disabled={!selectedPlace}></textarea>
                        </div>
                    </div>
                    <div className="resizer-v" onMouseDown={handleInnerResize('placeVerticalRatio')}></div>
                    <div className="saved-places-zone" style={{ flex: 1 - layout.placeVerticalRatio }}>
                        <SavedPlaceList savedPlaces={savedPlaces} selectedPlace={selectedPlace} onSelectPlace={handleSelectPlace} onDelete={handleDeletePlace} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaceView;
