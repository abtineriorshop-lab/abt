// Firebase 설정
// 프로젝트: abtinterior
// 프로젝트 ID: abtinterior-ac593

const firebaseConfig = {
  apiKey: "AIzaSyB7gcCfdrQ2skD1t7b-9yJfIGIS6WhqWsg",
  authDomain: "abtinterior-ac593.firebaseapp.com",
  projectId: "abtinterior-ac593",
  storageBucket: "abtinterior-ac593.firebasestorage.app",
  messagingSenderId: "743772978162",
  appId: "1:743772978162:web:2699b1ee15f85d6db6c96b",
  measurementId: "G-PF3BM3XH97"
};

// window 객체에 노출 (다른 스크립트에서 사용 가능하도록)
window.firebaseConfig = firebaseConfig;

// Firebase 초기화 (compat 버전 사용)
function initializeFirebase() {
    // compat 버전에서는 firebase 네임스페이스 사용
    if (typeof window !== 'undefined' && typeof firebase !== 'undefined' && !window.firebaseInitialized) {
        try {
            const app = firebase.initializeApp(firebaseConfig);
            window.firebaseApp = app;
            window.firebaseDb = firebase.firestore();
            window.firebaseAuth = firebase.auth();
            window.firebaseInitialized = true;
            
            // 연결 상태 확인
            checkFirebaseConnection();
            
            console.log('✅ Firebase 초기화 완료');
            console.log('📊 프로젝트:', firebaseConfig.projectId);
            console.log('🔗 데이터베이스:', window.firebaseDb);
            
            // firebase-leads.js에 함수 노출
            if (window.saveLeadToFirebase === undefined) {
                window.saveLeadToFirebase = async (leadData) => {
                    try {
                        const docRef = await window.firebaseDb.collection('leads').add({
                            ...leadData,
                            createdAt: new Date().toISOString(),
                            status: 'new',
                            read: false,
                            updatedAt: new Date().toISOString()
                        });
                        console.log('✅ 문의가 Firebase에 저장되었습니다:', docRef.id);
                        return docRef.id;
                    } catch (error) {
                        console.error('❌ Firebase 저장 오류:', error);
                        throw error;
                    }
                };
            }
            
            // 연결 상태 표시 업데이트
            updateFirebaseStatusUI(true);
        } catch (error) {
            console.error('❌ Firebase 초기화 오류:', error);
            updateFirebaseStatusUI(false, error.message);
        }
    } else if (typeof window !== 'undefined' && typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase SDK가 로드되지 않았습니다.');
        updateFirebaseStatusUI(false, 'Firebase SDK 로드 실패');
    }
}

// Firebase 연결 상태 확인
async function checkFirebaseConnection() {
    if (!window.firebaseDb) {
        console.warn('⚠️ Firebase 데이터베이스가 초기화되지 않았습니다.');
        return false;
    }
    
    try {
        // 간단한 테스트 쿼리로 연결 확인
        const testQuery = window.firebaseDb.collection('leads').limit(1);
        await testQuery.get();
        console.log('✅ Firebase 연결 확인 완료');
        return true;
    } catch (error) {
        console.error('❌ Firebase 연결 확인 실패:', error);
        if (error.code === 'permission-denied') {
            console.warn('⚠️ Firestore 보안 규칙을 확인해주세요.');
        }
        return false;
    }
}

// Firebase 상태 UI 업데이트
function updateFirebaseStatusUI(isConnected, errorMessage = '') {
    // 관리자 페이지에 상태 표시
    if (document.getElementById('firebaseStatus')) {
        const statusEl = document.getElementById('firebaseStatus');
        if (isConnected) {
            statusEl.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Firebase 연결됨';
            statusEl.style.color = '#10b981';
        } else {
            statusEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> Firebase 연결 실패: ${errorMessage}`;
            statusEl.style.color = '#ef4444';
        }
    }
}

// Firebase SDK 로드 대기 및 초기화
(function() {
    // SDK가 이미 로드된 경우
    if (typeof firebase !== 'undefined') {
        initializeFirebase();
    } else {
        // SDK 로드를 기다림
        let checkCount = 0;
        const maxChecks = 50; // 5초 (50 * 100ms)
        
        const checkInterval = setInterval(() => {
            checkCount++;
            if (typeof firebase !== 'undefined') {
                clearInterval(checkInterval);
                initializeFirebase();
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                console.error('❌ Firebase SDK 로드 타임아웃');
                updateFirebaseStatusUI(false, 'SDK 로드 타임아웃');
            }
        }, 100);
    }
})();
