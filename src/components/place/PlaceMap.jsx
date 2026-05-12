import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function PlaceMap({ 
    mapInfo, 
    onMapDragEnd, 
    myLocation, 
    searchResults, 
    savedPlaces, 
    selectedPlace, 
    onSelectPlace 
}) {
    return (
        <Map
            center={mapInfo.center}
            level={mapInfo.level}
            style={{ width: "100%", height: "calc(100% - 52px)" }}
            onCenterChanged={onMapDragEnd}
        >
            {/* 내 위치 마커 */}
            {myLocation && (
                <MapMarker
                    position={myLocation}
                    image={{ 
                        src: "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_my.png", 
                        size: { width: 30, height: 30 } 
                    }}
                />
            )}

            {/* 검색 결과 마커 */}
            {searchResults.map((p, idx) => (
                <MapMarker
                    key={`sr-${idx}`}
                    position={{ lat: parseFloat(p.y), lng: parseFloat(p.x) }}
                    onClick={() => onSelectPlace(p)}
                    image={{
                        src: selectedPlace?.place_name === p.place_name
                            ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                            : "https://t1.daumcdn.net/mapjsapi/images/2.0/marker.png",
                        size: { width: 24, height: 35 }
                    }}
                />
            ))}

            {/* 저장된 장소 마커 */}
            {savedPlaces.map((p) => (
                <MapMarker
                    key={`sv-${p.id}`}
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => onSelectPlace(p)}
                    image={{ 
                        src: "https://t1.daumcdn.net/localimg/localimages/07/2011/marker_red.png", 
                        size: { width: 24, height: 35 } 
                    }}
                />
            ))}
        </Map>
    );
}

export default PlaceMap;
