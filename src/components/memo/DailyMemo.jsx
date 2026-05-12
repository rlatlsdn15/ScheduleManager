import React from 'react';

function DailyMemo({ dayMemo, setDayMemo, onSaveMemo }) {
    return (
        <>
            <div className="schedule-section-label">메모</div>
            <div className="memo-textarea-wrap">
                <textarea
                    placeholder="이 날에 대한 메모를 자유롭게 남기세요..."
                    value={dayMemo}
                    onChange={(e) => setDayMemo(e.target.value)}
                ></textarea>
                <button 
                    className="schedule-add-btn" 
                    onClick={onSaveMemo} 
                    style={{ alignSelf: 'flex-end' }}
                >
                    메모 저장
                </button>
            </div>
        </>
    );
}

export default DailyMemo;
