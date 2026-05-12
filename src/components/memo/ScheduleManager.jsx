import React from 'react';

function ScheduleManager({ 
    scheduleTime, 
    setScheduleTime, 
    scheduleText, 
    setScheduleText, 
    onAddSchedule, 
    schedulesList, 
    onDeleteSchedule 
}) {
    return (
        <div className="memo-schedule-area">
            <div className="schedule-section-label">일정 추가</div>
            <div className="schedule-input-row">
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                <input
                    type="text"
                    placeholder="일정 내용을 입력하세요"
                    value={scheduleText}
                    onChange={(e) => setScheduleText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onAddSchedule()}
                />
                <button className="schedule-add-btn" onClick={onAddSchedule}>추가</button>
            </div>

            <div className="schedule-section-label">일정 목록</div>
            <div className="schedule-list">
                {schedulesList.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontStyle: 'italic', padding: '4px 0' }}>일정 없음</div>
                ) : (
                    schedulesList.map(s => (
                        <div key={s.id} className="schedule-item">
                            <span className="s-time">{s.time || '--:--'}</span>
                            <span className="s-text">{s.text}</span>
                            <button className="s-delete" onClick={() => onDeleteSchedule(s.id)}>✕</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ScheduleManager;
