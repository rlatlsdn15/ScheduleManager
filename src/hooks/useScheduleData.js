import { useState, useEffect } from 'react';
import { getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { userDocRef } from '../firebase';

export function useScheduleData(showToast) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [schedules, setSchedules] = useState({});
    const [dayMemos, setDayMemos] = useState({});
    const [datePlaces, setDatePlaces] = useState({});
    const [mapInfo, setMapInfo] = useState({
        center: { lat: 37.5665, lng: 126.9780 },
        level: 3,
        isInitialized: false
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snap = await getDoc(userDocRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setSavedPlaces(data.savedPlaces || []);
                    setSchedules(data.schedules || {});
                    setDayMemos(data.dayMemos || {});
                    setDatePlaces(data.datePlaces || {});
                    if (data.mapState) {
                        setMapInfo({ ...data.mapState, isInitialized: true });
                    } else {
                        setMapInfo(prev => ({ ...prev, isInitialized: true }));
                    }
                } else {
                    setMapInfo(prev => ({ ...prev, isInitialized: true }));
                }
            } catch (e) {
                console.error("데이터 로드 실패:", e);
                showToast("데이터 로드 실패");
            } finally {
                setIsLoaded(true);
            }
        };
        fetchData();
    }, [showToast]);

    // 🌟 1. 장소 추가/삭제 (arrayUnion, arrayRemove)
    const addSavedPlace = async (place) => {
        setSavedPlaces(prev => [place, ...prev]);
        await updateDoc(userDocRef, {
            savedPlaces: arrayUnion(place)
        });
    };

    const deleteSavedPlace = async (place) => {
        setSavedPlaces(prev => prev.filter(p => p.id !== place.id));
        await updateDoc(userDocRef, {
            savedPlaces: arrayRemove(place)
        });
    };

    // 장소 메모 수정 (배열 내 요소 수정은 Firestore 특성상 전체 업데이트가 불가피하여 덮어쓰기 유지)
    const updateSavedPlacesList = async (newList) => {
        setSavedPlaces(newList);
        await updateDoc(userDocRef, { savedPlaces: newList });
    };

    // 🌟 2. 일정 추가/삭제 (Dot Notation + arrayUnion/Remove)
    const addSchedule = async (dateStr, schedule) => {
        setSchedules(prev => ({
            ...prev,
            [dateStr]: [...(prev[dateStr] || []), schedule].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
        }));
        await updateDoc(userDocRef, {
            [`schedules.${dateStr}`]: arrayUnion(schedule)
        });
    };

    const deleteSchedule = async (dateStr, schedule) => {
        setSchedules(prev => ({
            ...prev,
            [dateStr]: prev[dateStr].filter(s => s.id !== schedule.id)
        }));
        await updateDoc(userDocRef, {
            [`schedules.${dateStr}`]: arrayRemove(schedule)
        });
    };

    // 🌟 3. 날짜별 메모 저장 (Dot Notation)
    const saveDayMemo = async (dateStr, memo) => {
        setDayMemos(prev => ({ ...prev, [dateStr]: memo }));
        await updateDoc(userDocRef, {
            [`dayMemos.${dateStr}`]: memo
        });
    };

    // 🌟 4. 일정-장소 연결 토글 (전체 배열 업데이트)
    const toggleDatePlace = async (dateStr, placeId, currentList) => {
        const newList = currentList.includes(placeId)
            ? currentList.filter(id => id !== placeId)
            : [...currentList, placeId];
        
        setDatePlaces(prev => ({ ...prev, [dateStr]: newList }));
        await updateDoc(userDocRef, {
            [`datePlaces.${dateStr}`]: newList
        });
    };

    // 🌟 5. 지도 정보 업데이트
    const updateMapInfo = async (newMapState) => {
        setMapInfo(newMapState);
        await updateDoc(userDocRef, { mapState: newMapState });
    };

    return {
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
    };
}
