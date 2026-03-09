
const role = localStorage.getItem('role')
const userRaw = localStorage.getItem('user')
const user = userRaw ? JSON.parse(userRaw) : null
let briefs = []

async function loadAdminBriefs() {
	const token = localStorage.getItem('token')
	try {
		const res = await fetch('/api/briefs', {
			headers: { Authorization: 'Bearer ' + token },
		})

		if (!res.ok) {
			if (res.status === 403 || res.status === 401) {
				alert('Немає прав доступу!')
				location.href = '/login.html'
			}
			return
		}

		briefs = await res.json()
		renderAdmin(briefs)
	} catch (err) {
		console.error('Помилка мережі:', err)
	}
}

function renderAdmin(data) {
	const tbody = document.getElementById('admin-list')
	if (!tbody) return

	tbody.innerHTML = ''

	data.forEach(b => {
		const tr = document.createElement('tr')
		tr.innerHTML = `
    <td>
        ${b.projectName}
        <br><span class="status-badge status-${b.status || 'new'}">${b.status || 'новий'}</span>
    </td>
    <td>${new Date(b.createdAt).toLocaleDateString()}</td>
    <td>
        <select class="status-select" onchange="updateStatus('${b._id}', this.value)">
            <option value="new" ${b.status === 'new' ? 'selected' : ''}>Новий</option>
            <option value="process" ${b.status === 'process' ? 'selected' : ''}>В роботі</option>
            <option value="done" ${b.status === 'done' ? 'selected' : ''}>Завершено</option>
        </select>
        <a href="/brief.html?id=${b._id}" class="btn-glass">Переглянути</a>
        <button class="btn delete-btn" data-id="${b._id}" style="background:var(--error)">×</button>
    </td>
`
		tbody.appendChild(tr)
	})

	document.querySelectorAll('.delete-btn').forEach(btn => {
		btn.onclick = async () => {
			if (!confirm('Видалити цей бриф?')) return
			const token = localStorage.getItem('token')
			const res = await fetch('/api/briefs/' + btn.dataset.id, {
				method: 'DELETE',
				headers: { Authorization: 'Bearer ' + token },
			})
			if (res.ok) loadAdminBriefs()
		}
	})
}

if (document.getElementById('admin-list')) {
	if (role !== 'admin') {
		alert('Доступ лише для адмінів!')
		location.href = '/login.html'
	} else {
		loadAdminBriefs()
	}
}

document.getElementById('search')?.addEventListener('input', e => {
	const term = e.target.value.toLowerCase()
	const filtered = briefs.filter(b =>
		b.projectName.toLowerCase().includes(term),
	)
	renderAdmin(filtered)
})

async function updateStatus(id, newStatus) {
	const token = localStorage.getItem('token')
	try {
		const res = await fetch(`/api/briefs/${id}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token,
			},
			body: JSON.stringify({ status: newStatus }),
		})

		if (res.ok) {
			loadAdminBriefs()
		} else {
			const errorData = await res.json().catch(() => ({}))
			alert('Не вдалося оновити статус: ' + (errorData.error || res.statusText))
		}
	} catch (err) {
		console.error('Помилка мережі:', err)
		alert('Помилка з\'єднання з сервером при оновленні статусу')
	}
}
