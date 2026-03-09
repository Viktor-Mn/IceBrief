const token = localStorage.getItem('token')
const role = localStorage.getItem('role')
const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get('id')

const adminControls = document.getElementById('admin-controls')
const editBtn = document.getElementById('edit-btn')
const saveBtn = document.getElementById('save-btn')
const cancelBtn = document.getElementById('cancel-btn')
const briefContainer = document.getElementById('brief')

document.addEventListener('DOMContentLoaded', () => {
    if (role === 'admin' && adminControls) {
        adminControls.classList.remove('hidden')
    }
})

const labelToKey = {
    'Замовник': 'contactName',
    'Телефон': 'phone',
    'Email': 'contactEmail',
    "Зв'язок": 'contactMethod',
    'Місія': 'projectEssence',
    'УТП': 'usp',
    'Цінності': 'values',
    'Ядро': 'targetAudience1',
    'Додаткові групи': 'targetAudience2',
    'Тип покупки': 'purchaseType',
    'Тип сайту': 'siteType',
    'Гео': 'geo',
    'Структура': 'struct',
    'Дизайн': 'design',
    'Бюджет': 'budget',
    'Терміни': 'timeline'
}

let originalHTML = ''

editBtn?.addEventListener('click', () => {
    originalHTML = briefContainer.innerHTML

    const fields = briefContainer.querySelectorAll('.brief-section p')

    fields.forEach(p => {
        const currentText = p.innerText.trim()
        const parent = p.parentElement

        const inputType = currentText.length > 60 || parent.classList.contains('full-width') ? 'textarea' : 'input'
        const newInput = document.createElement(inputType)
        newInput.className = 'edit-input'

        if (inputType === 'textarea') {
            newInput.value = currentText === '—' ? '' : currentText
        } else {
            newInput.type = 'text'
            newInput.value = currentText === '—' ? '' : currentText
        }

        parent.replaceChild(newInput, p)
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
        if (!label) return

        const key = labelToKey[label.innerText.replace(':', '').trim()]
        if (!key) return

        let value = input.value.trim()
        if (value === '') value = null

        if (key === 'struct' || key === 'design') {
            updatedData[key] = value ? value.split(',').map(s => s.trim()) : []
        } else {
            updatedData[key] = value
        }
    })

    try {
        const res = await fetch(`/api/briefs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify(updatedData)
        })

        if (res.ok) {
            alert('Зміни успішно збережено!')
            location.reload()
        } else {
            const err = await res.json()
            alert('Помилка збереження: ' + err.error)
        }
    } catch (err) {
        console.error('Помилка мережі:', err)
        alert('Помилка мережі при оновленні брифу')
    }
})