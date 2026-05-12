import { useState, useCallback, useRef, useEffect } from 'react';
import PlaceView from './components/PlaceView';
import MemoView from './components/MemoView';
import { useScheduleData } from './hooks/useScheduleData';
import './App.css';

function App() {
    const [currentTab, setCurrentTab] = useState('place');
    const [toast, setToast] = useState({ show: false, msg: '' });
    const isResizing = useRef(false);

    const showToast = useCallback((msg) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 2000);
    }, []);

    const {
        isLoaded,
        savedPlaces,
        addSavedPlace,
        deleteSavedPlace,
        updateSavedPlacesList,
        schedules,
        addSchedule,
        deleteSchedule,
        dayMemos,
        saveDayMemo,
        datePlaces,
        toggleDatePlace,
        layout,
        updateLayout,
        mapInfo,
        updateMapInfo
    } = useScheduleData(showToast);

    const resizeType = useRef(null);

    const startResizing = useCallback((type) => (e) => {
        resizeType.current = type;
        if (type === 'splitRatio' || type === 'placeTopRatio') document.body.style.cursor = 'col-resize';
        else document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizeType.current) return;
            const type = resizeType.current;
            if (type === 'splitRatio') {
                const newRatio = e.clientX / document.body.clientWidth;
                if (newRatio > 0.1 && newRatio < 0.9) updateLayout(type, newRatio);
            }
        };

        const handleMouseUp = () => {
            if (resizeType.current) {
                const type = resizeType.current;
                resizeType.current = null;
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

    if (!isLoaded) return (
        <div className="loading-screen" style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
            데이터 동기화 중...
        </div>
    );

    return (
        <div className="app-wrapper">
            <div className="tab-bar">
                <div className="tab-logo">K<span className="logo-accent">.</span></div>
                <button className={`tab-btn ${currentTab === 'place' ? 'active' : ''}`} onClick={() => setCurrentTab('place')}>장소</button>
                <button className={`tab-btn ${currentTab === 'memo' ? 'active' : ''}`} onClick={() => setCurrentTab('memo')}>메모</button>
            </div>

            <div className="body-container">
                {currentTab === 'place' ? (
                    <PlaceView
                        savedPlaces={savedPlaces} addSavedPlace={addSavedPlace} deleteSavedPlace={deleteSavedPlace}
                        updateSavedPlacesList={updateSavedPlacesList} mapInfo={mapInfo} updateMapInfo={updateMapInfo}
                        showToast={showToast} layout={layout} updateLayout={updateLayout} onResizeStart={startResizing}
                    />
                ) : (
                    <MemoView
                        savedPlaces={savedPlaces} schedules={schedules} addSchedule={addSchedule} deleteSchedule={deleteSchedule}
                        dayMemos={dayMemos} saveDayMemo={saveDayMemo} datePlaces={datePlaces} toggleDatePlace={toggleDatePlace}
                        showToast={showToast} layout={layout} updateLayout={updateLayout} onResizeStart={startResizing}
                    />
                )}
            </div>

            <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
        </div>
    );
}

export default App;
