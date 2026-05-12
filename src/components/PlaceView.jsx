import React, { useState, useEffect, useRef } from 'react';
import PlaceSearchBar from './place/PlaceSearchBar';
import PlaceMap from './place/PlaceMap';
import PlaceDetailPanel from './place/PlaceDetailPanel';
import SavedPlaceList from './place/SavedPlaceList';

function PlaceView({ savedPlaces, addSavedPlace, deleteSavedPlace, updateSavedPlacesList, mapInfo, updateMapInfo, showToast }) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [memoInput, setMemoInput] = useState('');
    const [myLocation, setMyLocation] = useState(null);

    const isLocating = useRef(false);

    // 🌟 선택된 장소가 바뀔 때 메모 동기화
    useEffect(() => {
        if (selectedPlace) {
            setMemoInput(selectedPlace.memo || '');
        } else {
            setMemoInput('');
        }
    }, [selectedPlace]);

    // 🌟 현재 위치 비동기 로딩
    useEffect(() => {
        if (mapInfo.center.lat !== 37.5665 || isLocating.current) return;
        isLocating.current = true;

        const timer = setTimeout(() => {
            showToast('위치 응답이 늦어 기본 위치로 시작합니다.');
        }, 5000);

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

    const handleMapDragEnd = (map) => {
        updateMapInfo({
            ...mapInfo,
            center: { lat: map.getCenter().getLat(), lng: map.getCenter().getLng() },
            level: map.getLevel(),
        });
    };

    const searchPlace = () => {
        if (!keyword.trim()) return;
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data);
                setIsOverlayOpen(true);
                const newCenter = { lat: parseFloat(data[0].y), lng: parseFloat(data[0].x) };
                updateMapInfo({ ...mapInfo, center: newCenter });
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

        if (saved) {
            setSelectedPlace(saved);
        } else {
            setSelectedPlace({ ...place, lat, lng, address_name: addr });
        }
    };

    const handleMemoChange = (e) => {
        const newMemo = e.target.value;
        setMemoInput(newMemo);
        if (selectedPlace?.id) {
            const newPlaces = savedPlaces.map(p =>
                p.id === selectedPlace.id ? { ...p, memo: newMemo } : p
            );
            // 메모 수정은 배열 내 요소 변경이므로 덮어쓰기 로직 사용
            updateSavedPlacesList(newPlaces);
        }
    };

    const saveCurrentPlace = () => {
        if (!selectedPlace || isSaved) return;
        const entry = {
            id: Date.now(),
            place_name: selectedPlace.place_name,
            address_name: selectedPlace.address_name,
            category_name: selectedPlace.category_name,
            phone: selectedPlace.phone,
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
            memo: memoInput.trim(),
            savedAt: new Date().toLocaleDateString('ko-KR')
        };
        // 정밀 추가 사용
        addSavedPlace(entry);
        setSelectedPlace(entry);
        showToast('저장 완료!');
    };

    const handleDeletePlace = (id, e) => {
        e.stopPropagation();
        const target = savedPlaces.find(p => p.id === id);
        if (target) {
            // 정밀 삭제 사용 (Props로 전달받은 함수 호출)
            deleteSavedPlace(target);
            if (selectedPlace?.id === id) setSelectedPlace(null);
            showToast('삭제했습니다.');
        }
    };

    const isSaved = selectedPlace && savedPlaces.some(
        p => p.place_name === selectedPlace.place_name && p.address_name === selectedPlace.address_name
    );

    return (
        <>
            <div className="image-zone">
                <div id="map-container">
                    <PlaceSearchBar 
                        keyword={keyword}
                        setKeyword={setKeyword}
                        onSearch={searchPlace}
                        searchResults={searchResults}
                        isOverlayOpen={isOverlayOpen}
                        onSelectPlace={handleSelectPlace}
                    />
                    <PlaceMap 
                        mapInfo={mapInfo}
                        onMapDragEnd={handleMapDragEnd}
                        myLocation={myLocation}
                        searchResults={searchResults}
                        savedPlaces={savedPlaces}
                        selectedPlace={selectedPlace}
                        onSelectPlace={handleSelectPlace}
                    />
                </div>
            </div>

            <div className="text-container">
                <div className="place-panel">
                    <PlaceDetailPanel 
                        selectedPlace={selectedPlace}
                        memoInput={memoInput}
                        onMemoChange={handleMemoChange}
                        onSave={saveCurrentPlace}
                        isSaved={isSaved}
                    />
                    <SavedPlaceList 
                        savedPlaces={savedPlaces}
                        selectedPlace={selectedPlace}
                        onSelectPlace={handleSelectPlace}
                        onDelete={handleDeletePlace}
                    />
                </div>
            </div>
        </>
    );
}

export default PlaceView;
