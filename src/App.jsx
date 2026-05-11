import  {useState, useEffect} from 'react';
import {getDoc, setDoc} from 'firebase/firestore';
import {userDocRef} from './firebase';
import PlaceView from './components/PlaceView';
import MemoView from './components/MemoView';
import './App.css';

function App() {
    const [currentTab, setCurrentTab] = useState('place');
    const [toast, setToast] = useState({show: false, msg: ''});
    const [appData, setAppData] = useState({
        savedPlaces: [],
        mapState: {center: {lat: 37.5665, lng: 126.9780}, level: 3, isInitialized: false},
        schedules: {},
        dayMemos: {},
        datePlaces: {}
    });

    const showToast = (msg) => {
        setToast({show: true, msg});
        setTimeout(() => setToast({show: false, msg: ''}), 2000);
    };

    // 🌟 수정된 부분: 파이어베이스에서 데이터를 가져올 때 mapState를 유지함
    useEffect(() => {
        const fetchData = async () => {
            try {
                const snap = await getDoc(userDocRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setAppData(prev => ({
                        ...prev, // 기존 초기값(특히 mapState)을 먼저 깔아줌
                        savedPlaces: data.savedPlaces || [],
                        schedules: data.schedules || {},
                        dayMemos: data.dayMemos || {},
                        datePlaces: data.datePlaces || {},
                        // 만약 DB에도 mapState가 저장되어 있다면 그걸 쓰고, 없으면 기존 값을 유지
                        mapState: data.mapState || prev.mapState
                    }));
                } else {
                    // 데이터가 아예 없는 신규 유저라면 위치 권한 확인을 위해 초기화만 진행
                    setAppData(prev => ({
                        ...prev,
                        mapState: { ...prev.mapState, isInitialized: false }
                    }));
                }
            } catch (error) {
                console.error("데이터 불러오기 실패:", error);
                showToast("데이터 로드 실패");
            }
        };
        fetchData();
    }, []);

    const updateAppData = async (newData) => {
        setAppData(newData);
        try {
            await setDoc(userDocRef, newData);
        } catch (e) {
            console.error("Firebase 저장 에러: ", e);
        }
    };

    return (
        <div className="app-wrapper">
            <div className="tab-bar">
                <div className="tab-logo">K<span className="logo-accent">.</span></div>
                <button
                    className={`tab-btn ${currentTab === 'place' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('place')}
                >장소
                </button>
                <button
                    className={`tab-btn ${currentTab === 'memo' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('memo')}
                >메모
                </button>
            </div>

            <div className="body-container">
                {currentTab === 'place' ? (
                    <PlaceView appData={appData} updateAppData={updateAppData} showToast={showToast}/>
                ) : (
                    <MemoView appData={appData} updateAppData={updateAppData} showToast={showToast}/>
                )}
            </div>

            <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
        </div>
    );
}

export default App;