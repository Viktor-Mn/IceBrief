// Отримуємо id брифу з URL
const params = new URLSearchParams(window.location.search)
const briefId = params.get('id')

// Токен і роль користувача
const token = localStorage.getItem('token')
const role = localStorage.getItem('role')

// Елементи DOM
const briefContainer = document.getElementById('brief')
const adminControls = document.getElementById('admin-controls')
const editBtn = document.getElementById('edit-btn')
const saveBtn = document.getElementById('save-btn')
const cancelBtn = document.getElementById('cancel-btn')

let originalHTML = '' // Для скасування змін

// Мапа label → ключ MongoDB
const labelToKey = {
    "Замовник": "contactName",
    "Телефон": "phone",
    "Email": "contactEmail",
    "Зв'язок": "contactMethod",
    "Місія": "projectEssence",
    "УТП": "usp",
    "Цінності": "values",
    "Ядро": "targetAudience1",
    "Додаткові групи": "targetAudience2",
    "Тип покупки": "purchaseType",
    "Тип сайту": "siteType",
    "Гео": "geo",
    "Структура": "struct",
    "Дизайн": "design",
    "Бюджет": "budget",
    "Терміни": "timeline",
    "Рішення приймає": "decisionMaker",
    "Додаткова інформація": "extraInfo",
    "Інновації": "innovation",
    "Посилання конкурентів": "competitorLinks",
    "Аналіз конкурентів": "competitorAnalysis",
    "Хостинг потрібен": "hostingNeeded",
    "Домен потрібен": "domainNeeded",
    "Подобається": "likes",
    "Не подобається": "dislikes"
}

// ------------------ Функція завантаження брифу ------------------
async function loadBrief() {
    if (!briefId) return

    try {
        const res = await fetch(`/api/briefs/${briefId}`, {
            headers: { Authorization: 'Bearer ' + token }
        })
        const data = await res.json()
        if (!res.ok) {
            briefContainer.innerHTML = '<p>Бриф не знайдено.</p>'
            return
        }

        briefContainer.innerHTML = `
            <div class="brief-content">
                <div class="brief-header">
                    <h2 class="gradient-text">${data.projectName}</h2>
                    <span class="status-badge status-${data.status}">${data.status}</span>
                </div>

                <div class="brief-grid">
                    <div class="brief-section">
                        <h3>01. Контакти</h3>
                        <p><label>Замовник:</label> ${data.contactName}</p>
                        <p><label>Телефон:</label> ${data.phone}</p>
                        <p><label>Email:</label> ${data.contactEmail || '—'}</p>
                        <p><label>Зв'язок:</label> ${data.contactMethod} (${data.contactTime || 'будь-коли'})</p>
                    </div>

                    <div class="brief-section">
                        <h3>02. Суть проекту</h3>
                        <p><label>Місія:</label> ${data.projectEssence || '—'}</p>
                        <p><label>УТП:</label> ${data.usp || '—'}</p>
                        <p><label>Цінності:</label> ${data.values || '—'}</p>
                    </div>

                    <div class="brief-section">
                        <h3>03. Аудиторія</h3>
                        <p><label>Ядро:</label> ${data.targetAudience1 || '—'}</p>
                        <p><label>Додаткові групи:</label> ${data.targetAudience2 || '—'}</p>
                        <p><label>Тип покупки:</label> ${data.purchaseType === 'Simple' ? 'Проста' : 'Складна'}</p>
                    </div>

                    <div class="brief-section">
                        <h3>04. Технічні деталі</h3>
                        <p><label>Тип сайту:</label> ${data.siteType || '—'}</p>
                        <p><label>Гео:</label> ${data.geo || '—'}</p>
                        <p><label>Структура:</label> ${data.struct ? data.struct.join(', ') : 'Не вказано'}</p>
                        <p><label>Дизайн:</label> ${data.design ? data.design.join(', ') : 'Не вказано'}</p>
                    </div>
                </div>

                <div class="brief-footer">
                    <p><label>Бюджет:</label> ${data.budget || 'Обговорюється'}</p>
                    <p><label>Терміни:</label> ${data.timeline || 'Не вказано'}</p>
                </div>
            </div>
        `
    } catch (err) {
        console.error(err)
    }
}

// ------------------ Логіка редагування ------------------
function enableAdminControls() {
    if (role !== 'admin' || !adminControls) return
    adminControls.classList.remove('hidden')

    editBtn.addEventListener('click', () => {
        originalHTML = briefContainer.innerHTML

        const fields = briefContainer.querySelectorAll('.brief-section p')
        fields.forEach(p => {
            const label = p.querySelector('label')
            const value = p.innerText.replace(label.innerText, '').trim()
            const input = document.createElement('input')
            input.type = 'text'
            input.value = value === '—' ? '' : value
            input.dataset.key = labelToKey[label.innerText.replace(':', '')] || ''
            input.className = 'edit-input'
            p.innerHTML = ''
            p.appendChild(input)
        })

        editBtn.classList.add('hidden')
        saveBtn.classList.remove('hidden')
        cancelBtn.classList.remove('hidden')
    })

    cancelBtn.addEventListener('click', () => {
        briefContainer.innerHTML = originalHTML
        editBtn.classList.remove('hidden')
        saveBtn.classList.add('hidden')
        cancelBtn.classList.add('hidden')
    })

    saveBtn.addEventListener('click', async () => {
        const inputs = briefContainer.querySelectorAll('.edit-input')
        const updatedData = {}
        inputs.forEach(input => {
            if (input.dataset.key) {
                updatedData[input.dataset.key] = input.value
            }
        })

        try {
            const res = await fetch(`/api/briefs/${briefId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                },
                body: JSON.stringify(updatedData)
            })

            if (res.ok) {
                alert('Зміни збережено!')
                loadBrief() // Перезавантажуємо бриф
                editBtn.classList.remove('hidden')
                saveBtn.classList.add('hidden')
                cancelBtn.classList.add('hidden')
            } else {
                const err = await res.json()
                alert('Помилка: ' + err.error)
            }
        } catch (err) {
            console.error(err)
            alert('Помилка мережі')
        }
    })
}

// ------------------ Старт ------------------
document.addEventListener('DOMContentLoaded', () => {
    loadBrief()
    enableAdminControls()
})