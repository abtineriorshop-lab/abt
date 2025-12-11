const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/xwpgweje';
const LEAD_STORAGE_KEY = 'brightFutureLeads';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    prefillFormFromQuery(contactForm);
    handleContactForm(contactForm);
});

function prefillFormFromQuery(form) {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    const price = params.get('price');
    const category = params.get('category');

    if (product) {
        const messageField = form.querySelector('#message');
        if (messageField) {
            const existing = messageField.value ? `${messageField.value}\n\n` : '';
            messageField.value = `${existing}[제품 문의]\n제품명: ${product}${price ? `\n예상가: ${Number(price).toLocaleString()}원` : ''}\n카테고리: ${category || '미지정'}\n`;
        }
    }

    if (category) {
        const projectType = form.querySelector('#projectType');
        if (projectType) {
            projectType.value = category;
        }
    }
}

function handleContactForm(form) {
    const endpoint = form.dataset.endpoint || CONTACT_FORM_ENDPOINT;
    const submitButton = form.querySelector('.submit-btn');
    const crmEndpoint = form.dataset.crmEndpoint;
    const webhookEndpoint = form.dataset.webhook;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!endpoint) {
            showNotification('문의처가 설정되지 않았습니다. 관리자에게 문의해주세요.', 'error');
            return;
        }

        // reCAPTCHA 검증
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            showNotification('스팸 방지를 위해 reCAPTCHA를 완료해주세요.', 'error');
            return;
        }

        const formData = new FormData(form);
        formData.append('g-recaptcha-response', recaptchaResponse);
        const leadPayload = serializeLead(formData);
        toggleSubmitButton(submitButton, true);

        // Formspree 제출 시도 (실패해도 Firebase 저장은 계속 진행)
        let formspreeSuccess = false;
        try {
            await submitPrimaryEndpoint(endpoint, formData);
            formspreeSuccess = true;
            console.log('✅ Formspree 제출 성공');
        } catch (formspreeError) {
            console.warn('⚠️ Formspree 제출 실패 (Firebase 저장은 계속 진행):', formspreeError.message);
            // Formspree 실패해도 Firebase 저장은 계속 진행
        }
        
        // Firebase에만 저장 (localStorage 제거) - Formspree 성공/실패와 무관하게 실행
        try {
            // Firebase 초기화 대기 (최대 5초)
            let attempts = 0;
            while (!window.firebaseInitialized || !window.firebaseDb) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
                if (attempts > 50) { // 5초 타임아웃
                    throw new Error('Firebase 초기화 타임아웃');
                }
            }
            
            console.log('✅ Firebase 초기화 확인 완료');
            
            // firebase-leads.js의 함수가 있으면 사용, 없으면 직접 저장
            if (typeof window.saveLeadToFirebase === 'function') {
                const docId = await window.saveLeadToFirebase(leadPayload);
                console.log('✅ 문의가 Firebase에 저장되었습니다 (firebase-leads.js):', docId);
            } else {
                // 직접 Firebase에 저장
                const docRef = await window.firebaseDb.collection('leads').add({
                    ...leadPayload,
                    createdAt: new Date().toISOString(),
                    status: 'new',
                    read: false,
                    updatedAt: new Date().toISOString()
                });
                console.log('✅ 문의가 Firebase에 저장되었습니다 (직접 저장):', docRef.id);
            }
            
            // Firebase 저장 성공 후 추가 작업 (실패해도 무시)
            try {
                await Promise.all([
                    crmEndpoint ? sendLeadToEndpoint(crmEndpoint, leadPayload) : Promise.resolve(),
                    webhookEndpoint ? sendWebhook(webhookEndpoint, leadPayload) : Promise.resolve()
                ]);
            } catch (additionalError) {
                console.warn('⚠️ 추가 엔드포인트 전송 실패 (무시):', additionalError);
            }

            // Firebase 저장 성공 시 성공 메시지 표시
            showNotification('문의가 접수되었습니다. 24시간 내 회신 드리겠습니다.', 'success');
            form.reset();
        } catch (firebaseError) {
            console.error('❌ Firebase 저장 실패:', firebaseError);
            console.error('오류 상세:', firebaseError.code, firebaseError.message, firebaseError);
            if (firebaseError.code === 'permission-denied') {
                showNotification('Firestore 보안 규칙을 확인해주세요.', 'error');
            } else if (firebaseError.message === 'Firebase 초기화 타임아웃') {
                showNotification('Firebase 연결 시간이 초과되었습니다. 페이지를 새로고침해주세요.', 'error');
            } else {
                showNotification('문의 저장에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
            }
        } finally {
            toggleSubmitButton(submitButton, false);
        }
    });
}

async function submitPrimaryEndpoint(endpoint, formData) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Form submission failed');
    }
}

function serializeLead(formData) {
    const payload = {};
    formData.forEach((value, key) => {
        payload[key] = value;
    });
    payload.createdAt = new Date().toISOString();
    payload.page = window.location.pathname;
    return payload;
}

// localStorage 저장 제거 - Firebase만 사용
// function persistLeadLocally(lead) {
//     // Firebase만 사용하므로 제거됨
// }

async function sendLeadToEndpoint(url, payload) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('CRM 연동 실패');
        }
    } catch (error) {
        console.warn('CRM endpoint 전송 실패:', error);
    }
}

async function sendWebhook(url, payload) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: `새 문의가 접수되었습니다.\n이름: ${payload.name}\n연락처: ${payload.phone}\n프로젝트: ${payload.projectType}\n예산: ${payload.budget || '미입력'}\n페이지: ${payload.page}`,
                payload
            })
        });
        if (!response.ok) {
            throw new Error('Webhook 전송 실패');
        }
    } catch (error) {
        console.warn('Webhook 전송 실패:', error);
    }
}

function toggleSubmitButton(button, isLoading) {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> 전송 중...';
        button.disabled = true;
    } else {
        button.innerHTML = button.dataset.originalText || '<span>문의하기</span><i class="fas fa-paper-plane"></i>';
        button.disabled = false;
    }
}

