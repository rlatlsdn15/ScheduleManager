import React from 'react';

function PlaceDetailPanel({ selectedPlace, memoInput, onMemoChange, onSave, isSaved, isOnlyInfo }) {
    const cat = selectedPlace?.category_name ? selectedPlace.category_name.split('>').pop().trim() : '';

    return (
        <div className="place-info-col-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="place-info-label">장소 정보</div>
            <div id="place-info-content" style={{ flex: 1 }}>
                {!selectedPlace ? (
                    <div className="place-info-empty" style={{height:'110px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        장소를 검색하거나 마커를 클릭하세요.
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
                onClick={onSave}
                disabled={!selectedPlace || isSaved}
            >
                {isSaved ? '이미 저장됨' : '저장하기'}
            </button>

            {!isOnlyInfo && (
                <div className="memo-col-standalone" style={{ marginTop: '16px' }}>
                    <div className="place-info-label">메모</div>
                    <textarea
                        value={memoInput}
                        onChange={onMemoChange}
                        placeholder={selectedPlace ? (isSaved ? "수정 시 자동 저장됩니다." : "메모를 입력하고 저장 버튼을 누르세요.") : "장소를 선택해주세요."}
                        disabled={!selectedPlace}
                    ></textarea>
                </div>
            )}
        </div>
    );
}

export default PlaceDetailPanel;
