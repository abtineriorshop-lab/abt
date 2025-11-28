const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/xoqgwvvy';
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

        const formData = new FormData(form);
        const leadPayload = serializeLead(formData);
        toggleSubmitButton(submitButton, true);

        try {
            await submitPrimaryEndpoint(endpoint, formData);
            persistLeadLocally(leadPayload);
            await Promise.all([
                crmEndpoint ? sendLeadToEndpoint(crmEndpoint, leadPayload) : Promise.resolve(),
                webhookEndpoint ? sendWebhook(webhookEndpoint, leadPayload) : Promise.resolve()
            ]);

            showNotification('문의가 접수되었습니다. 24시간 내 회신 드립니다.', 'success');
            form.reset();
        } catch (error) {
            console.error(error);
            showNotification('제출 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
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

function persistLeadLocally(lead) {
    try {
        const existing = JSON.parse(localStorage.getItem(LEAD_STORAGE_KEY) || '[]');
        existing.unshift(lead);
        localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch (error) {
        console.error('로컬 리드 저장 실패:', error);
    }
}

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

