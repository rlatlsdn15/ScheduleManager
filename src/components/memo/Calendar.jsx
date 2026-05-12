import React from 'react';

function Calendar({ 
    currentYear, 
    monthsNames, 
    currentMonth, 
    changeMonth, 
    cells, 
    todayStr, 
    selectedDateStr, 
    onSelectDate, 
    schedules 
}) {
    return (
        <div id="calendar-container" style={{ display: 'flex' }}>
            <div className="cal-header">
                <div className="cal-title">{currentYear}년 {monthsNames[currentMonth]}</div>
                <div className="cal-nav">
                    <button onClick={() => changeMonth(-1)}>&#8249;</button>
                    <button onClick={() => changeMonth(1)}>&#8250;</button>
                </div>
            </div>
            <div className="cal-weekdays">
                {['일','월','화','수','목','금','토'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
            </div>
            <div className="cal-grid">
                {cells.map((c, idx) => (
                    <div
                        key={idx}
                        className={`cal-day ${c.otherMonth ? 'other-month' : ''} ${c.dateStr === todayStr ? 'today' : ''} ${c.dateStr === selectedDateStr ? 'selected' : ''}`}
                        onClick={() => onSelectDate(c.dateStr)}
                    >
                        <div className="day-num">{c.day}</div>
                        {schedules[c.dateStr]?.length > 0 && (
                            <div className="day-dot-row">
                                {schedules[c.dateStr].slice(0, 4).map((_, i) => <div key={i} className="day-dot"></div>)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Calendar;
