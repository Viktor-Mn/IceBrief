const params = new URLSearchParams(window.location.search)
const briefId = params.get('id')
const userToken = localStorage.getItem('token')

async function loadBrief() {
	const briefContainer = document.getElementById('brief')
	if (!briefId) return

	try {
		const response = await fetch(`/api/briefs/${briefId}`, {
			headers: { Authorization: 'Bearer ' + userToken },
		})
		const data = await response.json()

		if (!response.ok) {
			briefContainer.innerHTML = '<p>Бриф не знайдено.</p>'
			return
		}

		// Рендеринг усіх нових полів
		briefContainer.innerHTML = `
            <div class="brief-content">
                <div class="brief-header">
                    <h2 class="gradient-text">${data.projectName}</h2>
                    <span class="status-badge status-${data.status}">${data.status}</span>
                </div>

                <div class="brief-grid">
                    <div class="brief-section">
                        <h3>01. Контакти</h3>
                        <p><strong>Замовник:</strong> ${data.contactName}</p>
                        <p><strong>Телефон:</strong> ${data.phone}</p>
                        <p><strong>Email:</strong> ${data.contactEmail || '—'}</p>
                        <p><strong>Зв'язок:</strong> ${data.contactMethod} (${data.contactTime || 'будь-коли'})</p>
                    </div>

                    <div class="brief-section">
                        <h3>02. Суть проекту</h3>
                        <p><strong>Місія:</strong> ${data.projectEssence || '—'}</p>
                        <p><strong>УТП:</strong> ${data.usp || '—'}</p>
                        <p><strong>Цінності:</strong> ${data.values || '—'}</p>
                    </div>

                    <div class="brief-section">
                        <h3>03. Аудиторія</h3>
                        <p><strong>Ядро:</strong> ${data.targetAudience1 || '—'}</p>
                        <p><strong>Додаткові групи:</strong> ${data.targetAudience2 || '—'}</p>
                        <p><strong>Тип покупки:</strong> ${data.purchaseType === 'Simple' ? 'Проста' : 'Складна'}</p>
                    </div>

                    <div class="brief-section">
                        <h3>04. Технічні деталі</h3>
                        <p><strong>Тип сайту:</strong> ${data.siteType || '—'}</p>
                        <p><strong>Гео:</strong> ${data.geo || '—'}</p>
                        <p><strong>Структура:</strong> ${data.struct ? data.struct.join(', ') : 'Не вказано'}</p>
                        <p><strong>Дизайн:</strong> ${data.design ? data.design.join(', ') : 'Не вказано'}</p>
                    </div>
                </div>

                <div class="brief-footer">
                    <p><strong>Бюджет:</strong> ${data.budget || 'Обговорюється'}</p>
                    <p><strong>Терміни:</strong> ${data.timeline || 'Не вказано'}</p>
                </div>
            </div>
        `
	} catch (err) {
		console.error(err)
	}
}

document.addEventListener('DOMContentLoaded', loadBrief)
