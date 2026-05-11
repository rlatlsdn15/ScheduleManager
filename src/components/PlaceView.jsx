import { useState, useEffect, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function PlaceView({ appData, updateAppData, showToast }) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [memoInput, setMemoInput] = useState('');
    const [myLocation, setMyLocation] = useState(null);

    // 🌟 중복 실행 방지를 위한 Ref
    const isProcessing = useRef(false);

    useEffect(() => {
        // 이미 초기화가 완료되었거나 현재 처리 중이면 중단
        if (appData.mapState.isInitialized || isProcessing.current) return;
        isProcessing.current = true;

        const finalize = (centerPos) => {
            updateAppData({
                ...appData,
                mapState: {
                    center: centerPos || appData.mapState.center,
                    level: appData.mapState.level,
                    isInitialized: true
                }
            });
        };

        // 🌟 1. 즉시 타임아웃 설정 (사용자가 이미 허용했더라도 응답이 늦을 경우 대비)
        const timer = setTimeout(() => {
            if (!appData.mapState.isInitialized) {
                finalize(); // 현재 값(서울시청)으로 강제 시작
                showToast('위치 응답이 늦어 기본 위치로 시작합니다.');
            }
        }, 5000); // 5초 대기

        // 🌟 2. 위치 정보 요청
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timer);
                    const newPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMyLocation(newPos);
                    finalize(newPos);
                },
                (error) => {
                    clearTimeout(timer);
                    finalize(); // 에러 발생 시 기본값으로 시작
                    showToast('위치 정보를 가져올 수 없어 기본 위치로 시작합니다.');
                },
                { enableHighAccuracy: true, timeout: 4500, maximumAge: 0 }
            );
        } else {
            clearTimeout(timer);
            finalize();
        }

        return () => clearTimeout(timer);
    }, []);

    // 지도를 움직일 때마다 위치 저장 (탭 전환 대비)
    const handleMapDragEnd = (map) => {
        const newCenter = {
            lat: map.getCenter().getLat(),
            lng: map.getCenter().getLng(),
        };
        // 불필요한 리렌더링 방지를 위해 위치가 유의미하게 변했을 때만 업데이트 추천
        updateAppData({
            ...appData,
            mapState: {
                ...appData.mapState,
                center: newCenter,
                level: map.getLevel(),
            }
        });
    };

    // 장소 검색 및 선택 로직은 기존과 동일 (생략 없이 통합 유지)
    const searchPlace = () => {
        if (!keyword.trim()) return;
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data);
                setIsOverlayOpen(true);
                if (data.length > 0) {
                    const newCenter = { lat: parseFloat(data[0].y), lng: parseFloat(data[0].x) };
                    updateAppData({ ...appData, mapState: { ...appData.mapState, center: newCenter } });
                }
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
        const savedVersion = appData.savedPlaces.find(p => p.place_name === place.place_name && p.address_name === addr);
        updateAppData({ ...appData, mapState: { ...appData.mapState, center: { lat, lng } } });
        setIsOverlayOpen(false);
        setKeyword(place.place_name);
        if (savedVersion) { setSelectedPlace(savedVersion); setMemoInput(savedVersion.memo || ''); }
        else { setSelectedPlace({ ...place, lat, lng, address_name: addr }); setMemoInput(''); }
    };

    const handleMemoChange = (e) => {
        const newMemo = e.target.value;
        setMemoInput(newMemo);
        if (selectedPlace && typeof selectedPlace.id === 'number') {
            const newPlaces = appData.savedPlaces.map(p => p.id === selectedPlace.id ? { ...p, memo: newMemo } : p);
            updateAppData({ ...appData, savedPlaces: newPlaces });
        }
    };

    const saveCurrentPlace = () => {
        if (!selectedPlace) return;
        const entry = { id: Date.now(), place_name: selectedPlace.place_name, address_name: selectedPlace.address_name, category_name: selectedPlace.category_name, phone: selectedPlace.phone, lat: selectedPlace.lat, lng: selectedPlace.lng, memo: memoInput.trim(), savedAt: new Date().toLocaleDateString('ko-KR') };
        updateAppData({ ...appData, savedPlaces: [entry, ...appData.savedPlaces] });
        setSelectedPlace(entry);
        showToast('저장 완료!');
    };

    const deleteSavedPlace = (id, e) => {
        e.stopPropagation();
        const newPlaces = appData.savedPlaces.filter(p => p.id !== id);
        updateAppData({ ...appData, savedPlaces: newPlaces });
        if (selectedPlace?.id === id) { setSelectedPlace(null); setMemoInput(''); }
        showToast('삭제했습니다.');
    };

    const isSaved = selectedPlace && appData.savedPlaces.some(p => p.place_name === selectedPlace.place_name && p.address_name === selectedPlace.address_name);
    const cat = selectedPlace?.category_name ? selectedPlace.category_name.split('>').pop().trim() : '';

    // 🌟 아직 초기화 중이라면 지도를 그리지 않고 대기
    if (!appData.mapState.isInitialized) {
        return (
            <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
                <p>위치 정보를 확인하고 있습니다...</p>
            </div>
        );
    }

    return (
        <>
            <div className="image-zone">
                <div id="map-container">
                    <div className="map-search-bar">
                        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchPlace()} placeholder="장소를 검색하세요..." />
                        <button onClick={searchPlace}>검색</button>
                    </div>
                    <Map center={appData.mapState.center} level={appData.mapState.level} style={{ width: "100%", height: "calc(100% - 52px)" }} onCenterChanged={handleMapDragEnd} onZoomChanged={handleMapDragEnd}>
                        {myLocation && <MapMarker position={myLocation} image={{ src: "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_my.png", size: { width: 30, height: 30 } }} />}
                        {searchResults.map((place, idx) => (
                            <MapMarker key={`search-${place.id || idx}`} position={{ lat: parseFloat(place.y), lng: parseFloat(place.x) }} onClick={() => handleSelectPlace(place)} image={{ src: selectedPlace?.place_name === place.place_name ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" : "https://t1.daumcdn.net/mapjsapi/images/2.0/marker.png", size: { width: 24, height: 35 } }} />
                        ))}
                        {appData.savedPlaces.map((place) => (
                            <MapMarker key={`saved-${place.id}`} position={{ lat: place.lat, lng: place.lng }} onClick={() => handleSelectPlace(place)} image={{ src: "https://t1.daumcdn.net/localimg/localimages/07/2011/marker_red.png", size: { width: 24, height: 35 } }} />
                        ))}
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
            {/* ... 이하 우측 정보 패널 레이아웃 동일 (생략하지 않고 적용하세요) ... */}
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
                            <button className="save-place-btn" onClick={saveCurrentPlace} disabled={!selectedPlace || isSaved}>
                                {isSaved ? '이미 저장됨' : '저장하기'}
                            </button>
                        </div>
                        <div className="memo-col">
                            <div className="place-info-label">메모</div>
                            <textarea value={memoInput} onChange={handleMemoChange} placeholder={selectedPlace ? (isSaved ? "수정 시 자동 저장됩니다." : "메모를 입력하고 저장 버튼을 누르세요.") : "장소를 선택해주세요."} disabled={!selectedPlace}></textarea>
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
                                    <div key={place.id} className={`saved-place-item ${selectedPlace?.id === place.id ? 'active' : ''}`} onClick={() => handleSelectPlace(place)}>
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