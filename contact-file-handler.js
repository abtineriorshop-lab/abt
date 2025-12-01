// 파일 첨부 처리
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('attachments');
    const fileList = document.getElementById('fileList');
    let selectedFiles = [];

    if (!fileInput || !fileList) return;

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // 파일 크기 검증 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification(`파일 "${file.name}"의 크기가 10MB를 초과합니다.`, 'error');
                return;
            }

            // 파일 타입 검증
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                                  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                showNotification(`파일 "${file.name}"은(는) 지원되지 않는 형식입니다.`, 'error');
                return;
            }

            selectedFiles.push(file);
            displayFile(file);
        });

        // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
        fileInput.value = '';
    });

    function displayFile(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileName = file.name;
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <span class="file-item-name">
                <i class="fas fa-file" style="margin-right: 8px; color: #667eea;"></i>
                ${file.name}
            </span>
            <span class="file-item-size">${fileSize}</span>
            <button type="button" class="file-item-remove" onclick="removeFile('${file.name}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        fileList.appendChild(fileItem);
    }

    window.removeFile = function(fileName) {
        selectedFiles = selectedFiles.filter(f => f.name !== fileName);
        const fileItem = fileList.querySelector(`[data-file-name="${fileName}"]`);
        if (fileItem) {
            fileItem.remove();
        }
    };

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // 폼 제출 시 파일 추가
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            // FormData에 파일 추가
            const formData = new FormData(form);
            selectedFiles.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
        });
    }
});

