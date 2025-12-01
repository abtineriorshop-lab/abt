// Firebase 인증 관리

// Firebase 초기화 대기
async function waitForFirebaseAuth() {
    let attempts = 0;
    while (!window.firebaseInitialized || !window.firebaseAuth) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        if (attempts > 50) {
            throw new Error('Firebase Auth 초기화 타임아웃');
        }
    }
    return window.firebaseAuth;
}

// 관리자 로그인
async function loginAdmin(email, password) {
    try {
        // Firebase Auth 시도
        try {
            const auth = await waitForFirebaseAuth();
            
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // 사용자 정보를 토큰으로 저장
            const token = await user.getIdToken();
            sessionStorage.setItem('adminToken', token);
            sessionStorage.setItem('adminEmail', user.email);
            sessionStorage.setItem('adminUid', user.uid);
            sessionStorage.setItem('adminLoggedIn', 'true');
            
            // 로그인 상태를 Firebase에 기록
            if (window.firebaseDb) {
                try {
                    await window.firebaseDb.collection('admin_logs').add({
                        action: 'login',
                        email: user.email,
                        uid: user.uid,
                        timestamp: new Date().toISOString(),
                        ip: await getClientIP()
                    });
                } catch (logError) {
                    console.warn('로그 기록 실패 (무시):', logError);
                }
            }
            
            console.log('✅ 관리자 로그인 성공 (Firebase Auth):', user.email);
            return user;
        } catch (firebaseError) {
            // Firebase Auth 실패 시 폴백 인증 (개발/테스트용)
            console.warn('⚠️ Firebase Auth 실패, 폴백 인증 시도:', firebaseError);
            
            // 기본 관리자 계정 (개발/테스트용)
            const fallbackAccounts = {
                'admin@brightfuture.kr': 'admin123',
                'admin': 'admin123'
            };
            
            // 이메일 형식이 아니면 사용자명으로 처리
            const loginKey = email.includes('@') ? email : email.toLowerCase();
            const validPassword = fallbackAccounts[loginKey] || fallbackAccounts[email.toLowerCase()];
            
            if (validPassword && password === validPassword) {
                // 폴백 인증 성공
                sessionStorage.setItem('adminEmail', email);
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminFallback', 'true'); // 폴백 인증 표시
                
                console.log('✅ 관리자 로그인 성공 (폴백 인증):', email);
                return {
                    email: email,
                    uid: 'fallback-' + Date.now()
                };
            } else {
                throw firebaseError; // 원래 Firebase 오류를 다시 던짐
            }
        }
    } catch (error) {
        console.error('❌ 관리자 로그인 오류:', error);
        
        let errorMessage = '로그인에 실패했습니다.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = '등록되지 않은 이메일입니다.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = '비밀번호가 올바르지 않습니다.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '이메일 형식이 올바르지 않습니다.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message && error.message.includes('Firebase')) {
            // Firebase 초기화 오류인 경우 폴백 안내
            errorMessage = 'Firebase 연결 실패. 개발 모드로 로그인을 시도합니다.';
        }
        
        throw new Error(errorMessage);
    }
}

// 관리자 로그아웃
async function logoutAdmin() {
    try {
        const auth = await waitForFirebaseAuth();
        
        // 로그아웃 전에 로그 기록 (실패해도 로그아웃은 계속 진행)
        const email = sessionStorage.getItem('adminEmail');
        if (window.firebaseDb && email) {
            try {
                await window.firebaseDb.collection('admin_logs').add({
                    action: 'logout',
                    email: email,
                    timestamp: new Date().toISOString()
                });
            } catch (logError) {
                // 로그 기록 실패는 무시
                console.warn('⚠️ 로그아웃 로그 기록 실패 (무시):', logError);
            }
        }
        
        await auth.signOut();
        
        // 세션 스토리지 정리
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminEmail');
        sessionStorage.removeItem('adminUid');
        sessionStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        
        console.log('✅ 관리자 로그아웃 완료');
        return true;
    } catch (error) {
        console.error('❌ 관리자 로그아웃 오류:', error);
        throw error;
    }
}

// 현재 로그인 상태 확인
async function checkAdminAuth() {
    try {
        const auth = await waitForFirebaseAuth();
        const user = auth.currentUser;
        
        if (user) {
            // 토큰 갱신
            const token = await user.getIdToken();
            sessionStorage.setItem('adminToken', token);
            sessionStorage.setItem('adminEmail', user.email);
            sessionStorage.setItem('adminUid', user.uid);
            sessionStorage.setItem('adminLoggedIn', 'true');
            return user;
        }
        
        // 세션 스토리지에서 확인 (Firebase Auth가 초기화되지 않은 경우)
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            // 토큰 검증 (간단한 확인)
            return {
                email: sessionStorage.getItem('adminEmail'),
                uid: sessionStorage.getItem('adminUid')
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ 인증 상태 확인 오류:', error);
        return null;
    }
}

// 인증 상태 리스너
function onAuthStateChanged(callback) {
    waitForFirebaseAuth().then(auth => {
        auth.onAuthStateChanged(callback);
    });
}

// 클라이언트 IP 가져오기 (간단한 방법)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// 관리자 권한 확인
async function checkAdminPermission() {
    try {
        const user = await checkAdminAuth();
        if (!user) {
            return false;
        }
        
        // Firebase에서 관리자 권한 확인
        if (window.firebaseDb) {
            const adminDoc = await window.firebaseDb.collection('admins').doc(user.uid || user.email).get();
            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                return adminData.role === 'admin' && adminData.active === true;
            }
        }
        
        // 기본적으로 로그인된 사용자는 관리자로 간주 (개발 단계)
        return true;
    } catch (error) {
        console.error('❌ 권한 확인 오류:', error);
        return false;
    }
}

// 전역 함수로 노출
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.checkAdminAuth = checkAdminAuth;
window.onAuthStateChanged = onAuthStateChanged;
window.checkAdminPermission = checkAdminPermission;

