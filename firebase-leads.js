// Firebase 문의(Leads) 관리 함수

// Firebase 초기화 대기
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseInitialized && window.firebaseDb) {
            resolve(window.firebaseDb);
        } else {
            let attempts = 0;
            const maxAttempts = 50; // 5초 (50 * 100ms)
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.firebaseInitialized && window.firebaseDb) {
                    clearInterval(checkInterval);
                    resolve(window.firebaseDb);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Firebase 초기화 타임아웃');
                    resolve(null);
                }
            }, 100);
        }
    });
}

// 문의 저장
export async function saveLeadToFirebase(leadData) {
    try {
        const db = await waitForFirebase();
        if (!db) {
            console.warn('Firebase가 초기화되지 않았습니다. localStorage에만 저장됩니다.');
            return null;
        }

        const docRef = await db.collection('leads').add({
            ...leadData,
            createdAt: new Date().toISOString(),
            status: 'new',
            read: false,
            updatedAt: new Date().toISOString()
        });
        
        console.log('문의가 Firebase에 저장되었습니다:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Firebase 저장 오류:', error);
        throw error;
    }
}

// 문의 목록 가져오기
export async function getLeadsFromFirebase() {
    try {
        const db = await waitForFirebase();
        if (!db) {
            console.warn('Firebase가 초기화되지 않았습니다.');
            return [];
        }

        const querySnapshot = await db.collection('leads')
            .orderBy('createdAt', 'desc')
            .get();
        
        const leads = [];
        querySnapshot.forEach((doc) => {
            leads.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return leads;
    } catch (error) {
        console.error('Firebase 읽기 오류:', error);
        throw error;
    }
}

// 문의 상태 업데이트
export async function updateLeadStatus(leadId, status, notes = '') {
    try {
        const db = await waitForFirebase();
        if (!db) {
            console.warn('Firebase가 초기화되지 않았습니다.');
            return;
        }

        await db.collection('leads').doc(leadId).update({
            status: status,
            notes: notes,
            updatedAt: new Date().toISOString()
        });
        
        console.log('문의 상태가 업데이트되었습니다:', leadId);
    } catch (error) {
        console.error('Firebase 업데이트 오류:', error);
        throw error;
    }
}

// 문의 삭제
export async function deleteLeadFromFirebase(leadId) {
    try {
        const db = await waitForFirebase();
        if (!db) {
            console.warn('Firebase가 초기화되지 않았습니다.');
            return;
        }

        await db.collection('leads').doc(leadId).delete();
        console.log('문의가 Firebase에서 삭제되었습니다:', leadId);
    } catch (error) {
        console.error('Firebase 삭제 오류:', error);
        throw error;
    }
}

// 문의 읽음 처리
export async function markLeadAsRead(leadId) {
    try {
        const db = await waitForFirebase();
        if (!db) {
            return;
        }

        await db.collection('leads').doc(leadId).update({
            read: true,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Firebase 읽음 처리 오류:', error);
    }
}

