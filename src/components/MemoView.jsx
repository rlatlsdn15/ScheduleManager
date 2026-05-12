import React, { useState, useEffect, useRef } from 'react';
import Calendar from './memo/Calendar';
import ScheduleManager from './memo/ScheduleManager';
import DailyMemo from './memo/DailyMemo';
import PlaceAttachment from './memo/PlaceAttachment';

function MemoView({
    savedPlaces,
    schedules,
    addSchedule,
    deleteSchedule,
    dayMemos,
    saveDayMemo,
    datePlaces,
    toggleDatePlace,
    showToast,
    layout,       // 🌟 통합 레이아웃
    updateLayout, // 🌟 통합 업데이트
    onResizeStart
}) {
    const weekdays = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    const monthsNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().slice(0, 10));
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleText, setScheduleText] = useState('');
    const [dayMemo, setDayMemo] = useState(dayMemos[selectedDateStr] || '');

    const resizingType = useRef(null);

    // 🌟 리사이즈 핸들러
    const handleInnerResize = (type) => (e) => {
        resizingType.current = type;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizingType.current) return;
            const type = resizingType.current;
            const container = document.querySelector('.text-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            
            const newRatio = (e.clientY - rect.top) / rect.height;
            if (newRatio > 0.05 && newRatio < 0.95) updateLayout(type, newRatio);
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

    // 날짜 계산 로직
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    let cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, dateStr: '', otherMonth: true });
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        cells.push({ day: d, dateStr: ds, otherMonth: false });
    }
    while (cells.length % 7 !== 0) cells.push({ day: cells.length % 7 + 1, dateStr: '', otherMonth: true });

    const handleSelectDate = (dateStr) => { if (dateStr) { setSelectedDateStr(dateStr); setDayMemo(dayMemos[dateStr] || ''); } };
    const onAddSchedule = () => {
        if (!scheduleText.trim()) { showToast('내용을 입력하세요.'); return; }
        addSchedule(selectedDateStr, { id: Date.now(), time: scheduleTime, text: scheduleText });
        setScheduleTime(''); setScheduleText('');
    };
    const onDeleteSchedule = (id) => {
        const target = schedules[selectedDateStr]?.find(s => s.id === id);
        if (target) deleteSchedule(selectedDateStr, target);
    };

    const selectedD = new Date(selectedDateStr + 'T00:00:00');
    const schedulesList = schedules[selectedDateStr] || [];
    const attachedPlaces = datePlaces[selectedDateStr] || [];

    return (
        <div className="resize-group" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div className="image-zone" style={{ flex: layout.splitRatio }}>
                <Calendar 
                    currentYear={currentYear} monthsNames={monthsNames} currentMonth={currentMonth}
                    changeMonth={(d) => setCurrentDate(new Date(currentYear, currentMonth + d, 1))}
                    cells={cells} todayStr={todayStr} selectedDateStr={selectedDateStr} onSelectDate={handleSelectDate} schedules={schedules}
                />
            </div>

            <div className="resizer" onMouseDown={onResizeStart('splitRatio')}></div>

            <div className="text-container" style={{ flex: 1 - layout.splitRatio, display: 'flex', flexDirection: 'column' }}>
                <div className="memo-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    <div className="memo-date-display" style={{ flex: layout.memoDateRatio, borderBottom: 'none' }}>
                        <div className="memo-date-big">{selectedD.getFullYear()}년 {monthsNames[selectedD.getMonth()]} {selectedD.getDate()}일</div>
                        <div className="memo-date-sub">{weekdays[selectedD.getDay()]}</div>
                    </div>

                    <div className="resizer-v" onMouseDown={handleInnerResize('memoDateRatio')}></div>

                    <div className="memo-content-area" style={{ display: 'flex', flexDirection: 'column', flex: 1 - layout.memoDateRatio }}>
                        <div className="memo-schedule-area" style={{ flex: layout.memoVerticalRatio }}>
                            <div className="inner-split" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div className="sch-top" style={{ flex: layout.memoScheduleRatio, overflowY: 'auto' }}>
                                    <ScheduleManager 
                                        scheduleTime={scheduleTime} setScheduleTime={setScheduleTime} scheduleText={scheduleText} setScheduleText={setScheduleText}
                                        onAddSchedule={onAddSchedule} schedulesList={schedulesList} onDeleteSchedule={onDeleteSchedule}
                                    />
                                </div>
                                <div className="resizer-v" onMouseDown={handleInnerResize('memoScheduleRatio')}></div>
                                <div className="sch-bottom" style={{ flex: 1 - layout.memoScheduleRatio }}>
                                    <DailyMemo dayMemo={dayMemo} setDayMemo={setDayMemo} onSaveMemo={() => { saveDayMemo(selectedDateStr, dayMemo); showToast('메모 저장 완료!'); }} />
                                </div>
                            </div>
                        </div>

                        <div className="resizer-v" onMouseDown={handleInnerResize('memoVerticalRatio')}></div>

                        <div className="memo-place-zone" style={{ flex: 1 - layout.memoVerticalRatio, maxHeight: 'none' }}>
                            <PlaceAttachment savedPlaces={savedPlaces} attachedPlaces={attachedPlaces} onTogglePlace={(id) => toggleDatePlace(selectedDateStr, id, attachedPlaces)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MemoView;
