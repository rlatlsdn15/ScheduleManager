import { useState, useEffect } from 'react';
import { getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { userDocRef } from '../firebase';

export function useScheduleData(showToast) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [schedules, setSchedules] = useState({});
    const [dayMemos, setDayMemos] = useState({});
    const [datePlaces, setDatePlaces] = useState({});
    
    const [splitRatio, setSplitRatio] = useState(0.5);
    const [placeTopRatio, setPlaceTopRatio] = useState(0.6);
    const [placeVerticalRatio, setPlaceVerticalRatio] = useState(0.5);
    const [memoVerticalRatio, setMemoVerticalRatio] = useState(0.7);
    const [memoScheduleRatio, setMemoScheduleRatio] = useState(0.5);
    const [placeSearchRatio, setPlaceSearchRatio] = useState(0.1);
    const [memoDateRatio, setMemoDateRatio] = useState(0.15);

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
                    setSplitRatio(data.splitRatio || 0.5);
                    setPlaceTopRatio(data.placeTopRatio || 0.6);
                    setPlaceVerticalRatio(data.placeVerticalRatio || 0.5);
                    setMemoVerticalRatio(data.memoVerticalRatio || 0.7);
                    setMemoScheduleRatio(data.memoScheduleRatio || 0.5);
                    setPlaceSearchRatio(data.placeSearchRatio || 0.1);
                    setMemoDateRatio(data.memoDateRatio || 0.15);
                    if (data.mapState) setMapInfo({ ...data.mapState, isInitialized: true });
                    else setMapInfo(prev => ({ ...prev, isInitialized: true }));
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

    // 🌟 모든 업데이트 함수에 !isLoaded 가드 추가
    const addSavedPlace = async (place) => {
        if (!isLoaded) return;
        setSavedPlaces(prev => [place, ...prev]);
        await updateDoc(userDocRef, { savedPlaces: arrayUnion(place) });
    };

    const deleteSavedPlace = async (place) => {
        if (!isLoaded) return;
        setSavedPlaces(prev => prev.filter(p => p.id !== place.id));
        await updateDoc(userDocRef, { savedPlaces: arrayRemove(place) });
    };

    const updateSavedPlacesList = async (newList) => {
        if (!isLoaded) return;
        setSavedPlaces(newList);
        await updateDoc(userDocRef, { savedPlaces: newList });
    };

    const addSchedule = async (dateStr, schedule) => {
        if (!isLoaded) return;
        setSchedules(prev => ({
            ...prev,
            [dateStr]: [...(prev[dateStr] || []), schedule].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
        }));
        await updateDoc(userDocRef, { [`schedules.${dateStr}`]: arrayUnion(schedule) });
    };

    const deleteSchedule = async (dateStr, schedule) => {
        if (!isLoaded) return;
        setSchedules(prev => ({
            ...prev,
            [dateStr]: prev[dateStr].filter(s => s.id !== schedule.id)
        }));
        await updateDoc(userDocRef, { [`schedules.${dateStr}`]: arrayRemove(schedule) });
    };

    const saveDayMemo = async (dateStr, memo) => {
        if (!isLoaded) return;
        setDayMemos(prev => ({ ...prev, [dateStr]: memo }));
        await updateDoc(userDocRef, { [`dayMemos.${dateStr}`]: memo });
    };

    const toggleDatePlace = async (dateStr, placeId, currentList) => {
        if (!isLoaded) return;
        const newList = currentList.includes(placeId) ? currentList.filter(id => id !== placeId) : [...currentList, placeId];
        setDatePlaces(prev => ({ ...prev, [dateStr]: newList }));
        await updateDoc(userDocRef, { [`datePlaces.${dateStr}`]: newList });
    };

    const updateMapInfo = async (newMapState) => {
        if (!isLoaded) return;
        setMapInfo(newMapState);
        await updateDoc(userDocRef, { mapState: newMapState });
    };

    const updateLayout = async (key, ratio, isFinal = false) => {
        if (!isLoaded) return;
        const setters = {
            splitRatio: setSplitRatio,
            placeTopRatio: setPlaceTopRatio,
            placeVerticalRatio: setPlaceVerticalRatio,
            memoVerticalRatio: setMemoVerticalRatio,
            memoScheduleRatio: setMemoScheduleRatio,
            placeSearchRatio: setPlaceSearchRatio,
            memoDateRatio: setMemoDateRatio
        };
        if (setters[key]) setters[key](ratio);
        if (isFinal) await updateDoc(userDocRef, { [key]: ratio });
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
        layout: {
            splitRatio,
            placeTopRatio,
            placeVerticalRatio,
            memoVerticalRatio,
            memoScheduleRatio,
            placeSearchRatio,
            memoDateRatio
        },
        updateLayout,
        mapInfo,
        updateMapInfo
    };
}
