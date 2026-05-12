import React, { useState } from 'react';
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
    showToast
}) {
    const weekdays = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    const monthsNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().slice(0, 10));
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleText, setScheduleText] = useState('');
    const [dayMemo, setDayMemo] = useState(dayMemos[selectedDateStr] || '');

    // 날짜 계산 로직
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    let cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, dateStr: '', otherMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        cells.push({ day: d, dateStr: ds, otherMonth: false });
    }
    while (cells.length % 7 !== 0) {
        cells.push({ day: cells.length % 7 + 1, dateStr: '', otherMonth: true });
    }

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentYear, currentMonth + delta, 1));
    };

    const handleSelectDate = (dateStr) => {
        if (!dateStr) return;
        setSelectedDateStr(dateStr);
        setDayMemo(dayMemos[dateStr] || '');
    };

    const onAddSchedule = () => {
        if (!scheduleText.trim()) { showToast('내용을 입력하세요.'); return; }
        const newSchedule = { id: Date.now(), time: scheduleTime, text: scheduleText };
        // 정밀 추가 사용
        addSchedule(selectedDateStr, newSchedule);
        setScheduleTime('');
        setScheduleText('');
    };

    const onDeleteSchedule = (id) => {
        const target = schedules[selectedDateStr]?.find(s => s.id === id);
        if (target) {
            // 정밀 삭제 사용
            deleteSchedule(selectedDateStr, target);
        }
    };

    const onSaveMemo = () => {
        // 정밀 저장 사용
        saveDayMemo(selectedDateStr, dayMemo);
        showToast('메모 저장 완료!');
    };

    const onTogglePlace = (placeId) => {
        const currentList = datePlaces[selectedDateStr] || [];
        // 정밀 토글(Dot Notation) 사용
        toggleDatePlace(selectedDateStr, placeId, currentList);
    };

    const selectedD = new Date(selectedDateStr + 'T00:00:00');
    const schedulesList = schedules[selectedDateStr] || [];
    const attachedPlaces = datePlaces[selectedDateStr] || [];

    return (
        <>
            <div className="image-zone">
                <Calendar 
                    currentYear={currentYear}
                    monthsNames={monthsNames}
                    currentMonth={currentMonth}
                    changeMonth={changeMonth}
                    cells={cells}
                    todayStr={todayStr}
                    selectedDateStr={selectedDateStr}
                    onSelectDate={handleSelectDate}
                    schedules={schedules}
                />
            </div>

            <div className="text-container">
                <div className="memo-panel" style={{ display: 'flex' }}>
                    <div className="memo-date-display">
                        <div className="memo-date-big">{selectedD.getFullYear()}년 {monthsNames[selectedD.getMonth()]} {selectedD.getDate()}일</div>
                        <div className="memo-date-sub">{weekdays[selectedD.getDay()]}</div>
                    </div>

                    <div className="memo-schedule-area">
                        <ScheduleManager 
                            scheduleTime={scheduleTime}
                            setScheduleTime={setScheduleTime}
                            scheduleText={scheduleText}
                            setScheduleText={setScheduleText}
                            onAddSchedule={addSchedule}
                            schedulesList={schedulesList}
                            onDeleteSchedule={deleteSchedule}
                        />
                        <DailyMemo 
                            dayMemo={dayMemo}
                            setDayMemo={setDayMemo}
                            onSaveMemo={saveDayMemo}
                        />
                    </div>

                    <PlaceAttachment 
                        savedPlaces={savedPlaces}
                        attachedPlaces={attachedPlaces}
                        onTogglePlace={onTogglePlace}
                    />
                </div>
            </div>
        </>
    );
}

export default MemoView;
