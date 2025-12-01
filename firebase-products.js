// Firebase 제품 데이터 관리

// Firebase 초기화 대기
async function waitForFirebase() {
    let attempts = 0;
    while (!window.firebaseInitialized || !window.firebaseDb) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        if (attempts > 50) {
            throw new Error('Firebase 초기화 타임아웃');
        }
    }
    return window.firebaseDb;
}

// 제품 데이터를 Firebase에 저장
async function saveProductsToFirebase(products) {
    try {
        const db = await waitForFirebase();
        
        // products 컬렉션에 저장
        const batch = db.batch();
        const productsRef = db.collection('products');
        
        products.forEach(product => {
            const docRef = productsRef.doc(product.id);
            batch.set(docRef, {
                ...product,
                updatedAt: new Date().toISOString(),
                synced: true
            }, { merge: true });
        });
        
        await batch.commit();
        console.log('✅ 제품 데이터가 Firebase에 저장되었습니다.');
        return true;
    } catch (error) {
        console.error('❌ Firebase 제품 저장 오류:', error);
        throw error;
    }
}

// Firebase에서 제품 데이터 불러오기
async function loadProductsFromFirebase() {
    try {
        const db = await waitForFirebase();
        const snapshot = await db.collection('products').get();
        
        if (snapshot.empty) {
            console.log('⚠️ Firebase에 제품 데이터가 없습니다.');
            return null;
        }
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Firebase에서 ${products.length}개의 제품을 불러왔습니다.`);
        return products;
    } catch (error) {
        console.error('❌ Firebase 제품 로드 오류:', error);
        throw error;
    }
}

// 제품 카테고리별로 Firebase에 저장
async function saveProductsByCategoryToFirebase(category, products) {
    try {
        const db = await waitForFirebase();
        
        const batch = db.batch();
        const categoryRef = db.collection('products').doc(category);
        
        batch.set(categoryRef, {
            category: category,
            products: products,
            updatedAt: new Date().toISOString(),
            count: products.length
        }, { merge: true });
        
        await batch.commit();
        console.log(`✅ ${category} 카테고리 제품이 Firebase에 저장되었습니다.`);
        return true;
    } catch (error) {
        console.error(`❌ ${category} 카테고리 제품 저장 오류:`, error);
        throw error;
    }
}

// Firebase에서 카테고리별 제품 불러오기
async function loadProductsByCategoryFromFirebase(category) {
    try {
        const db = await waitForFirebase();
        const doc = await db.collection('products').doc(category).get();
        
        if (!doc.exists) {
            console.log(`⚠️ Firebase에 ${category} 카테고리 데이터가 없습니다.`);
            return null;
        }
        
        const data = doc.data();
        console.log(`✅ Firebase에서 ${category} 카테고리 ${data.count}개의 제품을 불러왔습니다.`);
        return data.products || [];
    } catch (error) {
        console.error(`❌ ${category} 카테고리 제품 로드 오류:`, error);
        throw error;
    }
}

// 대표 제품을 Firebase에 저장
async function saveFeaturedProductsToFirebase(featuredProducts) {
    try {
        const db = await waitForFirebase();
        
        await db.collection('products').doc('featured').set({
            products: featuredProducts,
            updatedAt: new Date().toISOString(),
            count: featuredProducts.length
        }, { merge: true });
        
        console.log('✅ 대표 제품이 Firebase에 저장되었습니다.');
        return true;
    } catch (error) {
        console.error('❌ Firebase 대표 제품 저장 오류:', error);
        throw error;
    }
}

// Firebase에서 대표 제품 불러오기
async function loadFeaturedProductsFromFirebase() {
    try {
        const db = await waitForFirebase();
        const doc = await db.collection('products').doc('featured').get();
        
        if (!doc.exists) {
            console.log('⚠️ Firebase에 대표 제품 데이터가 없습니다.');
            return null;
        }
        
        const data = doc.data();
        console.log(`✅ Firebase에서 ${data.count}개의 대표 제품을 불러왔습니다.`);
        return data.products || [];
    } catch (error) {
        console.error('❌ Firebase 대표 제품 로드 오류:', error);
        throw error;
    }
}

// 제품 동기화 (Firebase와 LocalStorage)
async function syncProductsWithFirebase() {
    try {
        // Firebase에서 먼저 시도
        const firebaseProducts = await loadProductsFromFirebase();
        
        if (firebaseProducts && firebaseProducts.length > 0) {
            // Firebase 데이터를 LocalStorage에 백업
            localStorage.setItem('brightFutureProducts', JSON.stringify(firebaseProducts));
            localStorage.setItem('brightFutureProductsSync', new Date().toISOString());
            return firebaseProducts;
        }
        
        // Firebase에 데이터가 없으면 LocalStorage에서 로드
        const localProducts = localStorage.getItem('brightFutureProducts');
        if (localProducts) {
            const parsed = JSON.parse(localProducts);
            // LocalStorage 데이터를 Firebase에 동기화
            await saveProductsToFirebase(parsed);
            return parsed;
        }
        
        return null;
    } catch (error) {
        console.warn('⚠️ 제품 동기화 오류, LocalStorage 사용:', error);
        const localProducts = localStorage.getItem('brightFutureProducts');
        return localProducts ? JSON.parse(localProducts) : null;
    }
}

// 전역 함수로 노출
window.saveProductsToFirebase = saveProductsToFirebase;
window.loadProductsFromFirebase = loadProductsFromFirebase;
window.saveProductsByCategoryToFirebase = saveProductsByCategoryToFirebase;
window.loadProductsByCategoryFromFirebase = loadProductsByCategoryFromFirebase;
window.saveFeaturedProductsToFirebase = saveFeaturedProductsToFirebase;
window.loadFeaturedProductsFromFirebase = loadFeaturedProductsFromFirebase;
window.syncProductsWithFirebase = syncProductsWithFirebase;

