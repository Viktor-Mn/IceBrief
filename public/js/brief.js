import connectDB from '../../server/db.js'
import { ObjectId } from 'mongodb'
import auth from '../../server/middleware/auth.js'

export default async function handler(req, res) {
	const { id } = req.query
	const method = req.method
	const db = await connectDB()

	try {
		const user = auth(req)

		if (method === 'GET') {
			const brief = await db
				.collection('briefs')
				.findOne({ _id: new ObjectId(id) })
			if (!brief) return res.status(404).json({ error: 'Бриф не знайдено' })
			if (user.role !== 'admin' && brief.userId !== user.id)
				return res.status(403).json({ error: 'Доступ заборонено' })
			return res.json(brief)
		}

		if (method === 'PUT') {
			const updated = req.body
			await db
				.collection('briefs')
				.updateOne({ _id: new ObjectId(id) }, { $set: updated })
			return res.json({ message: 'Бриф оновлено' })
		}

		if (method === 'DELETE') {
			if (user.role !== 'admin')
				return res.status(403).json({ error: 'Доступ заборонено' })
			await db.collection('briefs').deleteOne({ _id: new ObjectId(id) })
			return res.json({ message: 'Видалено' })
		}

		res.status(405).end()
	} catch (err) {
		res
			.status(err.status || 500)
			.json({ error: err.error || err.message || 'Помилка сервера' })
	}
}

const params = new URLSearchParams(window.location.search)
const briefId = params.get('id')
const token = localStorage.getItem('token')
const role = localStorage.getItem('role')

const briefContainer = document.getElementById('brief')
const adminControls = document.getElementById('admin-controls')
const editBtn = document.getElementById('edit-btn')
const saveBtn = document.getElementById('save-btn')
const cancelBtn = document.getElementById('cancel-btn')
let originalHTML = ''

const labelToKey = {
	Замовник: 'contactName',
	Телефон: 'phone',
	Email: 'contactEmail',
	"Зв'язок": 'contactMethod',
	Місія: 'projectEssence',
	УТП: 'usp',
	Цінності: 'values',
	Ядро: 'targetAudience1',
	'Додаткові групи': 'targetAudience2',
	'Тип покупки': 'purchaseType',
	'Тип сайту': 'siteType',
	Гео: 'geo',
	Структура: 'struct',
	Дизайн: 'design',
	Бюджет: 'budget',
	Терміни: 'timeline',
	'Рішення приймає': 'decisionMaker',
	'Додаткова інформація': 'extraInfo',
	Інновації: 'innovation',
	'Посилання конкурентів': 'competitorLinks',
	'Аналіз конкурентів': 'competitorAnalysis',
	'Хостинг потрібен': 'hostingNeeded',
	'Домен потрібен': 'domainNeeded',
	Подобається: 'likes',
	'Не подобається': 'dislikes',
}

async function loadBrief() {
	if (!briefId) return
	try {
		const res = await fetch(`/api/briefs/${briefId}`, {
			headers: { Authorization: 'Bearer ' + token },
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

document.addEventListener('DOMContentLoaded', () => {
	loadBrief()

	if (role === 'admin' && adminControls) {
		adminControls.classList.remove('hidden')
	}
})

editBtn?.addEventListener('click', () => {
	originalHTML = briefContainer.innerHTML
	const fields = briefContainer.querySelectorAll('.brief-section p')

	fields.forEach(p => {
		const label = p.querySelector('label')
		const valueText = p.innerText.replace(label.innerText, '').trim()
		const parent = p

		const inputElement =
			valueText.length > 60
				? document.createElement('textarea')
				: document.createElement('input')
		inputElement.value = valueText === '—' ? '' : valueText
		inputElement.className = 'edit-input'
		parent.innerHTML = ''
		parent.appendChild(label)
		parent.appendChild(inputElement)
	})

	editBtn.classList.add('hidden')
	saveBtn.classList.remove('hidden')
	cancelBtn.classList.remove('hidden')
})

cancelBtn?.addEventListener('click', () => {
	briefContainer.innerHTML = originalHTML
	editBtn.classList.remove('hidden')
	saveBtn.classList.add('hidden')
	cancelBtn.classList.add('hidden')
})

saveBtn?.addEventListener('click', async () => {
	const inputs = briefContainer.querySelectorAll('.edit-input')
	const updatedData = {}

	inputs.forEach(input => {
		const label = input.parentElement.querySelector('label')
		if (label) {
			const key = labelToKey[label.innerText.replace(':', '').trim()]
			if (key) updatedData[key] = input.value
		}
	})

	try {
		const res = await fetch(`/api/briefs/${briefId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token,
			},
			body: JSON.stringify(updatedData),
		})

		if (res.ok) {
			alert('Зміни успішно збережено!')
			loadBrief()
			editBtn.classList.remove('hidden')
			saveBtn.classList.add('hidden')
			cancelBtn.classList.add('hidden')
		} else {
			const err = await res.json()
			alert('Помилка збереження: ' + err.error)
		}
	} catch (err) {
		console.error('Помилка мережі:', err)
	}
})
