import {useState, useCallback} from 'react';
import PlaceView from './components/PlaceView';
import MemoView from './components/MemoView';
import {useScheduleData} from './hooks/useScheduleData';
import './App.css';

function App() {
    const [currentTab, setCurrentTab] = useState('place');
    const [toast, setToast] = useState({show: false, msg: ''});

    const showToast = useCallback((msg) => {
        setToast({show: true, msg});
        setTimeout(() => setToast({show: false, msg: ''}), 2000);
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
        mapInfo,
        updateMapInfo
    } = useScheduleData(showToast);

    if (!isLoaded) return (
        <div className="loading-screen" style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
            데이터 동기화 중...
        </div>
    );

    return (
        <div className="app-wrapper">
            <div className="tab-bar">
                <div className="tab-logo">K<span className="logo-accent">.</span></div>
                <button 
                    className={`tab-btn ${currentTab === 'place' ? 'active' : ''}`} 
                    onClick={() => setCurrentTab('place')}
                >
                    장소
                </button>
                <button 
                    className={`tab-btn ${currentTab === 'memo' ? 'active' : ''}`} 
                    onClick={() => setCurrentTab('memo')}
                >
                    메모
                </button>
            </div>

            <div className="body-container">
                {currentTab === 'place' ? (
                    <PlaceView
                        savedPlaces={savedPlaces}
                        addSavedPlace={addSavedPlace}
                        deleteSavedPlace={deleteSavedPlace}
                        updateSavedPlacesList={updateSavedPlacesList}
                        mapInfo={mapInfo}
                        updateMapInfo={updateMapInfo}
                        showToast={showToast}
                    />
                ) : (
                    <MemoView
                        savedPlaces={savedPlaces}
                        schedules={schedules}
                        addSchedule={addSchedule}
                        deleteSchedule={deleteSchedule}
                        dayMemos={dayMemos}
                        saveDayMemo={saveDayMemo}
                        datePlaces={datePlaces}
                        toggleDatePlace={toggleDatePlace}
                        showToast={showToast}
                    />
                )}
            </div>


            <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
        </div>
    );
}

export default App;
