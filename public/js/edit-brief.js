// Отримуємо дані з localStorage, які завантажив brief.js
const token = localStorage.getItem('token')
const role = localStorage.getItem('role')
const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get('id')

// Елементи керування
const adminControls = document.getElementById('admin-controls')
const editBtn = document.getElementById('edit-btn')
const saveBtn = document.getElementById('save-btn')
const cancelBtn = document.getElementById('cancel-btn')
const briefContainer = document.getElementById('brief')

// 1. Ініціалізація кнопок (тільки для адміна)
document.addEventListener('DOMContentLoaded', () => {
	if (role === 'admin' && adminControls) {
		adminControls.classList.remove('hidden')
	}
})

let originalHTML = '' // Для скасування змін

// 2. Логіка переходу в режим редагування
editBtn?.addEventListener('click', () => {
	originalHTML = briefContainer.innerHTML // Зберігаємо старий вигляд

	// Знаходимо всі описові абзаци <p> всередині секцій брифу
	const fields = briefContainer.querySelectorAll('.brief-section p')

	fields.forEach(p => {
		const currentText = p.innerText.trim()
		const parent = p.parentElement

		// Визначаємо тип поля (input для коротких, textarea для довгих)
		if (currentText.length > 60 || parent.classList.contains('full-width')) {
			const textarea = document.createElement('textarea')
			textarea.value = currentText === '—' ? '' : currentText // Прибираємо прочерк
			textarea.className = 'edit-input' // Стиль для редагування
			parent.replaceChild(textarea, p)
		} else {
			const input = document.createElement('input')
			input.type = 'text'
			input.value = currentText === '—' ? '' : currentText
			input.className = 'edit-input'
			parent.replaceChild(input, p)
		}
	})

	// Перемикаємо кнопки
	editBtn.classList.add('hidden')
	saveBtn.classList.remove('hidden')
	cancelBtn.classList.remove('hidden')
})

// 3. Логіка скасування змін
cancelBtn?.addEventListener('click', () => {
	briefContainer.innerHTML = originalHTML // Повертаємо старий HTML

	// Перемикаємо кнопки назад
	editBtn.classList.remove('hidden')
	saveBtn.classList.add('hidden')
	cancelBtn.classList.add('hidden')
})

// 4. Логіка збереження
saveBtn?.addEventListener('click', async () => {
	// Збираємо дані з усіх інпутів
	const inputs = briefContainer.querySelectorAll('.edit-input')
	const updatedData = {}

	inputs.forEach(input => {
		// Знаходимо назву поля з сусіднього <label>
		const label = input.parentElement.querySelector('label')
		if (label) {
			// Перетворюємо текст лейбла на ключ для бази (напр. "Суть проекту" -> "projectEssence")
			const key = label.innerText.replace(':', '').trim()
			updatedData[key] = input.value
		}
	})

	try {
		const res = await fetch(`/api/briefs/${id}`, {
			method: 'PUT', // Використовуємо існуючий PUT роут
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token,
			},
			body: JSON.stringify(updatedData),
		})

		if (res.ok) {
			alert('Зміни успішно збережено!')
			location.reload() // Перезавантажуємо сторінку для перегляду
		} else {
			const err = await res.json()
			alert('Помилка збереження: ' + err.error)
		}
	} catch (err) {
		console.error('Помилка мережі:', err)
	}
})
