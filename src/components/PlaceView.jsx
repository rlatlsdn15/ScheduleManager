import React, { useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function PlaceView({ appData, updateAppData, showToast }) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [memoInput, setMemoInput] = useState('');

    // 1. 검색 기능
    const searchPlace = () => {
        if (!keyword.trim()) return;
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data);
                setIsOverlayOpen(true);
            } else {
                setIsOverlayOpen(false);
                showToast('검색 결과가 없습니다.');
            }
        });
    };

    // 2. 장소 선택 기능
    const handleSelectPlace = (place) => {
        const lat = parseFloat(place.y || place.lat);
        const lng = parseFloat(place.x || place.lng);
        const addr = place.road_address_name || place.address_name;

        // 💡 중요: 현재 선택한 장소가 이미 저장된 리스트에 있는지 확인
        const savedVersion = appData.savedPlaces.find(
            p => p.place_name === place.place_name && p.address_name === addr
        );

        setMapCenter({ lat, lng });
        setIsOverlayOpen(false);
        setKeyword(place.place_name);

        if (savedVersion) {
            // 이미 저장된 장소라면: 저장된 데이터(메모 포함)를 로드
            setSelectedPlace(savedVersion);
            setMemoInput(savedVersion.memo || '');
        } else {
            // 새로운 장소라면: 검색된 데이터를 로드하고 메모는 비움
            setSelectedPlace({ ...place, lat, lng, address_name: addr });
            setMemoInput('');
        }
    };

    // 3. 메모 실시간 수정 (DB ID가 있을 때만 작동)
    const handleMemoChange = (e) => {
        const newMemo = e.target.value;
        setMemoInput(newMemo);

        // 💡 DB에 저장된 '진짜' 데이터일 때만 실시간 수정 반영
        // (우리가 부여한 고유 ID는 보통 Date.now()로 생성된 긴 숫자입니다)
        if (selectedPlace && typeof selectedPlace.id === 'number') {
            const newPlaces = appData.savedPlaces.map(p =>
                p.id === selectedPlace.id ? { ...p, memo: newMemo } : p
            );
            updateAppData({ ...appData, savedPlaces: newPlaces });
        }
    };

    // 4. 장소 저장
    const saveCurrentPlace = () => {
        if (!selectedPlace) return;

        const entry = {
            id: Date.now(), // 우리만의 고유 ID 생성
            place_name: selectedPlace.place_name,
            address_name: selectedPlace.address_name,
            category_name: selectedPlace.category_name,
            phone: selectedPlace.phone,
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
            memo: memoInput.trim(),
            savedAt: new Date().toLocaleDateString('ko-KR')
        };

        updateAppData({ ...appData, savedPlaces: [entry, ...appData.savedPlaces] });
        setSelectedPlace(entry); // 방금 저장한 따끈따끈한 데이터로 교체
        showToast('저장 완료!');
    };

    // 5. 장소 삭제
    const deleteSavedPlace = (id, e) => {
        e.stopPropagation();
        const newPlaces = appData.savedPlaces.filter(p => p.id !== id);
        updateAppData({ ...appData, savedPlaces: newPlaces });

        if (selectedPlace?.id === id) {
            setSelectedPlace(null);
            setMemoInput('');
        }
        showToast('삭제했습니다.');
    };

    // 💡 [렌더링용 데이터] 현재 장소가 저장된 장소인지 실시간 체크
    const isSaved = selectedPlace && appData.savedPlaces.some(
        p => p.place_name === selectedPlace.place_name && p.address_name === selectedPlace.address_name
    );

    const cat = selectedPlace?.category_name ? selectedPlace.category_name.split('>').pop().trim() : '';

    return (
        <>
            <div className="image-zone">
                <div id="map-container">
                    <div className="map-search-bar">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchPlace()}
                            placeholder="장소를 검색하세요..."
                        />
                        <button onClick={searchPlace}>검색</button>
                    </div>

                    <Map center={mapCenter} style={{ width: "100%", height: "calc(100% - 52px)" }} level={3}>
                        {selectedPlace && <MapMarker position={mapCenter} />}
                    </Map>

                    {isOverlayOpen && (
                        <div className="search-results-overlay" style={{ display: 'block' }}>
                            {searchResults.map((place, idx) => (
                                <div key={idx} className="search-result-item" onClick={() => handleSelectPlace(place)}>
                                    <div className="sr-name">{place.place_name}</div>
                                    <div className="sr-addr">{place.road_address_name || place.address_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-container">
                <div className="place-panel">
                    <div className="place-top">
                        <div className="place-info-col">
                            <div className="place-info-label">장소 정보</div>
                            <div id="place-info-content">
                                {!selectedPlace ? (
                                    <div className="place-info-empty" style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        지도에서 장소를 검색하거나<br/>마커를 클릭하세요.
                                    </div>
                                ) : (
                                    <>
                                        <div className="place-info-name">{selectedPlace.place_name || '\u00A0'}</div>
                                        <div className="place-info-category-wrap">
                                            {cat && <div className="place-info-category">{cat}</div>}
                                        </div>
                                        <div className="place-info-addr">{selectedPlace.address_name || '\u00A0'}</div>
                                        <div className="place-info-phone">{selectedPlace.phone ? `📞 ${selectedPlace.phone}` : '\u00A0'}</div>
                                    </>
                                )}
                            </div>
                            <button
                                className="save-place-btn"
                                onClick={saveCurrentPlace}
                                disabled={!selectedPlace || isSaved} // 👈 isSaved 변수로 판단!
                            >
                                {isSaved ? '이미 저장됨' : '저장하기'}
                            </button>
                        </div>

                        <div className="memo-col">
                            <div className="place-info-label">메모</div>
                            <textarea
                                value={memoInput}
                                onChange={handleMemoChange}
                                placeholder={selectedPlace ? (isSaved ? "수정 시 자동 저장됩니다." : "메모를 입력하고 저장 버튼을 누르세요.") : "장소를 선택해주세요."}
                                disabled={!selectedPlace}
                            ></textarea>
                        </div>
                    </div>

                    <div className="saved-places-zone">
                        <div className="saved-places-header">
                            <div className="saved-places-title">저장된 장소</div>
                            <div className="saved-count">{appData.savedPlaces.length}곳</div>
                        </div>
                        <div id="saved-places-list">
                            {appData.savedPlaces.length === 0 ? (
                                <div className="empty-list">아직 저장된 장소가 없습니다. ✦</div>
                            ) : (
                                appData.savedPlaces.map((place, idx) => (
                                    <div
                                        key={place.id}
                                        className={`saved-place-item ${selectedPlace?.id === place.id ? 'active' : ''}`}
                                        onClick={() => handleSelectPlace(place)}
                                    >
                                        <div className="saved-place-idx">{String(idx + 1).padStart(2, '0')}</div>
                                        <div className="saved-place-texts">
                                            <div className="saved-place-name">{place.place_name}</div>
                                            <div className="saved-place-addr">{place.address_name}</div>
                                            {place.memo && <div className="saved-place-memo">✐ {place.memo}</div>}
                                        </div>
                                        <button className="delete-btn" onClick={(e) => deleteSavedPlace(place.id, e)}>✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PlaceView;